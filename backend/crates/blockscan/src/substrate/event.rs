pub use subxt::{events::EventDetails, SubstrateConfig};

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

    // Helper function to convert AccountId32 to readable string
    fn account_to_string<T: std::fmt::Display>(account: &T) -> String {
        account.to_string()
    }

    pub fn decode_event_data(
        &self,
        pallet_index: u8,
        event_index: u8,
        data: EventDetails<SubstrateConfig>,
    ) -> Vec<(String, String)> {
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
                // Fallback to raw data if typed decoding fails
                if !data.field_bytes().is_empty() {
                    vec![("raw_data".to_string(), format!("0x{}", hex::encode(data.field_bytes())))]
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
    fn decode_system_extrinsic_success(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::system::events::ExtrinsicSuccess>() {
            vec![
                ("status".to_string(), "success".to_string()),
                ("weight".to_string(), format!("{:?}", event.dispatch_info.weight)),
                ("class".to_string(), format!("{:?}", event.dispatch_info.class)),
                ("pays_fee".to_string(), format!("{:?}", event.dispatch_info.pays_fee)),
            ]
        } else {
            vec![("status".to_string(), "success".to_string())]
        }
    }

    fn decode_system_extrinsic_failed(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::system::events::ExtrinsicFailed>() {
            vec![
                ("status".to_string(), "failed".to_string()),
                ("error".to_string(), format!("{:?}", event.dispatch_error)),
                ("weight".to_string(), format!("{:?}", event.dispatch_info.weight)),
                ("class".to_string(), format!("{:?}", event.dispatch_info.class)),
                ("pays_fee".to_string(), format!("{:?}", event.dispatch_info.pays_fee)),
            ]
        } else {
            vec![("status".to_string(), "failed".to_string())]
        }
    }

    fn decode_system_new_account(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::system::events::NewAccount>() {
            vec![("account".to_string(), Self::account_to_string(&event.account))]
        } else {
            Vec::new()
        }
    }

    fn decode_system_killed_account(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::system::events::KilledAccount>() {
            vec![("account".to_string(), Self::account_to_string(&event.account))]
        } else {
            Vec::new()
        }
    }

    fn decode_system_remarked(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::system::events::Remarked>() {
            vec![
                ("sender".to_string(), Self::account_to_string(&event.sender)),
                ("hash".to_string(), format!("{:?}", event.hash)),
            ]
        } else {
            Vec::new()
        }
    }

    // Balances event decoders
    fn decode_balances_endowed(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::balances::events::Endowed>() {
            vec![
                ("account".to_string(), Self::account_to_string(&event.account)),
                ("free_balance".to_string(), event.free_balance.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_balances_transfer(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::balances::events::Transfer>() {
            vec![
                ("from".to_string(), Self::account_to_string(&event.from)),
                ("to".to_string(), Self::account_to_string(&event.to)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_balances_balance_set(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::balances::events::BalanceSet>() {
            vec![
                ("account".to_string(), Self::account_to_string(&event.who)),
                ("free".to_string(), event.free.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_balances_deposit(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::balances::events::Deposit>() {
            vec![
                ("account".to_string(), Self::account_to_string(&event.who)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_balances_withdraw(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::balances::events::Withdraw>() {
            vec![
                ("account".to_string(), Self::account_to_string(&event.who)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    // Transaction Payment event decoders
    fn decode_transaction_fee_paid(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::transaction_payment::events::TransactionFeePaid>() {
            vec![
                ("who".to_string(), Self::account_to_string(&event.who)),
                ("actual_fee".to_string(), event.actual_fee.to_string()),
                ("tip".to_string(), event.tip.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    // Staking event decoders
    fn decode_staking_rewarded(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::staking::events::Rewarded>() {
            vec![
                ("stash".to_string(), Self::account_to_string(&event.stash)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_staking_slashed(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::staking::events::Slashed>() {
            vec![
                ("account".to_string(), Self::account_to_string(&event.staker)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_staking_bonded(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::staking::events::Bonded>() {
            vec![
                ("stash".to_string(), Self::account_to_string(&event.stash)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_staking_unbonded(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::staking::events::Unbonded>() {
            vec![
                ("stash".to_string(), Self::account_to_string(&event.stash)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_staking_withdrawn(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::staking::events::Withdrawn>() {
            vec![
                ("stash".to_string(), Self::account_to_string(&event.stash)),
                ("amount".to_string(), event.amount.to_string()),
            ]
        } else {
            Vec::new()
        }
    }

    // EVM event decoders
    fn decode_evm_log(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::evm::events::Log>() {
            vec![
                ("log".to_string(), format!("{:?}", event.log)),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_evm_created(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::evm::events::Created>() {
            vec![("address".to_string(), format!("{:?}", event.address))]
        } else {
            Vec::new()
        }
    }

    fn decode_evm_executed(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::evm::events::Executed>() {
            vec![("address".to_string(), format!("{:?}", event.address))]
        } else {
            Vec::new()
        }
    }

    // Contracts event decoders
    fn decode_contracts_instantiated(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::contracts::events::Instantiated>() {
            vec![
                ("deployer".to_string(), Self::account_to_string(&event.deployer)),
                ("contract".to_string(), Self::account_to_string(&event.contract)),
            ]
        } else {
            Vec::new()
        }
    }

    fn decode_contracts_emitted(&self, data: EventDetails<SubstrateConfig>) -> Vec<(String, String)> {
        if let Ok(Some(event)) = data.as_event::<config::selendra::contracts::events::ContractEmitted>() {
            vec![
                ("contract".to_string(), Self::account_to_string(&event.contract)),
                ("data".to_string(), format!("0x{}", hex::encode(&event.data))),
            ]
        } else {
            Vec::new()
        }
    }
}