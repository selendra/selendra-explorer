use blockscan_model::extrinsic::{CallInfo, ExtrinsicDetails, SignatureInfo};
use codec::Encode;
use custom_error::ServiceError;
use substrate_api_client::ac_primitives::{BlakeTwo256, Block, Header, OpaqueExtrinsic};

// Constants for better maintainability
const SIGNER_BYTES: usize = 32;
const SIGNATURE_BYTES: usize = 64;
const EVM_ADDRESS_BYTES: usize = 20;
const VALUE_BYTES: usize = 32;
const GAS_LIMIT_BYTES: usize = 8;
const MIN_SEARCH_OFFSET: usize = 50;

// Pallet indices for Selendra
mod pallet_indices {
    pub const SYSTEM: u8 = 0;
    pub const TIMESTAMP: u8 = 3;
    pub const BALANCES: u8 = 4;
    pub const STAKING: u8 = 11;
    pub const ETHEREUM: u8 = 80;
    pub const EVM: u8 = 81;
}

pub struct ExtrinsicInfo {
    pub block: Block<Header<u32, BlakeTwo256>, OpaqueExtrinsic>,
}

impl ExtrinsicInfo {
    #[inline]
    pub const fn new(block: Block<Header<u32, BlakeTwo256>, OpaqueExtrinsic>) -> Self {
        Self { block }
    }

    pub async fn get_extrinsics(&self) -> Result<Vec<ExtrinsicDetails>, ServiceError> {
        let mut results = Vec::with_capacity(self.block.extrinsics.len());
        let mut errors = Vec::new();

        for (index, extrinsic) in self.block.extrinsics.iter().enumerate() {
            let extrinsic_bytes = extrinsic.encode();
            match self.decode_extrinsic_details(&extrinsic_bytes, index).await {
                Ok(details) => results.push(details),
                Err(e) => errors.push(format!("Extrinsic {index}: {e}")),
            }
        }

        // Enhanced error handling with partial results
        match (results.is_empty(), errors.is_empty()) {
            (true, false) => Err(ServiceError::SubstrateError(format!(
                "Failed to decode all extrinsics: {}",
                errors.join("; ")
            ))),
            (false, false) => Err(ServiceError::SubstrateError(format!(
                "Partial decode failure: {}",
                errors.join("; ")
            ))),
            _ => Ok(results),
        }
    }

    async fn decode_extrinsic_details(
        &self,
        raw_data: &[u8],
        index: usize,
    ) -> Result<ExtrinsicDetails, ServiceError> {
        let (total_length, length_bytes) = self.decode_compact_length(raw_data)?;

        // Enhanced bounds checking
        if length_bytes >= raw_data.len() || total_length > raw_data.len() {
            return Err(ServiceError::SubstrateError(format!(
                "Invalid extrinsic length: {total_length} bytes, data length: {}",
                raw_data.len()
            )));
        }

        let version_byte = raw_data
            .get(length_bytes)
            .copied()
            .ok_or_else(|| ServiceError::SubstrateError("Cannot read version byte".to_string()))?;

        let is_signed = (version_byte & 0x80) != 0;

        // Decode signature info if signed
        let signature_info = if is_signed {
            Some(self.decode_signature_info_v2(raw_data, length_bytes)?)
        } else {
            None
        };

        let call_info = self
            .decode_call_info(raw_data, is_signed, length_bytes)
            .await?;

        Ok(ExtrinsicDetails {
            index,
            is_signed,
            signature_info,
            call_info,
            raw_length: raw_data.len(),
        })
    }

    fn decode_signature_info_v2(
        &self,
        raw_data: &[u8],
        length_offset: usize,
    ) -> Result<SignatureInfo, ServiceError> {
        let mut cursor = length_offset.saturating_add(1);

        // Optimized signer extraction
        let signer = self.extract_hex_field(raw_data, &mut cursor, SIGNER_BYTES, "signer")?;
        let signature =
            self.extract_hex_field(raw_data, &mut cursor, SIGNATURE_BYTES, "signature")?;

        // Extract era with improved error handling
        let era = self.extract_era(raw_data, &mut cursor)?;
        let nonce = self.extract_compact_field(raw_data, &mut cursor, "nonce")? as u64;
        let tip = self.extract_compact_field(raw_data, &mut cursor, "tip")? as u128;

        Ok(SignatureInfo {
            signer,
            signature,
            era,
            nonce,
            tip,
        })
    }

