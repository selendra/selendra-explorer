// Event decoder for processing events
pub struct EventDecoder {
    pallet_cache: std::collections::HashMap<(u8, u8), (String, String)>,
}

impl Default for EventDecoder {
    fn default() -> Self {
        Self::new()
    }
}

impl EventDecoder {
    pub fn new() -> Self {
        let mut decoder = Self {
            pallet_cache: std::collections::HashMap::new(),
        };
        decoder.initialize_event_cache();
        decoder
    }

    fn initialize_event_cache(&mut self) {
        // Common event mappings
        let mappings = [
            // System events
            ((0, 0), ("System", "ExtrinsicSuccess")),
            ((0, 1), ("System", "ExtrinsicFailed")),
            ((0, 2), ("System", "CodeUpdated")),
            ((0, 3), ("System", "NewAccount")),
            ((0, 4), ("System", "KilledAccount")),
            ((0, 5), ("System", "Remarked")),
            
            // Balances events
            ((4, 0), ("Balances", "Endowed")),
            ((4, 1), ("Balances", "DustLost")),
            ((4, 2), ("Balances", "Transfer")),
            ((4, 3), ("Balances", "BalanceSet")),
            ((4, 4), ("Balances", "Reserved")),
            ((4, 5), ("Balances", "Unreserved")),
            ((4, 6), ("Balances", "ReserveRepatriated")),
            ((4, 7), ("Balances", "Deposit")),
            ((4, 8), ("Balances", "Withdraw")),
            ((4, 9), ("Balances", "Slashed")),
            
            // Transaction Payment events
            ((5, 0), ("TransactionPayment", "TransactionFeePaid")),
            
            // Staking events
            ((11, 0), ("Staking", "EraPaid")),
            ((11, 1), ("Staking", "Rewarded")),
            ((11, 2), ("Staking", "Slashed")),
            ((11, 3), ("Staking", "SlashReported")),
            ((11, 4), ("Staking", "OldSlashingReportDiscarded")),
            ((11, 5), ("Staking", "StakersElected")),
            ((11, 6), ("Staking", "Bonded")),
            ((11, 7), ("Staking", "Unbonded")),
            ((11, 8), ("Staking", "Withdrawn")),
            ((11, 9), ("Staking", "Kicked")),
            ((11, 10), ("Staking", "StakingElectionFailed")),
            ((11, 11), ("Staking", "Chilled")),
            ((11, 12), ("Staking", "PayoutStarted")),
            ((11, 13), ("Staking", "ValidatorPrefsSet")),
            
            // EVM events
            ((81, 0), ("EVM", "Log")),
            ((81, 1), ("EVM", "Created")),
            ((81, 2), ("EVM", "CreatedFailed")),
            ((81, 3), ("EVM", "Executed")),
            ((81, 4), ("EVM", "ExecutedFailed")),
            
            // Ethereum events
            ((80, 0), ("Ethereum", "Executed")),
            
            // Contracts events
            ((90, 0), ("Contracts", "Instantiated")),
            ((90, 1), ("Contracts", "Terminated")),
            ((90, 2), ("Contracts", "CodeStored")),
            ((90, 3), ("Contracts", "ContractEmitted")),
            ((90, 4), ("Contracts", "CodeRemoved")),
            ((90, 5), ("Contracts", "ContractCodeUpdated")),
            ((90, 6), ("Contracts", "Called")),
            ((90, 7), ("Contracts", "DelegateCalled")),
        ];

        for ((pallet, event), (pallet_name, event_name)) in mappings {
            self.pallet_cache.insert(
                (pallet, event),
                (pallet_name.to_string(), event_name.to_string()),
            );
        }
    }

    pub fn decode_event_data(&self, pallet_index: u8, event_index: u8, data: &[u8]) -> Vec<(String, String)> {
        match (pallet_index, event_index) {
            // System events
            (0, 0) => self.decode_system_extrinsic_success(data),
            (0, 1) => self.decode_system_extrinsic_failed(data),
            (0, 3) => self.decode_system_new_account(data),
            (0, 4) => self.decode_system_killed_account(data),
            (0, 5) => self.decode_system_remarked(data),
            
            // Balances events
            (4, 0) => self.decode_balances_endowed(data),
            (4, 2) => self.decode_balances_transfer(data),
            (4, 3) => self.decode_balances_balance_set(data),
            (4, 7) => self.decode_balances_deposit(data),
            (4, 8) => self.decode_balances_withdraw(data),
            
            // Transaction Payment events
            (5, 0) => self.decode_transaction_fee_paid(data),
            
            // Staking events
            (11, 1) => self.decode_staking_rewarded(data),
            (11, 2) => self.decode_staking_slashed(data),
            (11, 6) => self.decode_staking_bonded(data),
            (11, 7) => self.decode_staking_unbonded(data),
            (11, 8) => self.decode_staking_withdrawn(data),
            
            // EVM events
            (81, 0) => self.decode_evm_log(data),
            (81, 1) => self.decode_evm_created(data),
            (81, 3) => self.decode_evm_executed(data),
            
            // Contracts events
            (90, 0) => self.decode_contracts_instantiated(data),
            (90, 3) => self.decode_contracts_emitted(data),
            
            _ => {
                if !data.is_empty() {
                    vec![("raw_data".to_string(), format!("0x{}", hex::encode(data)))]
                } else {
                    Vec::new()
                }
            }
        }
    }

