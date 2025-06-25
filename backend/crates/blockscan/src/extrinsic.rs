use config::{
    EVM_ADDRESS_BYTES, GAS_LIMIT_BYTES, MIN_SEARCH_OFFSET, SIGNATURE_BYTES, SIGNER_BYTES,
    VALUE_BYTES,
};
use custom_error::ServiceError;

use crate::data_types::{CallInfo, Era, ExtrinsicDetails, SignatureInfo};

mod index_pallet {
    pub const SYSTEM: u8 = 0;
    pub const AURA: u8 = 1;
    pub const ALEPH: u8 = 2;
    pub const TIMESTAMP: u8 = 3;
    pub const BALANCES: u8 = 4;
    pub const TRANSACTION_PAYMENT: u8 = 5;
    pub const SCHEDULER: u8 = 6;
    pub const RANDOMNESS_COLLECTIVE_FLIP: u8 = 7;
    pub const AUTHORSHIP: u8 = 10;
    pub const STAKING: u8 = 11;
    pub const HISTORY: u8 = 12;
    pub const SESSION: u8 = 13;
    pub const ELECTIONS: u8 = 14;
    pub const COMMITTEE_MANAGEMENT: u8 = 15;
    pub const TREASURY: u8 = 16;
    pub const NOMINATION_POOLS: u8 = 18;
    pub const UTILITY: u8 = 50;
    pub const MULTISIG: u8 = 51;
    pub const IDENTITY: u8 = 52;
    pub const VESTING: u8 = 53;
    pub const PROXY: u8 = 59;
    pub const ETHEREUM: u8 = 80;
    pub const EVM: u8 = 81;
    pub const DYNAMIC_EVM_BASE_FEE: u8 = 83;
    pub const ETH_CALL: u8 = 86;
    pub const CONTRACTS: u8 = 90;
    pub const SAFE_MODE: u8 = 100;
    pub const TX_PAUSE: u8 = 101;
    pub const OPERATIONS: u8 = 155;
    pub const SUDO: u8 = 200;
}

pub struct ExtrinsicDecoder {
    pallet_cache: std::collections::HashMap<(u8, u8), (String, String)>,
}

impl Default for ExtrinsicDecoder {
    fn default() -> Self {
        Self::new()
    }
}

impl ExtrinsicDecoder {
    pub fn new() -> Self {
        let mut decoder = Self {
            pallet_cache: std::collections::HashMap::new(),
        };
        decoder.initialize_cache();
        decoder
    }

    fn initialize_cache(&mut self) {
        use index_pallet::*;

        // Pre-populate common pallet calls
        let mappings = [
            // System
            ((SYSTEM, 0), ("System", "remark")),
            ((SYSTEM, 1), ("System", "set_heap_pages")),
            ((SYSTEM, 2), ("System", "set_code")),
            ((SYSTEM, 7), ("System", "remark_with_event")),
            // Timestamp
            ((TIMESTAMP, 0), ("Timestamp", "set")),
            // Balances
            ((BALANCES, 0), ("Balances", "transfer_allow_death")),
            ((BALANCES, 3), ("Balances", "transfer_keep_alive")),
            ((BALANCES, 4), ("Balances", "transfer_all")),
            // Staking
            ((STAKING, 0), ("Staking", "bond")),
            ((STAKING, 1), ("Staking", "bond_extra")),
            ((STAKING, 2), ("Staking", "unbond")),
            ((STAKING, 3), ("Staking", "withdraw_unbonded")),
            ((STAKING, 4), ("Staking", "validate")),
            ((STAKING, 5), ("Staking", "nominate")),
            // Session
            ((SESSION, 0), ("Session", "set_keys")),
            ((SESSION, 1), ("Session", "purge_keys")),
            // Utility
            ((UTILITY, 0), ("Utility", "batch")),
            ((UTILITY, 1), ("Utility", "as_derivative")),
            ((UTILITY, 2), ("Utility", "batch_all")),
            ((UTILITY, 3), ("Utility", "dispatch_as")),
            ((UTILITY, 4), ("Utility", "force_batch")),
            // Multisig
            ((MULTISIG, 0), ("Multisig", "as_multi_threshold_1")),
            ((MULTISIG, 1), ("Multisig", "as_multi")),
            ((MULTISIG, 2), ("Multisig", "approve_as_multi")),
            ((MULTISIG, 3), ("Multisig", "cancel_as_multi")),
            // Identity
            ((IDENTITY, 0), ("Identity", "add_registrar")),
            ((IDENTITY, 1), ("Identity", "set_identity")),
            ((IDENTITY, 2), ("Identity", "set_subs")),
            ((IDENTITY, 3), ("Identity", "clear_identity")),
            // Proxy
            ((PROXY, 0), ("Proxy", "proxy")),
            ((PROXY, 1), ("Proxy", "add_proxy")),
            ((PROXY, 2), ("Proxy", "remove_proxy")),
            ((PROXY, 3), ("Proxy", "remove_proxies")),
            // EVM
            ((EVM, 0), ("EVM", "withdraw")),
            ((EVM, 1), ("EVM", "call")),
            ((EVM, 2), ("EVM", "create")),
            ((EVM, 3), ("EVM", "create2")),
            // Ethereum
            ((ETHEREUM, 0), ("Ethereum", "transact")),
            // Contracts
            ((CONTRACTS, 0), ("Contracts", "call_old_weight")),
            (
                (CONTRACTS, 1),
                ("Contracts", "instantiate_with_code_old_weight"),
            ),
            ((CONTRACTS, 2), ("Contracts", "instantiate_old_weight")),
            ((CONTRACTS, 3), ("Contracts", "upload_code")),
            ((CONTRACTS, 4), ("Contracts", "remove_code")),
            ((CONTRACTS, 5), ("Contracts", "set_code")),
            ((CONTRACTS, 6), ("Contracts", "call")),
            ((CONTRACTS, 7), ("Contracts", "instantiate_with_code")),
            ((CONTRACTS, 8), ("Contracts", "instantiate")),
            // Sudo
            ((SUDO, 0), ("Sudo", "sudo")),
            ((SUDO, 1), ("Sudo", "sudo_unchecked_weight")),
            ((SUDO, 2), ("Sudo", "set_key")),
            ((SUDO, 3), ("Sudo", "sudo_as")),
        ];

        for ((pallet, call), (pallet_name, call_name)) in mappings {
            self.pallet_cache.insert(
                (pallet, call),
                (pallet_name.to_string(), call_name.to_string()),
            );
        }
    }