    #[inline]
    fn extract_hex_field(
        &self,
        raw_data: &[u8],
        cursor: &mut usize,
        byte_count: usize,
        field_name: &str,
    ) -> Result<String, ServiceError> {
        let bytes = raw_data.get(*cursor..*cursor + byte_count).ok_or_else(|| {
            ServiceError::SubstrateError(format!("Insufficient data for {field_name}"))
        })?;
        *cursor += byte_count;
        Ok(format!("0x{}", hex::encode(bytes)))
    }

    fn extract_era(&self, raw_data: &[u8], cursor: &mut usize) -> Result<String, ServiceError> {
        let era_byte = raw_data
            .get(*cursor)
            .copied()
            .ok_or_else(|| ServiceError::SubstrateError("Missing era data".to_string()))?;

        let era = if era_byte == 0 {
            *cursor += 1;
            "Immortal".to_string()
        } else {
            *cursor += 2;
            format!("Mortal(0x{era_byte:02x})")
        };

        Ok(era)
    }

    fn extract_compact_field(
        &self,
        raw_data: &[u8],
        cursor: &mut usize,
        field_name: &str,
    ) -> Result<usize, ServiceError> {
        if *cursor >= raw_data.len() {
            return Err(ServiceError::SubstrateError(format!(
                "Missing {field_name} data"
            )));
        }

        let remaining_data = &raw_data[*cursor..];
        let (value, bytes_consumed) = self.decode_compact_length(remaining_data).map_err(|e| {
            ServiceError::SubstrateError(format!("Failed to decode {field_name}: {e}"))
        })?;

        *cursor += bytes_consumed;
        Ok(value)
    }

    async fn decode_call_info(
        &self,
        raw_data: &[u8],
        is_signed: bool,
        length_offset: usize,
    ) -> Result<CallInfo, ServiceError> {
        let call_start = if is_signed {
            self.find_call_start_signed(raw_data, length_offset)?
        } else {
            length_offset.saturating_add(1)
        };

        if call_start >= raw_data.len() {
            return Ok(CallInfo::invalid());
        }

        let call_data = &raw_data[call_start..];
        let (pallet_index, call_index) = self.extract_pallet_call_indices(call_data)?;

        // Map pallet and call indices
        let (pallet_name, call_name) = Self::map_pallet_call(pallet_index, call_index);

        // Extract arguments for known calls
        let args = if call_data.len() > 2 {
            self.extract_call_args(&call_data[2..], pallet_index, call_index)
        } else {
            Vec::new()
        };

        Ok(CallInfo {
            pallet: pallet_name,
            call: call_name,
            args,
        })
    }

    fn extract_pallet_call_indices(&self, call_data: &[u8]) -> Result<(u8, u8), ServiceError> {
        match (call_data.first(), call_data.get(1)) {
            (Some(&pallet), Some(&call)) => Ok((pallet, call)),
            _ => Ok((0, 0)), // Return default for incomplete data
        }
    }

    fn find_call_start_signed(
        &self,
        raw_data: &[u8],
        length_offset: usize,
    ) -> Result<usize, ServiceError> {
        // Try optimized search first
        if let Some(start) = self.optimized_call_search(raw_data, length_offset) {
            return Ok(start);
        }

        // Fallback to calculated start
        let calculated_start = self.calculate_call_start_signed(raw_data, length_offset)?;

        // Validate calculated start
        if self.is_valid_call_start(raw_data, calculated_start) {
            return Ok(calculated_start);
        }

        // Final comprehensive search
        Ok(self
            .comprehensive_call_search(raw_data, length_offset)
            .unwrap_or(calculated_start))
    }

