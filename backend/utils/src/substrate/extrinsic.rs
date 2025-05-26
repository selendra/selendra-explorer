use custom_error::ServiceError;
use model::extrinsic::{CallInfo, ExtrinsicDetails, SignatureInfo};
use substrate_api_client::{
    ac_primitives::{BlakeTwo256, Block, Header, OpaqueExtrinsic}, 
};
use codec::Encode;

pub struct ExtrinsicInfo {
    pub block: Block<Header<u32, BlakeTwo256>, OpaqueExtrinsic>
}

impl ExtrinsicInfo {
    pub fn new(
        block: Block<Header<u32, BlakeTwo256>, OpaqueExtrinsic>
    ) -> Self {
        Self { block }
    }

    pub async fn get_extrinsics(&self) -> Result<Vec<ExtrinsicDetails>, ServiceError> {
        let mut results = Vec::with_capacity(self.block.extrinsics.len());
        let mut errors = Vec::new();
        
        for (index, extrinsic) in self.block.extrinsics.iter().enumerate() {
            let extrinsic_bytes = extrinsic.encode();
            match self.decode_extrinsic_details(&extrinsic_bytes, index).await {
                Ok(details) => {
                    results.push(details);
                },
                Err(e) => {
                    errors.push(format!("Extrinsic {}: {}", index, e));
                }
            }
        }
        
        // Return error if we couldn't decode any extrinsics
        if results.is_empty() && !errors.is_empty() {
            return Err(ServiceError::SubstrateError(
                format!("Failed to decode all extrinsics: {}", errors.join("; "))
            ));
        }
        
        // Return partial results with warning if some failed
        if !errors.is_empty() {
            return Err(ServiceError::SubstrateError(
                format!("Partial decode failure: {}", errors.join("; "))
            ));
        }
        
        Ok(results)
    }

    async fn decode_extrinsic_details(&self, raw_data: &[u8], index: usize) -> Result<ExtrinsicDetails, ServiceError> {
        let (total_length, length_bytes) = self.decode_compact_length(raw_data)?;
        
        // Improved bounds checking
        if length_bytes >= raw_data.len() || total_length > raw_data.len() {
            return Err(ServiceError::SubstrateError(
                format!("Invalid extrinsic length: {} bytes, data length: {}", total_length, raw_data.len())
            ));
        }
        
        // Safe array access with bounds check
        let version_byte = *raw_data.get(length_bytes)
            .ok_or_else(|| ServiceError::SubstrateError("Cannot read version byte".to_string()))?;
        
        let is_signed = (version_byte & 0x80) != 0;

        // Decode signature info if signed
        let signature_info = if is_signed {
            Some(self.decode_signature_info_v2(raw_data, length_bytes)?)
        } else {
            None
        };

        let call_info = self.decode_call_info(raw_data, is_signed, length_bytes).await?;

        Ok(ExtrinsicDetails {
            index,
            is_signed,
            signature_info,
            call_info,
            raw_length: raw_data.len(),
        })
    }