    pub async fn decode_extrinsic(
        &self,
        extrinsic_bytes: &[u8],
        index: u32,
    ) -> Result<ExtrinsicDetails, ServiceError> {
        if extrinsic_bytes.is_empty() {
            return Err(ServiceError::InsufficientData(
                "Empty extrinsic data".to_string(),
            ));
        }

        let (total_length, length_bytes) = self.decode_compact_length(extrinsic_bytes)?;

        // Enhanced bounds checking with more specific errors
        if length_bytes >= extrinsic_bytes.len() {
            return Err(ServiceError::InvalidData(format!(
                "Length bytes ({}) exceed data length ({})",
                length_bytes,
                extrinsic_bytes.len()
            )));
        }

        if total_length > extrinsic_bytes.len() {
            return Err(ServiceError::InvalidData(format!(
                "Declared length ({}) exceeds actual data length ({})",
                total_length,
                extrinsic_bytes.len()
            )));
        }

        let version_byte = extrinsic_bytes[length_bytes];
        let is_signed = (version_byte & 0x80) != 0;

        let signature_info = if is_signed {
            Some(self.decode_signature_info(extrinsic_bytes, length_bytes)?)
        } else {
            None
        };

        let call_info = self
            .decode_call_info(extrinsic_bytes, is_signed, length_bytes)
            .await?;

        Ok(ExtrinsicDetails {
            index,
            is_signed,
            signature_info,
            call_info,
            raw_length: extrinsic_bytes.len(),
            hash: "0x".to_string(),
        })
    }

    // Optimized signature decoding with better error handling
    fn decode_signature_info(
        &self,
        raw_data: &[u8],
        length_offset: usize,
    ) -> Result<SignatureInfo, ServiceError> {
        let mut cursor = length_offset + 1;

        // Bounds check before extraction
        if cursor + SIGNER_BYTES + SIGNATURE_BYTES > raw_data.len() {
            return Err(ServiceError::InsufficientData(
                "Not enough data for signature".to_string(),
            ));
        }

        let signer = hex::encode(&raw_data[cursor..cursor + SIGNER_BYTES]);
        cursor += SIGNER_BYTES;

        let signature = hex::encode(&raw_data[cursor..cursor + SIGNATURE_BYTES]);
        cursor += SIGNATURE_BYTES;

        let era = self.extract_era(raw_data, &mut cursor)?;
        let nonce = self.extract_compact_field(raw_data, &mut cursor, "nonce")? as u64;
        let tip = self.extract_compact_field(raw_data, &mut cursor, "tip")? as u128;

        Ok(SignatureInfo {
            signer: format!("0x{}", signer),
            signature: format!("0x{}", signature),
            era,
            nonce,
            tip,
        })
    }

    fn extract_era(&self, raw_data: &[u8], cursor: &mut usize) -> Result<Era, ServiceError> {
        if *cursor >= raw_data.len() {
            return Err(ServiceError::InsufficientData(
                "Missing era data".to_string(),
            ));
        }

        let era_byte = raw_data[*cursor];
        let era = if era_byte == 0 {
            *cursor += 1;
            Era::Immortal
        } else {
            if *cursor + 1 >= raw_data.len() {
                return Err(ServiceError::InsufficientData(
                    "Incomplete mortal era data".to_string(),
                ));
            }
            *cursor += 2;
            Era::Mortal(era_byte)
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
            return Err(ServiceError::InsufficientData(format!(
                "Missing {} data",
                field_name
            )));
        }

        let (value, bytes_consumed) = self
            .decode_compact_length(&raw_data[*cursor..])
            .map_err(|_| ServiceError::InvalidData(format!("Failed to decode {}", field_name)))?;

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
            length_offset + 1
        };

        if call_start >= raw_data.len() {
            return Ok(CallInfo::invalid());
        }

        let call_data = &raw_data[call_start..];
        if call_data.len() < 2 {
            return Ok(CallInfo::invalid());
        }

        let pallet_index = call_data[0];
        let call_index = call_data[1];

        // Use cache for common pallet calls
        let (pallet_name, call_name) = self
            .pallet_cache
            .get(&(pallet_index, call_index))
            .cloned()
            .unwrap_or_else(|| self.map_pallet_call_uncached(pallet_index, call_index));

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

    // Optimized call start finding with early returns
    fn find_call_start_signed(
        &self,
        raw_data: &[u8],
        length_offset: usize,
    ) -> Result<usize, ServiceError> {
        // Try optimized search first for common patterns
        if let Some(start) = self.find_balance_transfer_call(raw_data, length_offset) {
            return Ok(start);
        }

        // Fallback to calculated approach
        self.calculate_call_start_signed(raw_data, length_offset)
    }