    fn optimized_call_search(&self, raw_data: &[u8], length_offset: usize) -> Option<usize> {
        let search_start = length_offset.saturating_add(MIN_SEARCH_OFFSET);
        let search_end = raw_data.len().saturating_sub(34);

        if search_start >= search_end {
            return None;
        }

        for i in search_start..search_end {
            if let (Some(&pallet), Some(&call)) = (raw_data.get(i), raw_data.get(i + 1)) {
                if self.is_likely_balance_transfer(raw_data, i, pallet, call) {
                    return Some(i);
                }
            }
        }

        None
    }

    #[inline]
    fn is_likely_balance_transfer(
        &self,
        raw_data: &[u8],
        pos: usize,
        pallet: u8,
        call: u8,
    ) -> bool {
        if pallet != pallet_indices::BALANCES || call > 5 {
            return false;
        }

        let remaining_bytes = raw_data.len().saturating_sub(pos).saturating_sub(2);
        if remaining_bytes < 33 {
            return false;
        }

        // Validate potential account bytes
        raw_data
            .get(pos + 2..pos + 34)
            .map(|account_bytes| {
                !account_bytes.iter().all(|&b| b == 0)
                    && !account_bytes.iter().all(|&b| b == account_bytes[0])
            })
            .unwrap_or(false)
    }

    fn is_valid_call_start(&self, raw_data: &[u8], pos: usize) -> bool {
        if let (Some(&pallet), Some(&call)) = (raw_data.get(pos), raw_data.get(pos + 1)) {
            Self::is_valid_pallet_call(pallet, call)
                && !(pallet == pallet_indices::TIMESTAMP && call == 0)
        } else {
            false
        }
    }

    fn comprehensive_call_search(&self, raw_data: &[u8], length_offset: usize) -> Option<usize> {
        let search_start = length_offset.saturating_add(97); // After signature components
        let search_end = raw_data.len().saturating_sub(10);

        for i in search_start..search_end {
            if let (Some(&pallet), Some(&call)) = (raw_data.get(i), raw_data.get(i + 1)) {
                // Skip Timestamp calls in user transactions
                if pallet == pallet_indices::TIMESTAMP && call == 0 {
                    continue;
                }

                if Self::is_valid_pallet_call(pallet, call) {
                    let remaining_bytes = raw_data.len().saturating_sub(i).saturating_sub(2);
                    let min_required = Self::get_min_args_size(pallet, call);

                    if remaining_bytes >= min_required {
                        return Some(i);
                    }
                }
            }
        }

        None
    }

    fn calculate_call_start_signed(
        &self,
        raw_data: &[u8],
        length_offset: usize,
    ) -> Result<usize, ServiceError> {
        let mut cursor = length_offset.saturating_add(1);
        cursor = cursor.saturating_add(SIGNER_BYTES + SIGNATURE_BYTES); // signer + signature

        // Skip era (variable, but usually 1-2 bytes)
        cursor += self.get_era_bytes(raw_data, cursor);

        // Skip nonce and tip (both compact encoded)
        cursor += self.skip_compact_field(raw_data, cursor, "nonce")?;
        cursor += self.skip_compact_field(raw_data, cursor, "tip")?;

        Ok(cursor)
    }

    #[inline]
    fn get_era_bytes(&self, raw_data: &[u8], cursor: usize) -> usize {
        raw_data
            .get(cursor)
            .map(|&era_byte| if era_byte == 0 { 1 } else { 2 })
            .unwrap_or(0)
    }

    fn skip_compact_field(
        &self,
        raw_data: &[u8],
        cursor: usize,
        field_name: &str,
    ) -> Result<usize, ServiceError> {
        if cursor >= raw_data.len() {
            return Ok(0);
        }

        self.decode_compact_length(&raw_data[cursor..])
            .map(|(_, bytes)| bytes)
            .map_err(|e| {
                ServiceError::SubstrateError(format!(
                    "Failed to decode {field_name} in call start calculation: {e}"
                ))
            })
    }

    // Enhanced validation with EVM and Ethereum pallets for Selendra
    const fn is_valid_pallet_call(pallet_index: u8, call_index: u8) -> bool {
        use pallet_indices::*;
        match pallet_index {
            SYSTEM => call_index <= 7,
            TIMESTAMP => call_index == 0,
            BALANCES => call_index <= 5,
            STAKING => call_index <= 5,
            ETHEREUM => call_index <= 1,
            EVM => call_index <= 6,
            _ => false,
        }
    }