    pub fn get_event_name(&self, pallet_index: u8, event_index: u8) -> (String, String) {
        self.pallet_cache
            .get(&(pallet_index, event_index))
            .cloned()
            .unwrap_or_else(|| {
                (
                    format!("Pallet_{}", pallet_index),
                    format!("Event_{}", event_index),
                )
            })
    }

    // System event decoders
    fn decode_system_extrinsic_success(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 8 {
            // DispatchInfo: weight and class
            vec![
                ("weight".to_string(), "success".to_string()),
                ("class".to_string(), "normal".to_string()),
            ]
        } else {
            vec![("status".to_string(), "success".to_string())]
        }
    }

    fn decode_system_extrinsic_failed(&self, data: &[u8]) -> Vec<(String, String)> {
        vec![
            ("error".to_string(), format!("0x{}", hex::encode(data))),
            ("status".to_string(), "failed".to_string()),
        ]
    }

    fn decode_system_new_account(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            vec![("account".to_string(), format!("0x{}", hex::encode(&data[0..32])))]
        } else {
            Vec::new()
        }
    }

    fn decode_system_killed_account(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            vec![("account".to_string(), format!("0x{}", hex::encode(&data[0..32])))]
        } else {
            Vec::new()
        }
    }

    fn decode_system_remarked(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            vec![
                ("sender".to_string(), format!("0x{}", hex::encode(&data[0..32]))),
                ("hash".to_string(), format!("0x{}", hex::encode(&data[32..]))),
            ]
        } else {
            Vec::new()
        }
    }

    // Balances event decoders
    fn decode_balances_endowed(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("account".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((balance, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("free_balance".to_string(), balance.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_balances_transfer(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 64 {
            let mut args = vec![
                ("from".to_string(), format!("0x{}", hex::encode(&data[0..32]))),
                ("to".to_string(), format!("0x{}", hex::encode(&data[32..64]))),
            ];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[64..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_balances_balance_set(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("account".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            let mut cursor = 32;
            
            if let Ok((free, bytes)) = self.decode_compact_length(&data[cursor..]) {
                args.push(("free".to_string(), free.to_string()));
                cursor += bytes;
                
                if let Ok((reserved, _)) = self.decode_compact_length(&data[cursor..]) {
                    args.push(("reserved".to_string(), reserved.to_string()));
                }
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_balances_deposit(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("account".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_balances_withdraw(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("account".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    // Transaction Payment event decoders
    fn decode_transaction_fee_paid(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("who".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            let mut cursor = 32;
            
            if let Ok((actual_fee, bytes)) = self.decode_compact_length(&data[cursor..]) {
                args.push(("actual_fee".to_string(), actual_fee.to_string()));
                cursor += bytes;
                
                if let Ok((tip, _)) = self.decode_compact_length(&data[cursor..]) {
                    args.push(("tip".to_string(), tip.to_string()));
                }
            }
            
            args
        } else {
            Vec::new()
        }
    }

    // Staking event decoders
    fn decode_staking_rewarded(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("stash".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_staking_slashed(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("account".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_staking_bonded(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("stash".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_staking_unbonded(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("stash".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    fn decode_staking_withdrawn(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            let mut args = vec![("stash".to_string(), format!("0x{}", hex::encode(&data[0..32])))];
            
            if let Ok((amount, _)) = self.decode_compact_length(&data[32..]) {
                args.push(("amount".to_string(), amount.to_string()));
            }
            
            args
        } else {
            Vec::new()
        }
    }

    // EVM event decoders
    fn decode_evm_log(&self, data: &[u8]) -> Vec<(String, String)> {
        // EVM log structure: address + topics + data
        if data.len() >= 20 {
            vec![
                ("address".to_string(), format!("0x{}", hex::encode(&data[0..20]))),
                ("log_data".to_string(), format!("0x{}", hex::encode(&data[20..]))),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_evm_created(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 20 {
            vec![("address".to_string(), format!("0x{}", hex::encode(&data[0..20])))]
        } else {
            Vec::new()
        }
    }

    fn decode_evm_executed(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 20 {
            vec![("address".to_string(), format!("0x{}", hex::encode(&data[0..20])))]
        } else {
            Vec::new()
        }
    }

    // Contracts event decoders
    fn decode_contracts_instantiated(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 64 {
            vec![
                ("deployer".to_string(), format!("0x{}", hex::encode(&data[0..32]))),
                ("contract".to_string(), format!("0x{}", hex::encode(&data[32..64]))),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_contracts_emitted(&self, data: &[u8]) -> Vec<(String, String)> {
        if data.len() >= 32 {
            vec![
                ("contract".to_string(), format!("0x{}", hex::encode(&data[0..32]))),
                ("data".to_string(), format!("0x{}", hex::encode(&data[32..]))),
            ]
        } else {
            Vec::new()
        }
    }

    // Helper function for compact encoding (reuse from extrinsic decoder)
    fn decode_compact_length(&self, data: &[u8]) -> Result<(usize, usize), &'static str> {
        if data.is_empty() {
            return Err("Empty data");
        }

        let first_byte = data[0];

        match first_byte & 0b11 {
            0b00 => Ok((first_byte as usize >> 2, 1)),
            0b01 => {
                if data.len() < 2 {
                    return Err("Need 2 bytes");
                }
                let value = ((first_byte as usize & 0xfc) >> 2) | ((data[1] as usize) << 6);
                Ok((value, 2))
            }
            0b10 => {
                if data.len() < 4 {
                    return Err("Need 4 bytes");
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
                    return Err("Not enough bytes for big integer");
                }
                Ok((length, length + 1))
            }
        }
    }
}