    fn find_balance_transfer_call(&self, raw_data: &[u8], length_offset: usize) -> Option<usize> {
        let search_start = length_offset + MIN_SEARCH_OFFSET;
        let search_end = raw_data.len().saturating_sub(34);

        for i in search_start..search_end {
            if i + 1 < raw_data.len() {
                let pallet = raw_data[i];
                let call = raw_data[i + 1];

                if pallet == index_pallet::BALANCES && call <= 5 {
                    // Validate we have enough data for a balance transfer
                    if raw_data.len() - i >= 34 {
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
        let mut cursor = length_offset + 1;

        // Skip signer and signature
        cursor += SIGNER_BYTES + SIGNATURE_BYTES;

        // Skip era
        if cursor < raw_data.len() {
            cursor += if raw_data[cursor] == 0 { 1 } else { 2 };
        }

        // Skip nonce
        if cursor < raw_data.len() {
            let (_, nonce_bytes) = self.decode_compact_length(&raw_data[cursor..])?;
            cursor += nonce_bytes;
        }

        // Skip tip
        if cursor < raw_data.len() {
            let (_, tip_bytes) = self.decode_compact_length(&raw_data[cursor..])?;
            cursor += tip_bytes;
        }

        Ok(cursor)
    }

    // Optimized pallet call mapping with fallback
    fn map_pallet_call_uncached(&self, pallet_index: u8, call_index: u8) -> (String, String) {
        use index_pallet::*;

        match pallet_index {
            SYSTEM => (String::from("System"), self.map_system_call(call_index)),
            AURA => (String::from("Aura"), self.map_aura_call(call_index)),
            ALEPH => (String::from("Aleph"), self.map_aleph_call(call_index)),
            TIMESTAMP => (
                String::from("Timestamp"),
                self.map_timestamp_call(call_index),
            ),
            BALANCES => (String::from("Balances"), self.map_balance_call(call_index)),
            TRANSACTION_PAYMENT => (
                String::from("TransactionPayment"),
                self.map_transaction_payment_call(call_index),
            ),
            SCHEDULER => (
                String::from("Scheduler"),
                self.map_scheduler_call(call_index),
            ),
            RANDOMNESS_COLLECTIVE_FLIP => (
                String::from("RandomnessCollectiveFlip"),
                self.map_randomness_call(call_index),
            ),
            AUTHORSHIP => (
                String::from("Authorship"),
                self.map_authorship_call(call_index),
            ),
            STAKING => (String::from("Staking"), self.map_staking_call(call_index)),
            HISTORY => (String::from("History"), self.map_history_call(call_index)),
            SESSION => (String::from("Session"), self.map_session_call(call_index)),
            ELECTIONS => (
                String::from("Elections"),
                self.map_elections_call(call_index),
            ),
            COMMITTEE_MANAGEMENT => (
                String::from("CommitteeManagement"),
                self.map_committee_management_call(call_index),
            ),
            TREASURY => (String::from("Treasury"), self.map_treasury_call(call_index)),
            NOMINATION_POOLS => (
                String::from("NominationPools"),
                self.map_nomination_pools_call(call_index),
            ),
            UTILITY => (String::from("Utility"), self.map_utility_call(call_index)),
            MULTISIG => (String::from("Multisig"), self.map_multisig_call(call_index)),
            IDENTITY => (String::from("Identity"), self.map_identity_call(call_index)),
            VESTING => (String::from("Vesting"), self.map_vesting_call(call_index)),
            PROXY => (String::from("Proxy"), self.map_proxy_call(call_index)),
            ETHEREUM => (String::from("Ethereum"), self.map_ethereum_call(call_index)),
            EVM => (String::from("EVM"), self.map_evm_call(call_index)),
            DYNAMIC_EVM_BASE_FEE => (
                String::from("DynamicEvmBaseFee"),
                self.map_dynamic_evm_base_fee_call(call_index),
            ),
            ETH_CALL => (String::from("EthCall"), self.map_eth_call_call(call_index)),
            CONTRACTS => (
                String::from("Contracts"),
                self.map_contracts_call(call_index),
            ),
            SAFE_MODE => (
                String::from("SafeMode"),
                self.map_safe_mode_call(call_index),
            ),
            TX_PAUSE => (String::from("TxPause"), self.map_tx_pause_call(call_index)),
            OPERATIONS => (
                String::from("Operations"),
                self.map_operations_call(call_index),
            ),
            SUDO => (String::from("Sudo"), self.map_sudo_call(call_index)),
            _ => (
                format!("Pallet_{}", pallet_index),
                format!("Call_{}", call_index),
            ),
        }
    }

    // Optimized call name mapping with const arrays
    fn map_system_call(&self, call_index: u8) -> String {
        const SYSTEM_CALLS: &[&str] = &[
            "remark",
            "set_heap_pages",
            "set_code",
            "set_code_without_checks",
            "set_storage",
            "kill_storage",
            "kill_prefix",
            "remark_with_event",
        ];

        SYSTEM_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Aura pallet calls
    fn map_aura_call(&self, call_index: u8) -> String {
        const AURA_CALLS: &[&str] = &["report_equivocation", "report_equivocation_unsigned"];

        AURA_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Aleph pallet calls
    fn map_aleph_call(&self, call_index: u8) -> String {
        const ALEPH_CALLS: &[&str] = &[
            "set_emergency_finalizer",
            "schedule_finality_version_change",
            "finality_version_change",
            "set_next_session_keys",
        ];

        ALEPH_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Timestamp pallet calls
    fn map_timestamp_call(&self, call_index: u8) -> String {
        const TIMESTAMP_CALLS: &[&str] = &["set"];

        TIMESTAMP_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    fn map_balance_call(&self, call_index: u8) -> String {
        const BALANCE_CALLS: &[&str] = &[
            "transfer_allow_death",
            "set_balance",
            "force_transfer",
            "transfer_keep_alive",
            "transfer_all",
            "force_unreserve",
        ];

        BALANCE_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Transaction Payment pallet calls
    fn map_transaction_payment_call(&self, call_index: u8) -> String {
        const TRANSACTION_PAYMENT_CALLS: &[&str] =
            &["set_alternative_fee_swap_path", "disable_charge_fee_pool"];

        TRANSACTION_PAYMENT_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Scheduler pallet calls
    fn map_scheduler_call(&self, call_index: u8) -> String {
        const SCHEDULER_CALLS: &[&str] = &[
            "schedule",
            "cancel",
            "schedule_named",
            "cancel_named",
            "schedule_after",
            "schedule_named_after",
        ];

        SCHEDULER_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Randomness Collective Flip pallet calls
    fn map_randomness_call(&self, _call_index: u8) -> String {
        "unknown".to_string() // This pallet typically has no callable functions
    }

    // Authorship pallet calls
    fn map_authorship_call(&self, call_index: u8) -> String {
        const AUTHORSHIP_CALLS: &[&str] = &["set_uncles"];

        AUTHORSHIP_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Staking pallet calls
    fn map_staking_call(&self, call_index: u8) -> String {
        const STAKING_CALLS: &[&str] = &[
            "bond",
            "bond_extra",
            "unbond",
            "withdraw_unbonded",
            "validate",
            "nominate",
            "chill",
            "set_payee",
            "set_controller",
            "set_validator_count",
            "increase_validator_count",
            "scale_validator_count",
            "force_no_eras",
            "force_new_era",
            "set_invulnerables",
            "force_unstake",
            "force_new_era_always",
            "cancel_deferred_slash",
            "payout_stakers",
            "rebond",
            "reap_stash",
            "kick",
            "set_staking_configs",
            "chill_other",
            "force_apply_min_commission",
        ];

        STAKING_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // History pallet calls
    fn map_history_call(&self, call_index: u8) -> String {
        const HISTORY_CALLS: &[&str] = &["prune_range"];

        HISTORY_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Session pallet calls
    fn map_session_call(&self, call_index: u8) -> String {
        const SESSION_CALLS: &[&str] = &["set_keys", "purge_keys"];

        SESSION_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Elections pallet calls
    fn map_elections_call(&self, call_index: u8) -> String {
        const ELECTIONS_CALLS: &[&str] = &[
            "vote",
            "remove_voter",
            "submit_candidacy",
            "renounce_candidacy",
            "remove_member",
            "clean_defunct_voters",
        ];

        ELECTIONS_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Committee Management pallet calls
    fn map_committee_management_call(&self, call_index: u8) -> String {
        const COMMITTEE_MANAGEMENT_CALLS: &[&str] =
            &["set_ban_config", "ban_from_committee", "cancel_ban"];

        COMMITTEE_MANAGEMENT_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Treasury pallet calls
    fn map_treasury_call(&self, call_index: u8) -> String {
        const TREASURY_CALLS: &[&str] = &[
            "propose_spend",
            "reject_proposal",
            "approve_proposal",
            "spend",
            "remove_approval",
        ];

        TREASURY_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Nomination Pools pallet calls
    fn map_nomination_pools_call(&self, call_index: u8) -> String {
        const NOMINATION_POOLS_CALLS: &[&str] = &[
            "join",
            "bond_extra",
            "claim_payout",
            "unbond",
            "pool_withdraw_unbonded",
            "withdraw_unbonded",
            "create",
            "create_with_pool_id",
            "nominate",
            "set_state",
            "set_metadata",
            "set_configs",
            "update_roles",
            "chill",
            "bond_extra_other",
            "set_claim_permission",
            "claim_payout_other",
            "set_commission",
            "set_commission_max",
            "set_commission_change_rate",
            "claim_commission",
        ];

        NOMINATION_POOLS_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Utility pallet calls
    fn map_utility_call(&self, call_index: u8) -> String {
        const UTILITY_CALLS: &[&str] = &[
            "batch",
            "as_derivative",
            "batch_all",
            "dispatch_as",
            "force_batch",
            "with_weight",
        ];

        UTILITY_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Multisig pallet calls
    fn map_multisig_call(&self, call_index: u8) -> String {
        const MULTISIG_CALLS: &[&str] = &[
            "as_multi_threshold_1",
            "as_multi",
            "approve_as_multi",
            "cancel_as_multi",
        ];

        MULTISIG_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Identity pallet calls
    fn map_identity_call(&self, call_index: u8) -> String {
        const IDENTITY_CALLS: &[&str] = &[
            "add_registrar",
            "set_identity",
            "set_subs",
            "clear_identity",
            "request_judgement",
            "cancel_request",
            "set_fee",
            "set_account_id",
            "set_fields",
            "provide_judgement",
            "kill_identity",
            "add_sub",
            "rename_sub",
            "remove_sub",
            "quit_sub",
        ];

        IDENTITY_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Vesting pallet calls
    fn map_vesting_call(&self, call_index: u8) -> String {
        const VESTING_CALLS: &[&str] = &[
            "vest",
            "vest_other",
            "vested_transfer",
            "force_vested_transfer",
            "merge_schedules",
        ];

        VESTING_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Proxy pallet calls
    fn map_proxy_call(&self, call_index: u8) -> String {
        const PROXY_CALLS: &[&str] = &[
            "proxy",
            "add_proxy",
            "remove_proxy",
            "remove_proxies",
            "create_pure",
            "kill_pure",
            "announce",
            "remove_announcement",
            "reject_announcement",
            "proxy_announced",
        ];

        PROXY_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Ethereum pallet calls
    fn map_ethereum_call(&self, call_index: u8) -> String {
        const ETHEREUM_CALLS: &[&str] = &["transact", "message_transact"];

        ETHEREUM_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // EVM pallet calls
    fn map_evm_call(&self, call_index: u8) -> String {
        const EVM_CALLS: &[&str] = &[
            "withdraw",
            "call",
            "create",
            "create2",
            "create_nonce_metadata",
            "create_account_metadata",
            "remove_account_metadata",
        ];

        EVM_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Dynamic EVM Base Fee pallet calls
    fn map_dynamic_evm_base_fee_call(&self, call_index: u8) -> String {
        const DYNAMIC_EVM_BASE_FEE_CALLS: &[&str] = &["set_base_fee_per_gas"];

        DYNAMIC_EVM_BASE_FEE_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // EthCall pallet calls
    fn map_eth_call_call(&self, call_index: u8) -> String {
        const ETH_CALL_CALLS: &[&str] = &["call"];

        ETH_CALL_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Contracts pallet calls
    fn map_contracts_call(&self, call_index: u8) -> String {
        const CONTRACTS_CALLS: &[&str] = &[
            "call_old_weight",
            "instantiate_with_code_old_weight",
            "instantiate_old_weight",
            "upload_code",
            "remove_code",
            "set_code",
            "call",
            "instantiate_with_code",
            "instantiate",
            "migrate",
        ];

        CONTRACTS_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Safe Mode pallet calls
    fn map_safe_mode_call(&self, call_index: u8) -> String {
        const SAFE_MODE_CALLS: &[&str] = &[
            "enter",
            "force_enter",
            "extend",
            "force_extend",
            "exit",
            "force_exit",
            "force_slash_deposit",
            "release_deposit",
            "force_release_deposit",
        ];

        SAFE_MODE_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Tx Pause pallet calls
    fn map_tx_pause_call(&self, call_index: u8) -> String {
        const TX_PAUSE_CALLS: &[&str] = &["pause", "unpause"];

        TX_PAUSE_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Operations pallet calls
    fn map_operations_call(&self, call_index: u8) -> String {
        const OPERATIONS_CALLS: &[&str] =
            &["heartbeat", "set_keys", "force_new_era", "force_no_eras"];

        OPERATIONS_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Sudo pallet calls
    fn map_sudo_call(&self, call_index: u8) -> String {
        const SUDO_CALLS: &[&str] = &["sudo", "sudo_unchecked_weight", "set_key", "sudo_as"];

        SUDO_CALLS
            .get(call_index as usize)
            .unwrap_or(&"unknown")
            .to_string()
    }

    // Optimized argument extraction with better error handling
    fn extract_call_args(
        &self,
        call_args: &[u8],
        pallet_index: u8,
        call_index: u8,
    ) -> Vec<(String, String)> {
        use index_pallet::*;

        match (pallet_index, call_index) {
            // System pallet
            (SYSTEM, 0) => self.extract_system_remark_args(call_args),
            (SYSTEM, 1) => self.extract_system_set_heap_pages_args(call_args),
            (SYSTEM, 2 | 3) => self.extract_system_set_code_args(call_args),
            (SYSTEM, 7) => self.extract_system_remark_args(call_args),

            // Timestamp pallet
            (TIMESTAMP, 0) => self.extract_timestamp_args(call_args),

            // Balances pallet
            (BALANCES, 0 | 3) => self.extract_balance_transfer_args(call_args),
            (BALANCES, 1) => self.extract_balance_set_balance_args(call_args),
            (BALANCES, 2) => self.extract_balance_force_transfer_args(call_args),
            (BALANCES, 4) => self.extract_balance_transfer_all_args(call_args),

            // Staking pallet
            (STAKING, 0) => self.extract_staking_bond_args(call_args),
            (STAKING, 1) => self.extract_staking_bond_extra_args(call_args),
            (STAKING, 2) => self.extract_staking_unbond_args(call_args),
            (STAKING, 4) => self.extract_staking_validate_args(call_args),
            (STAKING, 5) => self.extract_staking_nominate_args(call_args),

            // Session pallet
            (SESSION, 0) => self.extract_session_set_keys_args(call_args),

            // Utility pallet
            (UTILITY, 0 | 2 | 4) => self.extract_utility_batch_args(call_args),
            (UTILITY, 1) => self.extract_utility_as_derivative_args(call_args),
            (UTILITY, 3) => self.extract_utility_dispatch_as_args(call_args),

            // Multisig pallet
            (MULTISIG, 0) => self.extract_multisig_as_multi_threshold_1_args(call_args),
            (MULTISIG, 1 | 2) => self.extract_multisig_as_multi_args(call_args),

            // Identity pallet
            (IDENTITY, 1) => self.extract_identity_set_identity_args(call_args),
            (IDENTITY, 2) => self.extract_identity_set_subs_args(call_args),

            // Proxy pallet
            (PROXY, 0) => self.extract_proxy_proxy_args(call_args),
            (PROXY, 1) => self.extract_proxy_add_proxy_args(call_args),

            // EVM pallet
            (EVM, 0) => self.extract_evm_withdraw_args(call_args),
            (EVM, 1) => self.extract_evm_call_args(call_args),
            (EVM, 2) => self.extract_evm_create_args(call_args),
            (EVM, 3) => self.extract_evm_create2_args(call_args),

            // Ethereum pallet
            (ETHEREUM, 0) => self.extract_ethereum_transact_args(call_args),

            // Contracts pallet
            (CONTRACTS, 6) => self.extract_contracts_call_args(call_args),
            (CONTRACTS, 7 | 8) => self.extract_contracts_instantiate_args(call_args),
            (CONTRACTS, 3) => self.extract_contracts_upload_code_args(call_args),

            // Sudo pallet
            (SUDO, 0 | 1) => self.extract_sudo_sudo_args(call_args),
            (SUDO, 2) => self.extract_sudo_set_key_args(call_args),
            (SUDO, 3) => self.extract_sudo_sudo_as_args(call_args),
            _ if !call_args.is_empty() => {
                vec![(
                    "raw_args".to_string(),
                    format!("0x{}", hex::encode(call_args)),
                )]
            }
            _ => Vec::new(),
        }
    }

    fn extract_system_remark_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((len, len_bytes)) => {
                let data_start = len_bytes;
                let data_end = data_start + len;
                if data_end <= call_args.len() {
                    vec![(
                        "remark".to_string(),
                        format!("0x{}", hex::encode(&call_args[data_start..data_end])),
                    )]
                } else {
                    vec![("remark".to_string(), "decode_error".to_string())]
                }
            }
            Err(_) => vec![("remark".to_string(), "decode_error".to_string())],
        }
    }

    fn extract_system_set_heap_pages_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() >= 8 {
            let pages = u64::from_le_bytes(call_args[0..8].try_into().unwrap_or_default());
            vec![("pages".to_string(), pages.to_string())]
        } else {
            vec![("pages".to_string(), "decode_error".to_string())]
        }
    }

    fn extract_system_set_code_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((len, len_bytes)) => {
                let data_start = len_bytes;
                let data_end = data_start + len;
                if data_end <= call_args.len() {
                    vec![(
                        "code".to_string(),
                        format!("0x{}", hex::encode(&call_args[data_start..data_end])),
                    )]
                } else {
                    vec![("code".to_string(), "decode_error".to_string())]
                }
            }
            Err(_) => vec![("code".to_string(), "decode_error".to_string())],
        }
    }

    fn extract_timestamp_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
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

        // Extract destination (first 32 bytes)
        args.push((
            "dest".to_string(),
            format!("0x{}", hex::encode(&call_args[0..32])),
        ));

        // Extract value (compact encoded after destination)
        if call_args.len() > 32 {
            match self.decode_compact_length(&call_args[32..]) {
                Ok((value, _)) => args.push(("value".to_string(), value.to_string())),
                Err(_) => args.push(("value".to_string(), "decode_error".to_string())),
            }
        }

        args
    }

    // Balance pallet argument extractors (keeping existing ones)
    fn extract_balance_set_balance_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(3);
        let mut cursor = 0;

        // Account (32 bytes)
        args.push((
            "who".to_string(),
            format!("0x{}", hex::encode(&call_args[cursor..cursor + 32])),
        ));
        cursor += 32;

        // New free balance
        if let Ok((new_free, bytes)) = self.decode_compact_length(&call_args[cursor..]) {
            args.push(("new_free".to_string(), new_free.to_string()));
            cursor += bytes;
        }

        // New reserved balance
        if cursor < call_args.len() {
            if let Ok((new_reserved, _)) = self.decode_compact_length(&call_args[cursor..]) {
                args.push(("new_reserved".to_string(), new_reserved.to_string()));
            }
        }

        args
    }

    fn extract_balance_force_transfer_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 64 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(3);

        // Source (32 bytes)
        args.push((
            "source".to_string(),
            format!("0x{}", hex::encode(&call_args[0..32])),
        ));

        // Dest (32 bytes)
        args.push((
            "dest".to_string(),
            format!("0x{}", hex::encode(&call_args[32..64])),
        ));

        // Value
        if call_args.len() > 64 {
            match self.decode_compact_length(&call_args[64..]) {
                Ok((value, _)) => args.push(("value".to_string(), value.to_string())),
                Err(_) => args.push(("value".to_string(), "decode_error".to_string())),
            }
        }

        args
    }

    fn extract_balance_transfer_all_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        // Dest (32 bytes)
        args.push((
            "dest".to_string(),
            format!("0x{}", hex::encode(&call_args[0..32])),
        ));

        // Keep alive (1 byte)
        if call_args.len() > 32 {
            args.push(("keep_alive".to_string(), (call_args[32] != 0).to_string()));
        }

        args
    }

    fn extract_evm_withdraw_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < EVM_ADDRESS_BYTES {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        args.push((
            "address".to_string(),
            format!("0x{}", hex::encode(&call_args[0..EVM_ADDRESS_BYTES])),
        ));

        if call_args.len() > EVM_ADDRESS_BYTES {
            match self.decode_compact_length(&call_args[EVM_ADDRESS_BYTES..]) {
                Ok((value, _)) => args.push(("value".to_string(), value.to_string())),
                Err(_) => args.push(("value".to_string(), "decode_error".to_string())),
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

        // Source address
        args.push((
            "source".to_string(),
            format!(
                "0x{}",
                hex::encode(&call_args[cursor..cursor + EVM_ADDRESS_BYTES])
            ),
        ));
        cursor += EVM_ADDRESS_BYTES;

        // Target address
        args.push((
            "target".to_string(),
            format!(
                "0x{}",
                hex::encode(&call_args[cursor..cursor + EVM_ADDRESS_BYTES])
            ),
        ));
        cursor += EVM_ADDRESS_BYTES;

        // Input data (variable length)
        cursor += self.extract_variable_length_field(call_args, cursor, "input", &mut args);

        // Value and gas limit
        self.extract_value_and_gas(call_args, cursor, &mut args);

        args
    }

    fn extract_evm_create_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < EVM_ADDRESS_BYTES {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(4);
        let mut cursor = 0;

        // Source address
        args.push((
            "source".to_string(),
            format!(
                "0x{}",
                hex::encode(&call_args[cursor..cursor + EVM_ADDRESS_BYTES])
            ),
        ));
        cursor += EVM_ADDRESS_BYTES;

        // Init code
        cursor += self.extract_variable_length_field(call_args, cursor, "init", &mut args);

        // Value and gas limit
        self.extract_value_and_gas(call_args, cursor, &mut args);

        args
    }

    fn extract_evm_create2_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 52 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(5);
        let mut cursor = 0;

        // Source address
        args.push((
            "source".to_string(),
            format!(
                "0x{}",
                hex::encode(&call_args[cursor..cursor + EVM_ADDRESS_BYTES])
            ),
        ));
        cursor += EVM_ADDRESS_BYTES;

        // Init code
        cursor += self.extract_variable_length_field(call_args, cursor, "init", &mut args);

        // Salt
        if cursor + VALUE_BYTES <= call_args.len() {
            args.push((
                "salt".to_string(),
                format!(
                    "0x{}",
                    hex::encode(&call_args[cursor..cursor + VALUE_BYTES])
                ),
            ));
            cursor += VALUE_BYTES;
        }

        // Value and gas limit
        self.extract_value_and_gas(call_args, cursor, &mut args);

        args
    }

    fn extract_ethereum_transact_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.is_empty() {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        // Transaction type
        args.push((
            "transaction_type".to_string(),
            format!("0x{:02x}", call_args[0]),
        ));

        // Transaction data
        if call_args.len() > 1 {
            args.push((
                "transaction_data".to_string(),
                format!("0x{}", hex::encode(&call_args[1..])),
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
                    args.push((
                        field_name.to_string(),
                        format!("0x{}", hex::encode(&call_args[data_start..data_end])),
                    ));
                    len_bytes + len
                } else {
                    args.push((field_name.to_string(), "0x".to_string()));
                    len_bytes
                }
            }
            Err(_) => {
                args.push((field_name.to_string(), "decode_error".to_string()));
                0
            }
        }
    }

    fn extract_value_and_gas(
        &self,
        call_args: &[u8],
        mut cursor: usize,
        args: &mut Vec<(String, String)>,
    ) {
        // Value (32 bytes)
        if cursor + VALUE_BYTES <= call_args.len() {
            args.push((
                "value".to_string(),
                format!(
                    "0x{}",
                    hex::encode(&call_args[cursor..cursor + VALUE_BYTES])
                ),
            ));
            cursor += VALUE_BYTES;
        }

        // Gas limit (8 bytes)
        if cursor + GAS_LIMIT_BYTES <= call_args.len() {
            let gas_bytes = &call_args[cursor..cursor + GAS_LIMIT_BYTES];
            let gas_limit = u64::from_le_bytes(gas_bytes.try_into().unwrap_or_default());
            args.push(("gas_limit".to_string(), gas_limit.to_string()));
        }
    }

    // Optimized compact length decoding with better error handling
    fn decode_compact_length(&self, data: &[u8]) -> Result<(usize, usize), ServiceError> {
        if data.is_empty() {
            return Err(ServiceError::InsufficientData(
                "Empty data for compact length".to_string(),
            ));
        }

        let first_byte = data[0];

        match first_byte & 0b11 {
            0b00 => Ok((first_byte as usize >> 2, 1)),
            0b01 => {
                if data.len() < 2 {
                    return Err(ServiceError::InsufficientData(
                        "Need 2 bytes for compact length".to_string(),
                    ));
                }
                let value = ((first_byte as usize & 0xfc) >> 2) | ((data[1] as usize) << 6);
                Ok((value, 2))
            }
            0b10 => {
                if data.len() < 4 {
                    return Err(ServiceError::InsufficientData(
                        "Need 4 bytes for compact length".to_string(),
                    ));
                }
                let value = ((first_byte as usize & 0xfc) >> 2)
                    | ((data[1] as usize) << 6)
                    | ((data[2] as usize) << 14)
                    | ((data[3] as usize) << 22);
                Ok((value, 4))
            }
            _ => {
                let length = (first_byte >> 2) as usize + 4;
                if data.len() < length + 1 {
                    return Err(ServiceError::InsufficientData(format!(
                        "Need {} bytes for big integer compact",
                        length + 1
                    )));
                }
                // For big integers, we return the byte count, not the actual value
                Ok((length, length + 1))
            }
        }
    }

    fn extract_contracts_call_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(4);
        let mut cursor = 0;

        // Dest (32 bytes)
        args.push((
            "dest".to_string(),
            format!("0x{}", hex::encode(&call_args[cursor..cursor + 32])),
        ));
        cursor += 32;

        // Value (compact encoded)
        if let Ok((value, bytes)) = self.decode_compact_length(&call_args[cursor..]) {
            args.push(("value".to_string(), value.to_string()));
            cursor += bytes;
        }

        // Gas limit (compact encoded)
        if let Ok((gas_limit, bytes)) = self.decode_compact_length(&call_args[cursor..]) {
            args.push(("gas_limit".to_string(), gas_limit.to_string()));
            cursor += bytes;
        }

        // Data
        if cursor < call_args.len() {
            self.extract_variable_length_field(call_args, cursor, "data", &mut args);
        }

        args
    }

    fn extract_contracts_instantiate_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        let mut args = Vec::with_capacity(5);
        let mut cursor = 0;

        // Value (compact encoded)
        if let Ok((value, bytes)) = self.decode_compact_length(&call_args[cursor..]) {
            args.push(("value".to_string(), value.to_string()));
            cursor += bytes;
        }

        // Gas limit (compact encoded)
        if cursor < call_args.len() {
            if let Ok((gas_limit, bytes)) = self.decode_compact_length(&call_args[cursor..]) {
                args.push(("gas_limit".to_string(), gas_limit.to_string()));
                cursor += bytes;
            }
        }

        // Code hash or code (32 bytes)
        if cursor + 32 <= call_args.len() {
            args.push((
                "code_hash".to_string(),
                format!("0x{}", hex::encode(&call_args[cursor..cursor + 32])),
            ));
            cursor += 32;
        }

        // Data
        if cursor < call_args.len() {
            cursor += self.extract_variable_length_field(call_args, cursor, "data", &mut args);
        }

        // Salt
        if cursor + 32 <= call_args.len() {
            args.push((
                "salt".to_string(),
                format!("0x{}", hex::encode(&call_args[cursor..cursor + 32])),
            ));
        }

        args
    }

    fn extract_contracts_upload_code_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        let mut args = Vec::with_capacity(2);
        let mut cursor = 0;

        // Code
        cursor += self.extract_variable_length_field(call_args, cursor, "code", &mut args);

        // Storage deposit limit (optional)
        if cursor < call_args.len() {
            if let Ok((deposit_limit, _)) = self.decode_compact_length(&call_args[cursor..]) {
                args.push((
                    "storage_deposit_limit".to_string(),
                    deposit_limit.to_string(),
                ));
            }
        }

        args
    }

    // Sudo pallet argument extractors
    fn extract_sudo_sudo_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        vec![("call".to_string(), format!("0x{}", hex::encode(call_args)))]
    }

    fn extract_sudo_set_key_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() >= 32 {
            vec![(
                "new_key".to_string(),
                format!("0x{}", hex::encode(&call_args[0..32])),
            )]
        } else {
            vec![("new_key".to_string(), "decode_error".to_string())]
        }
    }

    fn extract_sudo_sudo_as_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        // Who (32 bytes)
        args.push((
            "who".to_string(),
            format!("0x{}", hex::encode(&call_args[0..32])),
        ));

        // Call data
        if call_args.len() > 32 {
            args.push((
                "call".to_string(),
                format!("0x{}", hex::encode(&call_args[32..])),
            ));
        }

        args
    }

    // Staking pallet argument extractors
    fn extract_staking_bond_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(3);
        let mut cursor = 0;

        // Controller (32 bytes)
        args.push((
            "controller".to_string(),
            format!("0x{}", hex::encode(&call_args[cursor..cursor + 32])),
        ));
        cursor += 32;

        // Value
        if let Ok((value, bytes)) = self.decode_compact_length(&call_args[cursor..]) {
            args.push(("value".to_string(), value.to_string()));
            cursor += bytes;
        }

        // Payee
        if cursor < call_args.len() {
            args.push(("payee".to_string(), format!("0x{:02x}", call_args[cursor])));
        }

        args
    }

    fn extract_staking_bond_extra_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((max_additional, _)) => {
                vec![("max_additional".to_string(), max_additional.to_string())]
            }
            Err(_) => vec![("max_additional".to_string(), "decode_error".to_string())],
        }
    }

    fn extract_staking_unbond_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((value, _)) => vec![("value".to_string(), value.to_string())],
            Err(_) => vec![("value".to_string(), "decode_error".to_string())],
        }
    }

    fn extract_staking_validate_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() >= 4 {
            let commission = u32::from_le_bytes(call_args[0..4].try_into().unwrap_or_default());
            vec![("commission".to_string(), commission.to_string())]
        } else {
            vec![("commission".to_string(), "decode_error".to_string())]
        }
    }

    fn extract_staking_nominate_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((targets_count, len_bytes)) => {
                let mut args = Vec::with_capacity(1);
                let mut targets = Vec::new();
                let mut cursor = len_bytes;

                for _ in 0..targets_count {
                    if cursor + 32 <= call_args.len() {
                        targets.push(format!(
                            "0x{}",
                            hex::encode(&call_args[cursor..cursor + 32])
                        ));
                        cursor += 32;
                    }
                }

                args.push(("targets".to_string(), targets.join(",")));
                args
            }
            Err(_) => vec![("targets".to_string(), "decode_error".to_string())],
        }
    }

    // Session pallet argument extractors
    fn extract_session_set_keys_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return vec![("keys".to_string(), "decode_error".to_string())];
        }

        let mut args = Vec::with_capacity(2);

        // Keys (variable length, typically 32+ bytes)
        args.push((
            "keys".to_string(),
            format!("0x{}", hex::encode(&call_args[0..32])),
        ));

        // Proof (remaining bytes)
        if call_args.len() > 32 {
            args.push((
                "proof".to_string(),
                format!("0x{}", hex::encode(&call_args[32..])),
            ));
        }

        args
    }

    // Utility pallet argument extractors
    fn extract_utility_batch_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((calls_count, len_bytes)) => {
                vec![
                    ("calls_count".to_string(), calls_count.to_string()),
                    (
                        "calls_data".to_string(),
                        format!("0x{}", hex::encode(&call_args[len_bytes..])),
                    ),
                ]
            }
            Err(_) => vec![("calls".to_string(), "decode_error".to_string())],
        }
    }

    fn extract_utility_as_derivative_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 2 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        // Index (u16)
        let index = u16::from_le_bytes(call_args[0..2].try_into().unwrap_or_default());
        args.push(("index".to_string(), index.to_string()));

        // Call data
        if call_args.len() > 2 {
            args.push((
                "call".to_string(),
                format!("0x{}", hex::encode(&call_args[2..])),
            ));
        }

        args
    }

    fn extract_utility_dispatch_as_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 1 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(2);

        // As origin type
        args.push(("as_origin".to_string(), format!("0x{:02x}", call_args[0])));

        // Call data
        if call_args.len() > 1 {
            args.push((
                "call".to_string(),
                format!("0x{}", hex::encode(&call_args[1..])),
            ));
        }

        args
    }

    // Multisig pallet argument extractors
    fn extract_multisig_as_multi_threshold_1_args(
        &self,
        call_args: &[u8],
    ) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((signatories_count, len_bytes)) => {
                let mut args = Vec::with_capacity(2);
                let mut cursor = len_bytes;
                let mut signatories = Vec::new();

                for _ in 0..signatories_count {
                    if cursor + 32 <= call_args.len() {
                        signatories.push(format!(
                            "0x{}",
                            hex::encode(&call_args[cursor..cursor + 32])
                        ));
                        cursor += 32;
                    }
                }

                args.push(("other_signatories".to_string(), signatories.join(",")));

                if cursor < call_args.len() {
                    args.push((
                        "call".to_string(),
                        format!("0x{}", hex::encode(&call_args[cursor..])),
                    ));
                }

                args
            }
            Err(_) => vec![("signatories".to_string(), "decode_error".to_string())],
        }
    }

    fn extract_multisig_as_multi_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 2 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(4);
        let mut cursor = 0;

        // Threshold (u16)
        let threshold =
            u16::from_le_bytes(call_args[cursor..cursor + 2].try_into().unwrap_or_default());
        args.push(("threshold".to_string(), threshold.to_string()));
        cursor += 2;

        // Other signatories
        if let Ok((signatories_count, len_bytes)) = self.decode_compact_length(&call_args[cursor..])
        {
            cursor += len_bytes;
            let mut signatories = Vec::new();

            for _ in 0..signatories_count {
                if cursor + 32 <= call_args.len() {
                    signatories.push(format!(
                        "0x{}",
                        hex::encode(&call_args[cursor..cursor + 32])
                    ));
                    cursor += 32;
                }
            }

            args.push(("other_signatories".to_string(), signatories.join(",")));
        }

        // Maybe timepoint and call data would follow...
        if cursor < call_args.len() {
            args.push((
                "remaining_data".to_string(),
                format!("0x{}", hex::encode(&call_args[cursor..])),
            ));
        }

        args
    }

    fn extract_identity_set_identity_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        // Identity info is complex, just return raw data for now
        vec![(
            "identity_info".to_string(),
            format!("0x{}", hex::encode(call_args)),
        )]
    }