    // Enhanced minimum args size with EVM and Ethereum pallets for Selendra
    const fn get_min_args_size(pallet_index: u8, call_index: u8) -> usize {
        use pallet_indices::*;
        match (pallet_index, call_index) {
            (TIMESTAMP, 0) => 4,
            (BALANCES, 0 | 2 | 3) => 33,
            (ETHEREUM, 0) => 100,
            (EVM, 0) => 20,
            (EVM, 1) => 85,
            (EVM, 2) => 65,
            (EVM, 3) => 85,
            _ => 0,
        }
    }

    fn extract_call_args(
        &self,
        call_args: &[u8],
        pallet_index: u8,
        call_index: u8,
    ) -> Vec<(String, String)> {
        use pallet_indices::*;

        match (pallet_index, call_index) {
            (TIMESTAMP, 0) => self.extract_timestamp_args(call_args),
            (BALANCES, 0 | 3) => self.extract_balance_transfer_args(call_args),
            (EVM, 0) => self.extract_evm_withdraw_args(call_args),
            (EVM, 1) => self.extract_evm_call_args(call_args),
            (EVM, 2) => self.extract_evm_create_args(call_args),
            (EVM, 3) => self.extract_evm_create2_args(call_args),
            (ETHEREUM, 0) => self.extract_ethereum_transact_args(call_args),
            _ if !call_args.is_empty() => vec![(
                "raw_args".to_string(),
                format!("0x{}", hex::encode(call_args)),
            )],
            _ => Vec::new(),
        }
    }

    fn extract_timestamp_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 4 {
            return Vec::new();
        }