    fn decode_signature_info_v2(&self, raw_data: &[u8], length_offset: usize) -> Result<SignatureInfo, ServiceError> {
        let mut cursor = length_offset.saturating_add(1);
        
        // Safe slice extraction with bounds checking
        let signer_bytes = raw_data.get(cursor..cursor.saturating_add(32))
            .ok_or_else(|| ServiceError::SubstrateError("Insufficient data for signer".to_string()))?;
        let signer = format!("0x{}", hex::encode(signer_bytes));
        cursor = cursor.saturating_add(32);
        
        let signature_bytes = raw_data.get(cursor..cursor.saturating_add(64))
            .ok_or_else(|| ServiceError::SubstrateError("Insufficient data for signature".to_string()))?;
        let signature = format!("0x{}", hex::encode(signature_bytes));
        cursor = cursor.saturating_add(64);
        
        // Extract era with safe array access
        let era = if let Some(&era_byte) = raw_data.get(cursor) {
            if era_byte == 0 {
                cursor = cursor.saturating_add(1);
                "Immortal".to_string()
            } else {
                cursor = cursor.saturating_add(2);
                format!("Mortal(0x{:02x})", era_byte)
            }
        } else {
            "Unknown".to_string()
        };
        
        // Extract nonce with safe slice access
        let nonce = if cursor < raw_data.len() {
            let remaining_data = &raw_data[cursor..];
            match self.decode_compact_length(remaining_data) {
                Ok((nonce_val, nonce_bytes)) => {
                    cursor = cursor.saturating_add(nonce_bytes);
                    nonce_val as u64
                },
                Err(e) => return Err(ServiceError::SubstrateError(
                    format!("Failed to decode nonce: {}", e)
                ))
            }
        } else {
            return Err(ServiceError::SubstrateError("Missing nonce data".to_string()));
        };
        
        // Extract tip with safe slice access
        let tip = if cursor < raw_data.len() {
            let remaining_data = &raw_data[cursor..];
            match self.decode_compact_length(remaining_data) {
                Ok((tip_val, _)) => tip_val as u128,
                Err(e) => return Err(ServiceError::SubstrateError(
                    format!("Failed to decode tip: {}", e)
                ))
            }
        } else {
            return Err(ServiceError::SubstrateError("Missing tip data".to_string()));
        };
        
        Ok(SignatureInfo {
            signer,
            signature,
            era,
            nonce,
            tip,
        })
    }

    async fn decode_call_info(&self, raw_data: &[u8], is_signed: bool, length_offset: usize) -> Result<CallInfo, ServiceError> {
        let call_start = if is_signed {
            self.find_call_start_signed(raw_data, length_offset)?
        } else {
            length_offset.saturating_add(1)
        };

        if call_start >= raw_data.len() {
            return Ok(CallInfo {
                pallet: "Invalid".to_string(),
                call: "Invalid".to_string(),
                args: vec![],
            });
        }
        
        let call_data = &raw_data[call_start..];
        
        // Safe array access for pallet and call indices
        let (pallet_index, call_index) = match (call_data.first(), call_data.get(1)) {
            (Some(&pallet), Some(&call)) => (pallet, call),
            _ => return Ok(CallInfo {
                pallet: "Incomplete".to_string(),
                call: "Incomplete".to_string(),
                args: vec![],
            })
        };
    
        // Map pallet and call indices
        let (pallet_name, call_name) = Self::map_pallet_call(pallet_index, call_index);
        
        // Extract arguments for known calls
        let args = if call_data.len() > 2 {
            self.extract_call_args(&call_data[2..], pallet_index, call_index)
        } else {
            vec![]
        };

        Ok(CallInfo {
            pallet: pallet_name,
            call: call_name,
            args,
        })
    }