    fn extract_identity_set_subs_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        match self.decode_compact_length(call_args) {
            Ok((subs_count, len_bytes)) => {
                vec![
                    ("subs_count".to_string(), subs_count.to_string()),
                    (
                        "subs_data".to_string(),
                        format!("0x{}", hex::encode(&call_args[len_bytes..])),
                    ),
                ]
            }
            Err(_) => vec![("subs".to_string(), "decode_error".to_string())],
        }
    }

    // Proxy pallet argument extractors
    fn extract_proxy_proxy_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(3);
        let mut cursor = 0;

        // Real account (32 bytes)
        args.push((
            "real".to_string(),
            format!("0x{}", hex::encode(&call_args[cursor..cursor + 32])),
        ));
        cursor += 32;

        // Force proxy type (1 byte)
        if cursor < call_args.len() {
            args.push((
                "force_proxy_type".to_string(),
                format!("0x{:02x}", call_args[cursor]),
            ));
            cursor += 1;
        }

        // Call data
        if cursor < call_args.len() {
            args.push((
                "call".to_string(),
                format!("0x{}", hex::encode(&call_args[cursor..])),
            ));
        }

        args
    }

    fn extract_proxy_add_proxy_args(&self, call_args: &[u8]) -> Vec<(String, String)> {
        if call_args.len() < 32 {
            return Vec::new();
        }

        let mut args = Vec::with_capacity(3);
        let mut cursor = 0;

        // Delegate (32 bytes)
        args.push((
            "delegate".to_string(),
            format!("0x{}", hex::encode(&call_args[cursor..cursor + 32])),
        ));
        cursor += 32;

        // Proxy type (1 byte)
        if cursor < call_args.len() {
            args.push((
                "proxy_type".to_string(),
                format!("0x{:02x}", call_args[cursor]),
            ));
            cursor += 1;
        }

        // Delay (u32)
        if cursor + 4 <= call_args.len() {
            let delay =
                u32::from_le_bytes(call_args[cursor..cursor + 4].try_into().unwrap_or_default());
            args.push(("delay".to_string(), delay.to_string()));
        }

        args
    }
}