        match self.decode_compact_length(call_args) {
            Ok((timestamp, _)) => vec![("now".to_string(), timestamp.to_string())],
            Err(_) => vec![("now".to_string(), "decode_error".to_string())],
        }
    }

    fn extract_balance_transfer_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        if let Some(dest_bytes) = call_args.get(0..32) {
            args.push(("dest".to_string(), format!("0x{}", hex::encode(dest_bytes))));

            if call_args.len() > 32 {
                match self.decode_compact_length(&call_args[32..]) {
                    Ok((value, _)) => args.push(("value".to_string(), value.to_string())),
                    Err(_) => args.push(("value".to_string(), "decode_error".to_string())),
                }
            }
        }

        args
    }

    fn extract_evm_withdraw_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < EVM_ADDRESS_BYTES {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        if let Some(address_bytes) = call_args.get(0..EVM_ADDRESS_BYTES) {
            args.push((
                "address".to_string(),
                format!("0x{}", hex::encode(address_bytes)),
            ));

            if call_args.len() > EVM_ADDRESS_BYTES {
                match self.decode_compact_length(&call_args[EVM_ADDRESS_BYTES..]) {
                    Ok((value, _)) => args.push(("value".to_string(), value.to_string())),
                    Err(_) => args.push(("value".to_string(), "decode_error".to_string())),
                }
            }
        }

        args
    }

    fn extract_evm_call_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 40 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(5);
        let mut cursor = 0;

        // Source and target addresses
        if let Some(source_bytes) = call_args.get(cursor..cursor + EVM_ADDRESS_BYTES) {
            args.push((
                "source".to_string(),
                format!("0x{}", hex::encode(source_bytes)),
            ));
            cursor += EVM_ADDRESS_BYTES;
        }

        if let Some(target_bytes) = call_args.get(cursor..cursor + EVM_ADDRESS_BYTES) {
            args.push((
                "target".to_string(),
                format!("0x{}", hex::encode(target_bytes)),
            ));
            cursor += EVM_ADDRESS_BYTES;
        }

        // Extract input data
        cursor += self.extract_variable_length_field(call_args, cursor, "input", &mut args);

        // Extract value and gas limit
        self.extract_fixed_fields(call_args, cursor, &mut args);

        args
    }

    fn extract_evm_create_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < EVM_ADDRESS_BYTES {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(4);
        let mut cursor = 0;

        // Source address
        if let Some(source_bytes) = call_args.get(cursor..cursor + EVM_ADDRESS_BYTES) {
            args.push((
                "source".to_string(),
                format!("0x{}", hex::encode(source_bytes)),
            ));
            cursor += EVM_ADDRESS_BYTES;
        }

        // Extract init code
        cursor += self.extract_variable_length_field(call_args, cursor, "init", &mut args);

        // Extract value and gas limit
        self.extract_fixed_fields(call_args, cursor, &mut args);

        args
    }

    fn extract_evm_create2_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 52 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(5);
        let mut cursor = 0;

        // Source address
        if let Some(source_bytes) = call_args.get(cursor..cursor + EVM_ADDRESS_BYTES) {
            args.push((
                "source".to_string(),
                format!("0x{}", hex::encode(source_bytes)),
            ));
            cursor += EVM_ADDRESS_BYTES;
        }

        // Extract init code
        cursor += self.extract_variable_length_field(call_args, cursor, "init", &mut args);

        // Salt
        if let Some(salt_bytes) = call_args.get(cursor..cursor + VALUE_BYTES) {
            args.push(("salt".to_string(), format!("0x{}", hex::encode(salt_bytes))));
            cursor += VALUE_BYTES;
        }

        // Extract value and gas limit
        self.extract_fixed_fields(call_args, cursor, &mut args);

        args
    }

    fn extract_ethereum_transact_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 20 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);
        let mut cursor = 0;

        // Transaction type
        if let Some(&tx_type) = call_args.get(cursor) {
            args.push(("transaction_type".to_string(), format!("0x{tx_type:02x}")));
            cursor += 1;
        }

        // Remaining transaction data
        if cursor < call_args.len() {
            let remaining_data = &call_args[cursor..];
            args.push((
                "transaction_data".to_string(),
                format!("0x{}", hex::encode(remaining_data)),
            ));
        }

        args
    }

    fn extract_variable_length_field(
        &self,
        call_args: &[u8],
        cursor: usize,
        field_name: &str,
        args: &mut Vec<(String, String)>,
    ) -> usize {
        if cursor >= call_args.len() {
            return 0;
        }

        match self.decode_compact_length(&call_args[cursor..]) {
            Ok((len, len_bytes)) => {
                let data_start = cursor + len_bytes;
                let data_end = data_start + len;

                if data_end <= call_args.len() && len > 0 {
                    if let Some(data_bytes) = call_args.get(data_start..data_end) {
                        args.push((
                            field_name.to_string(),
                            format!("0x{}", hex::encode(data_bytes)),
                        ));
                        return len_bytes + len;
                    }
                }

                args.push((field_name.to_string(), "0x".to_string()));
                len_bytes
            }
            Err(_) => {
                args.push((field_name.to_string(), "decode_error".to_string()));
                0
            }
        }
    }

    fn extract_fixed_fields(
        &self,
        call_args: &[u8],
        mut cursor: usize,
        args: &mut Vec<(String, String)>,
    ) {
        // Value (32 bytes)
        if let Some(value_bytes) = call_args.get(cursor..cursor + VALUE_BYTES) {
            args.push((
                "value".to_string(),
                format!("0x{}", hex::encode(value_bytes)),
            ));
            cursor += VALUE_BYTES;
        }

        // Gas limit (8 bytes)
        if let Some(gas_bytes) = call_args.get(cursor..cursor + GAS_LIMIT_BYTES) {
            if gas_bytes.len() == GAS_LIMIT_BYTES {
                let gas_limit = u64::from_le_bytes([
                    gas_bytes[0],
                    gas_bytes[1],
                    gas_bytes[2],
                    gas_bytes[3],
                    gas_bytes[4],
                    gas_bytes[5],
                    gas_bytes[6],
                    gas_bytes[7],
                ]);
                args.push(("gas_limit".to_string(), gas_limit.to_string()));
            }
        }
    }

    // Enhanced pallet mapping with better organization
    fn map_pallet_call(pallet_index: u8, call_index: u8) -> (String, String) {
        use pallet_indices::*;

        match pallet_index {
            SYSTEM => Self::map_system_calls(call_index),
            TIMESTAMP => ("Timestamp".to_string(), "set".to_string()),
            BALANCES => Self::map_balance_calls(call_index),
            STAKING => Self::map_staking_calls(call_index),
            ETHEREUM => Self::map_ethereum_calls(call_index),
            EVM => Self::map_evm_calls(call_index),
            _ => (
                format!("Pallet_{pallet_index}"),
                format!("Call_{call_index}"),
            ),
        }
    }

    fn map_system_calls(call_index: u8) -> (String, String) {
        let call_name = match call_index {
            0 => "remark",
            1 => "set_heap_pages",
            2 => "set_code",
            3 => "set_code_without_checks",
            4 => "set_storage",
            5 => "kill_storage",
            6 => "kill_prefix",
            7 => "remark_with_event",
            _ => "unknown",
        };
        ("System".to_string(), call_name.to_string())
    }

    fn map_balance_calls(call_index: u8) -> (String, String) {
        let call_name = match call_index {
            0 => "transfer_allow_death",
            1 => "set_balance",
            2 => "force_transfer",
            3 => "transfer_keep_alive",
            4 => "transfer_all",
            5 => "force_unreserve",
            _ => "unknown",
        };
        ("Balances".to_string(), call_name.to_string())
    }

    fn map_staking_calls(call_index: u8) -> (String, String) {
        let call_name = match call_index {
            0 => "bond",
            1 => "bond_extra",
            2 => "unbond",
            3 => "withdraw_unbonded",
            4 => "validate",
            5 => "nominate",
            _ => "unknown",
        };
        ("Staking".to_string(), call_name.to_string())
    }

    fn map_ethereum_calls(call_index: u8) -> (String, String) {
        let call_name = match call_index {
            0 => "transact",
            1 => "message_transact",
            _ => "unknown",
        };
        ("Ethereum".to_string(), call_name.to_string())
    }

    fn map_evm_calls(call_index: u8) -> (String, String) {
        let call_name = match call_index {
            0 => "withdraw",
            1 => "call",
            2 => "create",
            3 => "create2",
            4 => "create_nonce_metadata",
            5 => "create_account_metadata",
            6 => "remove_account_metadata",
            _ => "unknown",
        };
        ("EVM".to_string(), call_name.to_string())
    }

    fn decode_compact_length(&self, data: &[u8]) -> Result<(usize, usize), ServiceError> {
        let first_byte = *data
            .first()
            .ok_or_else(|| ServiceError::SubstrateError("Empty data".to_string()))?;

        match first_byte & 0b11 {
            0b00 => Ok((first_byte as usize >> 2, 1)),
            0b01 => {
                let second_byte = *data.get(1).ok_or_else(|| {
                    ServiceError::SubstrateError("Insufficient data for 2-byte compact".to_string())
                })?;
                let value = ((first_byte as usize & 0xfc) >> 2) | ((second_byte as usize) << 6);
                Ok((value, 2))
            }
            0b10 => {
                if data.len() < 4 {
                    return Err(ServiceError::SubstrateError(
                        "Insufficient data for 4-byte compact".to_string(),
                    ));
                }

                let bytes = [
                    data.get(1).copied().unwrap_or(0),
                    data.get(2).copied().unwrap_or(0),
                    data.get(3).copied().unwrap_or(0),
                ];

                let value = ((first_byte as usize & 0xfc) >> 2)
                    | ((bytes[0] as usize) << 6)
                    | ((bytes[1] as usize) << 14)
                    | ((bytes[2] as usize) << 22);
                Ok((value, 4))
            }
            _ => {
                let length = (first_byte >> 2) as usize + 4;
                if data.len() < length + 1 {
                    return Err(ServiceError::SubstrateError(
                        "Insufficient data for big integer compact".to_string(),
                    ));
                }
                Ok((length, length + 1))
            }
        }
    }
}

// Extension trait for CallInfo to provide helper methods
trait CallInfoExt {
    fn invalid() -> CallInfo;
}

impl CallInfoExt for CallInfo {
    #[inline]
    fn invalid() -> Self {
        Self {
            pallet: "Invalid".to_string(),
            call: "Invalid".to_string(),
            args: Vec::new(),
        }
    }
}