    fn find_call_start_signed(&self, raw_data: &[u8], length_offset: usize) -> Result<usize, ServiceError> {
        // Optimized search with better bounds checking
        let search_start = length_offset.saturating_add(50);
        let search_end = raw_data.len().saturating_sub(34);
        
        if search_start < search_end {
            for i in search_start..search_end {
                if let (Some(&pallet), Some(&call)) = (raw_data.get(i), raw_data.get(i + 1)) {
                    if pallet == 4 && call <= 5 { // Balances pallet with valid call index
                        let remaining_bytes = raw_data.len().saturating_sub(i).saturating_sub(2);
                        if remaining_bytes >= 33 { // At least 32 bytes for account + 1 for amount
                            // Validate potential account bytes
                            if let Some(potential_account) = raw_data.get(i + 2..i + 34) {
                                if !potential_account.iter().all(|&b| b == 0) && 
                                   !potential_account.iter().all(|&b| b == potential_account[0]) {
                                    return Ok(i);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Fallback to calculated start
        let calculated_start = self.calculate_call_start_signed(raw_data, length_offset)?;
        
        // Validate calculated start
        if let (Some(&pallet), Some(&call)) = (
            raw_data.get(calculated_start), 
            raw_data.get(calculated_start + 1)
        ) {
            if Self::is_valid_pallet_call(pallet, call) && !(pallet == 3 && call == 0) {
                return Ok(calculated_start);
            }
        }

        // Final search with improved bounds
        let final_search_start = length_offset.saturating_add(1).saturating_add(96); // After version + signer + signature
        let final_search_end = raw_data.len().saturating_sub(10);
        
        for i in final_search_start..final_search_end {
            if let (Some(&pallet), Some(&call)) = (raw_data.get(i), raw_data.get(i + 1)) {
                // Skip Timestamp calls in user transactions
                if pallet == 3 && call == 0 {
                    continue;
                }
                
                if Self::is_valid_pallet_call(pallet, call) {
                    let remaining_bytes = raw_data.len().saturating_sub(i).saturating_sub(2);
                    let min_required = Self::get_min_args_size(pallet, call);
                    
                    if remaining_bytes >= min_required {
                        return Ok(i);
                    }
                }
            }
        }
        
        Ok(calculated_start)
    }

    fn calculate_call_start_signed(&self, raw_data: &[u8], length_offset: usize) -> Result<usize, ServiceError> {
        let mut cursor = length_offset.saturating_add(1);
        cursor = cursor.saturating_add(32); // signer
        cursor = cursor.saturating_add(64); // signature
        
        // Skip era (variable, but usually 1-2 bytes)
        if let Some(&era_byte) = raw_data.get(cursor) {
            let era_bytes = if era_byte == 0 { 1 } else { 2 };
            cursor = cursor.saturating_add(era_bytes);
        }
        
        // Skip nonce (compact encoded)
        if cursor < raw_data.len() {
            match self.decode_compact_length(&raw_data[cursor..]) {
                Ok((_, nonce_bytes)) => cursor = cursor.saturating_add(nonce_bytes),
                Err(e) => return Err(ServiceError::SubstrateError(
                    format!("Failed to decode nonce in call start calculation: {}", e)
                ))
            }
        }
        
        // Skip tip (compact encoded)
        if cursor < raw_data.len() {
            match self.decode_compact_length(&raw_data[cursor..]) {
                Ok((_, tip_bytes)) => cursor = cursor.saturating_add(tip_bytes),
                Err(e) => return Err(ServiceError::SubstrateError(
                    format!("Failed to decode tip in call start calculation: {}", e)
                ))
            }
        }

        Ok(cursor)
    }

    // Enhanced validation with EVM and Ethereum pallets for Selendra
    const fn is_valid_pallet_call(pallet_index: u8, call_index: u8) -> bool {
        match pallet_index {
            0 => call_index <= 7,   // System pallet
            3 => call_index == 0,   // Timestamp pallet (only 'set' call)
            4 => call_index <= 5,   // Balances pallet
            11 => call_index <= 5,  // Staking pallet
            80 => call_index <= 1,  // Ethereum pallet (Selendra)
            81 => call_index <= 6,  // EVM pallet (Selendra)
            _ => false,
        }
    }

    // Enhanced minimum args size with EVM and Ethereum pallets for Selendra
    const fn get_min_args_size(pallet_index: u8, call_index: u8) -> usize {
        match (pallet_index, call_index) {
            (3, 0) => 4,   // Timestamp::set
            (4, 0) | (4, 2) | (4, 3) => 33, // Balance transfers
            (80, 0) => 100, // Ethereum::transact (transaction)
            (81, 0) => 20, // EVM::withdraw
            (81, 1) => 85, // EVM::call (source + target + input + value + gas_limit + max_fee_per_gas + max_priority_fee_per_gas + nonce + access_list)
            (81, 2) => 65, // EVM::create (source + init + value + gas_limit + max_fee_per_gas + max_priority_fee_per_gas + nonce + access_list)
            (81, 3) => 85, // EVM::create2 (source + init + salt + value + gas_limit + max_fee_per_gas + max_priority_fee_per_gas + nonce + access_list)
            _ => 0,
        }
    }

    fn extract_call_args(&self, call_args: &[u8], pallet_index: u8, call_index: u8) -> Vec<(String, String)> {
        let mut args = Vec::new();
        
        match (pallet_index, call_index) {
            // Timestamp::set
            (3, 0) if call_args.len() >= 4 => {
                match self.decode_compact_length(call_args) {
                    Ok((timestamp, _)) => args.push(("now".to_string(), timestamp.to_string())),
                    Err(_) => args.push(("now".to_string(), "decode_error".to_string()))
                }
            },
            
            (4, 0) | (4, 3) if call_args.len() >= 32 => {
                // Safe slice extraction for destination
                if let Some(dest_bytes) = call_args.get(0..32) {
                    let dest = format!("0x{}", hex::encode(dest_bytes));
                    args.push(("dest".to_string(), dest));
                    
                    // Value is compact encoded after the destination
                    if call_args.len() > 32 {
                        match self.decode_compact_length(&call_args[32..]) {
                            Ok((value, _)) => args.push(("value".to_string(), value.to_string())),
                            Err(_) => args.push(("value".to_string(), "decode_error".to_string()))
                        }
                    }
                }
            },
            (81, 0) if call_args.len() >= 20 => {
                if let Some(address_bytes) = call_args.get(0..20) {
                    let address = format!("0x{}", hex::encode(address_bytes));
                    args.push(("address".to_string(), address));
                    
                    if call_args.len() > 20 {
                        match self.decode_compact_length(&call_args[20..]) {
                            Ok((value, _)) => args.push(("value".to_string(), value.to_string())),
                            Err(_) => args.push(("value".to_string(), "decode_error".to_string()))
                        }
                    }
                }
            },
            // EVM::call (Selendra index 81)
            (81, 1) if call_args.len() >= 40 => {
                let mut cursor = 0;
                
                // Source (20 bytes)
                if let Some(source_bytes) = call_args.get(cursor..cursor + 20) {
                    args.push(("source".to_string(), format!("0x{}", hex::encode(source_bytes))));
                    cursor += 20;
                }
                
                // Target (20 bytes)
                if let Some(target_bytes) = call_args.get(cursor..cursor + 20) {
                    args.push(("target".to_string(), format!("0x{}", hex::encode(target_bytes))));
                    cursor += 20;
                }
                
                // Input (variable length, compact encoded)
                if cursor < call_args.len() {
                    match self.decode_compact_length(&call_args[cursor..]) {
                        Ok((input_len, len_bytes)) => {
                            cursor += len_bytes;
                            if cursor + input_len <= call_args.len() && input_len > 0 {
                                if let Some(input_bytes) = call_args.get(cursor..cursor + input_len) {
                                    args.push(("input".to_string(), format!("0x{}", hex::encode(input_bytes))));
                                    cursor += input_len;
                                }
                            } else {
                                args.push(("input".to_string(), "0x".to_string()));
                            }
                        },
                        Err(_) => args.push(("input".to_string(), "decode_error".to_string()))
                    }
                }
                
                // Value (32 bytes)
                if let Some(value_bytes) = call_args.get(cursor..cursor + 32) {
                    args.push(("value".to_string(), format!("0x{}", hex::encode(value_bytes))));
                    cursor += 32;
                }
                
                // Gas limit (8 bytes)
                if let Some(gas_bytes) = call_args.get(cursor..cursor + 8) {
                    let gas_limit = u64::from_le_bytes([
                        gas_bytes[0], gas_bytes[1], gas_bytes[2], gas_bytes[3],
                        gas_bytes[4], gas_bytes[5], gas_bytes[6], gas_bytes[7]
                    ]);
                    args.push(("gas_limit".to_string(), gas_limit.to_string()));
                }
            },
            // EVM::create (Selendra index 81)
            (81, 2) if call_args.len() >= 20 => {
                let mut cursor = 0;
                
                // Source (20 bytes)
                if let Some(source_bytes) = call_args.get(cursor..cursor + 20) {
                    args.push(("source".to_string(), format!("0x{}", hex::encode(source_bytes))));
                    cursor += 20;
                }
                
                // Init code (variable length, compact encoded)
                if cursor < call_args.len() {
                    match self.decode_compact_length(&call_args[cursor..]) {
                        Ok((init_len, len_bytes)) => {
                            cursor += len_bytes;
                            if cursor + init_len <= call_args.len() && init_len > 0 {
                                if let Some(init_bytes) = call_args.get(cursor..cursor + init_len) {
                                    args.push(("init".to_string(), format!("0x{}", hex::encode(init_bytes))));
                                    cursor += init_len;
                                }
                            } else {
                                args.push(("init".to_string(), "0x".to_string()));
                            }
                        },
                        Err(_) => args.push(("init".to_string(), "decode_error".to_string()))
                    }
                }
                
                // Value (32 bytes)
                if let Some(value_bytes) = call_args.get(cursor..cursor + 32) {
                    args.push(("value".to_string(), format!("0x{}", hex::encode(value_bytes))));
                    cursor += 32;
                }
                
                // Gas limit (8 bytes)
                if let Some(gas_bytes) = call_args.get(cursor..cursor + 8) {
                    let gas_limit = u64::from_le_bytes([
                        gas_bytes[0], gas_bytes[1], gas_bytes[2], gas_bytes[3],
                        gas_bytes[4], gas_bytes[5], gas_bytes[6], gas_bytes[7]
                    ]);
                    args.push(("gas_limit".to_string(), gas_limit.to_string()));
                }
            },
            // EVM::create2 (Selendra index 81)
            (81, 3) if call_args.len() >= 52 => {
                let mut cursor = 0;
                
                // Source (20 bytes)
                if let Some(source_bytes) = call_args.get(cursor..cursor + 20) {
                    args.push(("source".to_string(), format!("0x{}", hex::encode(source_bytes))));
                    cursor += 20;
                }
                
                // Init code (variable length, compact encoded)
                if cursor < call_args.len() {
                    match self.decode_compact_length(&call_args[cursor..]) {
                        Ok((init_len, len_bytes)) => {
                            cursor += len_bytes;
                            if cursor + init_len <= call_args.len() && init_len > 0 {
                                if let Some(init_bytes) = call_args.get(cursor..cursor + init_len) {
                                    args.push(("init".to_string(), format!("0x{}", hex::encode(init_bytes))));
                                    cursor += init_len;
                                }
                            } else {
                                args.push(("init".to_string(), "0x".to_string()));
                            }
                        },
                        Err(_) => args.push(("init".to_string(), "decode_error".to_string()))
                    }
                }
                
                // Salt (32 bytes)
                if let Some(salt_bytes) = call_args.get(cursor..cursor + 32) {
                    args.push(("salt".to_string(), format!("0x{}", hex::encode(salt_bytes))));
                    cursor += 32;
                }
                
                // Value (32 bytes)
                if let Some(value_bytes) = call_args.get(cursor..cursor + 32) {
                    args.push(("value".to_string(), format!("0x{}", hex::encode(value_bytes))));
                    cursor += 32;
                }
                
                // Gas limit (8 bytes)
                if let Some(gas_bytes) = call_args.get(cursor..cursor + 8) {
                    let gas_limit = u64::from_le_bytes([
                        gas_bytes[0], gas_bytes[1], gas_bytes[2], gas_bytes[3],
                        gas_bytes[4], gas_bytes[5], gas_bytes[6], gas_bytes[7]
                    ]);
                    args.push(("gas_limit".to_string(), gas_limit.to_string()));
                }
            },
            // Ethereum::transact (Selendra index 80)
            (80, 0) if call_args.len() >= 20 => {
                // Ethereum transaction structure is complex, so we'll extract the basic fields
                let mut cursor = 0;
                
                // Transaction type (1 byte for EIP-1559, EIP-2930, or Legacy)
                if let Some(&tx_type) = call_args.get(cursor) {
                    args.push(("transaction_type".to_string(), format!("0x{:02x}", tx_type)));
                    cursor += 1;
                }
                
                // For simplicity, show remaining data as hex
                if cursor < call_args.len() {
                    let remaining_data = &call_args[cursor..];
                    args.push(("transaction_data".to_string(), format!("0x{}", hex::encode(remaining_data))));
                }
            },
            _ if !call_args.is_empty() => {
                // Generic hex dump for unknown calls
                args.push(("raw_args".to_string(), format!("0x{}", hex::encode(call_args))));
            },
            _ => {} // Empty args for empty call_args
        }
        
        args
    }

    // Enhanced pallet mapping with EVM and Ethereum pallets for Selendra
    fn map_pallet_call(pallet_index: u8, call_index: u8) -> (String, String) {
        match (pallet_index, call_index) {
            // System pallet (index 0)
            (0, 0) => ("System".to_string(), "remark".to_string()),
            (0, 1) => ("System".to_string(), "set_heap_pages".to_string()),
            (0, 2) => ("System".to_string(), "set_code".to_string()),
            (0, 3) => ("System".to_string(), "set_code_without_checks".to_string()),
            (0, 4) => ("System".to_string(), "set_storage".to_string()),
            (0, 5) => ("System".to_string(), "kill_storage".to_string()),
            (0, 6) => ("System".to_string(), "kill_prefix".to_string()),
            (0, 7) => ("System".to_string(), "remark_with_event".to_string()),
            
            // Timestamp pallet (index 3)
            (3, 0) => ("Timestamp".to_string(), "set".to_string()),
            
            // Balances pallet (index 4)
            (4, 0) => ("Balances".to_string(), "transfer_allow_death".to_string()),
            (4, 1) => ("Balances".to_string(), "set_balance".to_string()),
            (4, 2) => ("Balances".to_string(), "force_transfer".to_string()),
            (4, 3) => ("Balances".to_string(), "transfer_keep_alive".to_string()),
            (4, 4) => ("Balances".to_string(), "transfer_all".to_string()),
            (4, 5) => ("Balances".to_string(), "force_unreserve".to_string()),
            
            // Staking pallet (index 11)
            (11, 0) => ("Staking".to_string(), "bond".to_string()),
            (11, 1) => ("Staking".to_string(), "bond_extra".to_string()),
            (11, 2) => ("Staking".to_string(), "unbond".to_string()),
            (11, 3) => ("Staking".to_string(), "withdraw_unbonded".to_string()),
            (11, 4) => ("Staking".to_string(), "validate".to_string()),
            (11, 5) => ("Staking".to_string(), "nominate".to_string()),
            
            // Ethereum pallet (index 80) - Selendra specific
            (80, 0) => ("Ethereum".to_string(), "transact".to_string()),
            (80, 1) => ("Ethereum".to_string(), "message_transact".to_string()),
            
            // EVM pallet (index 81) - Selendra specific
            (81, 0) => ("EVM".to_string(), "withdraw".to_string()),
            (81, 1) => ("EVM".to_string(), "call".to_string()),
            (81, 2) => ("EVM".to_string(), "create".to_string()),
            (81, 3) => ("EVM".to_string(), "create2".to_string()),
            (81, 4) => ("EVM".to_string(), "create_nonce_metadata".to_string()),
            (81, 5) => ("EVM".to_string(), "create_account_metadata".to_string()),
            (81, 6) => ("EVM".to_string(), "remove_account_metadata".to_string()),
            
            // Default case
            _ => (
                format!("Pallet_{}", pallet_index),
                format!("Call_{}", call_index),
            ),
        }
    }

    fn decode_compact_length(&self, data: &[u8]) -> Result<(usize, usize), ServiceError> {
        let first_byte = *data.first()
            .ok_or_else(|| ServiceError::SubstrateError("Empty data".to_string()))?;
        
        match first_byte & 0b11 {
            0b00 => Ok((first_byte as usize >> 2, 1)),
            0b01 => {
                let second_byte = *data.get(1)
                    .ok_or_else(|| ServiceError::SubstrateError("Insufficient data for 2-byte compact".to_string()))?;
                let value = ((first_byte as usize & 0xfc) >> 2) | ((second_byte as usize) << 6);
                Ok((value, 2))
            },
            0b10 => {
                if data.len() < 4 {
                    return Err(ServiceError::SubstrateError("Insufficient data for 4-byte compact".to_string()));
                }
                // Safe array access using get()
                let bytes = [
                    data.get(1).copied().unwrap_or(0),
                    data.get(2).copied().unwrap_or(0), 
                    data.get(3).copied().unwrap_or(0)
                ];
                
                let value = ((first_byte as usize & 0xfc) >> 2)
                    | ((bytes[0] as usize) << 6)
                    | ((bytes[1] as usize) << 14)
                    | ((bytes[2] as usize) << 22);
                Ok((value, 4))
            },
            _ => {
                let length = (first_byte >> 2) as usize + 4;
                if data.len() < length + 1 {
                    return Err(ServiceError::SubstrateError("Insufficient data for big integer compact".to_string()));
                }
                Ok((length, length + 1))
            }
        }
    }
}