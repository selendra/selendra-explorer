use blockscan_model::event::{EventsResponse, FormattedEvent};
use config::{DECIMALS, DECIMALS_F64, selendra};
use custom_error::ServiceError;
use substrate_api_client::{
    Api, GetStorage,
    ac_primitives::{DefaultRuntimeConfig, H256},
    rpc::JsonrpseeClient,
};

pub struct EventInfo {
    pub api: Api<DefaultRuntimeConfig, JsonrpseeClient>,
    pub block_hash: Option<H256>,
}

type EventRecord = frame_system::EventRecord<selendra::RuntimeEvent, H256>;

impl EventInfo {
    #[inline]
    pub const fn new(
        api: Api<DefaultRuntimeConfig, JsonrpseeClient>,
        block_hash: Option<H256>,
    ) -> Self {
        Self { api, block_hash }
    }

    pub async fn get_events(&self) -> Result<EventsResponse, ServiceError> {
        let events = self
            .api
            .get_storage::<Vec<EventRecord>>("System", "Events", self.block_hash)
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Failed to get events: {:?}", e)))?;

        let Some(events) = events else {
            return Ok(EventsResponse {
                total_count: 0,
                events: Vec::new(),
            });
        };

        // Pre-allocate vector with known capacity
        let mut formatted_events = Vec::with_capacity(events.len());

        for (index, event_record) in events.iter().enumerate() {
            formatted_events.push(FormattedEvent {
                index: index + 1,
                phase: Self::format_phase(&event_record.phase),
                event: self.format_event(&event_record.event),
                topics: event_record.topics.clone(),
            });
        }

        Ok(EventsResponse {
            total_count: formatted_events.len(),
            events: formatted_events,
        })
    }

    #[inline]
    fn format_phase(phase: &frame_system::Phase) -> String {
        match phase {
            frame_system::Phase::ApplyExtrinsic(index) => format!("Extrinsic #{index}"),
            frame_system::Phase::Finalization => "Finalization".to_string(),
            frame_system::Phase::Initialization => "Initialization".to_string(),
        }
    }

    fn format_event(&self, event: &selendra_runtime::RuntimeEvent) -> String {
        match event {
            selendra_runtime::RuntimeEvent::System(system_event) => {
                format!("System::{}", Self::format_system_event(system_event))
            }
            selendra_runtime::RuntimeEvent::Balances(balance_event) => {
                format!("Balances::{}", self.format_balance_event(balance_event))
            }
            selendra_runtime::RuntimeEvent::Staking(staking_event) => {
                format!("Staking::{}", Self::format_staking_event(staking_event))
            }
            selendra_runtime::RuntimeEvent::Session(session_event) => {
                format!("Session::{}", Self::format_session_event(session_event))
            }
            selendra_runtime::RuntimeEvent::Ethereum(ethereum_event) => {
                format!("Ethereum::{}", Self::format_ethereum_event(ethereum_event))
            }
            selendra_runtime::RuntimeEvent::EVM(evm_event) => {
                format!("EVM::{}", Self::format_evm_event(evm_event))
            }
            selendra_runtime::RuntimeEvent::Utility(utility_event) => {
                format!("Utility::{}", Self::format_utility_event(utility_event))
            }
            selendra_runtime::RuntimeEvent::Multisig(multisig_event) => {
                format!("Multisig::{}", Self::format_multisig_event(multisig_event))
            }
            selendra_runtime::RuntimeEvent::Proxy(proxy_event) => {
                format!("Proxy::{}", Self::format_proxy_event(proxy_event))
            }
            selendra_runtime::RuntimeEvent::Scheduler(scheduler_event) => {
                format!("Scheduler::{}", Self::format_scheduler_event(scheduler_event))
            }
            selendra_runtime::RuntimeEvent::Identity(identity_event) => {
                format!("Identity::{}", Self::format_identity_event(identity_event))
            }
            selendra_runtime::RuntimeEvent::Treasury(treasury_event) => {
                format!("Treasury::{}", Self::format_treasury_event(treasury_event))
            }
            selendra_runtime::RuntimeEvent::Vesting(vesting_event) => {
                format!("Vesting::{}", Self::format_vesting_event(vesting_event))
            }
            selendra_runtime::RuntimeEvent::Elections(elections_event) => {
                format!("Elections::{}", Self::format_elections_event(elections_event))
            }
            _ => {
                // Fallback: Extract module name from debug format
                let debug_str = format!("{event:?}");
                Self::extract_module_from_debug(&debug_str)
            }
        }
    }

    /// Extract module name from debug string format
    fn extract_module_from_debug(debug_str: &str) -> String {
        // Try to extract the module name from patterns like "ModuleName(EventName { ... })"
        if let Some(paren_pos) = debug_str.find('(') {
            let module_part = &debug_str[..paren_pos];
            if let Some(colon_pos) = module_part.rfind("::") {
                let module_name = &module_part[colon_pos + 2..];
                if let Some(brace_pos) = debug_str[paren_pos..].find('{') {
                    let event_part = &debug_str[paren_pos + 1..paren_pos + brace_pos];
                    return format!("{}::{}", module_name, event_part.trim());
                } else {
                    return format!("{}::Unknown", module_name);
                }
            }
        }
        
        // If extraction fails, return a cleaned up version
        if debug_str.len() > 100 {
            format!("Unknown::{}", &debug_str[..97])
        } else {
            format!("Unknown::{}", debug_str)
        }
    }

    fn format_balance_event(
        &self,
        event: &pallet_balances::pallet::Event<selendra_runtime::Runtime>,
    ) -> String {
        match event {
            pallet_balances::pallet::Event::Transfer { from, to, amount } => {
                format!(
                    "Transfer {{ from: {from}, to: {to}, amount: {} }}",
                    Self::format_balance(*amount)
                )
            }
            pallet_balances::pallet::Event::Withdraw { who, amount } => {
                format!(
                    "Withdraw {{ who: {who}, amount: {} }}",
                    Self::format_balance(*amount)
                )
            }
            pallet_balances::pallet::Event::Endowed {
                account,
                free_balance,
            } => {
                format!(
                    "Endowed {{ account: {account}, balance: {} }}",
                    Self::format_balance(*free_balance)
                )
            }
            pallet_balances::pallet::Event::Deposit { who, amount } => {
                format!(
                    "Deposit {{ who: {who}, amount: {} }}",
                    Self::format_balance(*amount)
                )
            }
            _ => format!("{event:?}"),
        }
    }

    fn format_system_event(
        event: &frame_system::pallet::Event<selendra_runtime::Runtime>,
    ) -> String {
        match event {
            frame_system::pallet::Event::ExtrinsicSuccess { dispatch_info } => {
                format!(
                    "ExtrinsicSuccess {{ weight: {}, class: {:?} }}",
                    dispatch_info.weight.ref_time(),
                    dispatch_info.class
                )
            }
            frame_system::pallet::Event::ExtrinsicFailed { dispatch_error, dispatch_info } => {
                format!(
                    "ExtrinsicFailed {{ error: {:?}, weight: {} }}",
                    dispatch_error,
                    dispatch_info.weight.ref_time()
                )
            }
            frame_system::pallet::Event::NewAccount { account } => {
                format!("NewAccount {{ account: {account} }}")
            }
            frame_system::pallet::Event::KilledAccount { account } => {
                format!("KilledAccount {{ account: {account} }}")
            }
            frame_system::pallet::Event::Remarked { sender, hash } => {
                format!("Remarked {{ sender: {sender}, hash: {hash:?} }}")
            }
            _ => format!("{event:?}"),
        }
    }

    fn format_staking_event(event: &selendra::staking::Event) -> String {
        match event {
            selendra::staking::Event::EraPaid { era_index, validator_payout, remainder } => {
                format!(
                    "EraPayout {{ era: {}, validator_payout: {}, remainder: {} }}",
                    era_index,
                    Self::format_balance(*validator_payout),
                    Self::format_balance(*remainder)
                )
            }
            selendra::staking::Event::Rewarded { stash, amount, dest } => {
                format!(
                    "Rewarded {{ stash: {}, amount: {} dest: {:?} }}",
                    stash,
                    Self::format_balance(*amount),
                    dest
                )
            }
            selendra::staking::Event::Slashed { staker, amount } => {
                format!(
                    "Slashed {{ staker: {}, amount: {} }}",
                    staker,
                    Self::format_balance(*amount)
                )
            }
            _ => format!("{event:?}"),
        }
    }

    fn format_session_event(event: &selendra::session::Event) -> String {
        match event {
            selendra::session::Event::NewSession { session_index } => {
                format!("NewSession {{ session_index: {} }}", session_index)
            }

        }
    }

    fn format_grandpa_event(event: &pallet_grandpa::pallet::Event) -> String {
        match event {
            pallet_grandpa::pallet::Event::NewAuthorities { authority_set } => {
                format!("NewAuthorities {{ count: {} }}", authority_set.len())
            }
            pallet_grandpa::pallet::Event::Paused => "Paused".to_string(),
            pallet_grandpa::pallet::Event::Resumed => "Resumed".to_string(),
            _ => format!("{event:?}"),
        }
    }

    fn format_imonline_event(event: &pallet_im_online::pallet::Event<selendra_runtime::Runtime>) -> String {
        match event {
            pallet_im_online::pallet::Event::HeartbeatReceived { authority_id } => {
                format!("HeartbeatReceived {{ authority_id: {:?} }}", authority_id)
            }
            pallet_im_online::pallet::Event::AllGood => "AllGood".to_string(),
            pallet_im_online::pallet::Event::SomeOffline { offline } => {
                format!("SomeOffline {{ count: {} }}", offline.len())
            }
            _ => format!("{event:?}"),
        }
    }

    fn format_offences_event(event: &pallet_offences::pallet::Event) -> String {
        match event {
            pallet_offences::pallet::Event::Offence { kind, timeslot } => {
                format!("Offence {{ kind: {:?}, timeslot: {:?} }}", kind, timeslot)
            }
            _ => format!("{event:?}"),
        }
    }

    fn format_ethereum_event(event: &pallet_ethereum::pallet::Event) -> String {
        match event {
            pallet_ethereum::pallet::Event::Executed { from, to, transaction_hash, exit_reason } => {
                format!(
                    "Executed {{ from: {:?}, to: {:?}, hash: {:?}, exit_reason: {:?} }}",
                    from, to, transaction_hash, exit_reason
                )
            }
            _ => format!("{event:?}"),
        }
    }

    fn format_evm_event(event: &pallet_evm::pallet::Event<selendra_runtime::Runtime>) -> String {
        match event {
            pallet_evm::pallet::Event::Log { log } => {
                format!("Log {{ address: {:?}, topics: {} }}", log.address, log.topics.len())
            }
            pallet_evm::pallet::Event::Created { address } => {
                format!("Created {{ address: {:?} }}", address)
            }
            pallet_evm::pallet::Event::CreatedFailed { address } => {
                format!("CreatedFailed {{ address: {:?} }}", address)
            }
            pallet_evm::pallet::Event::Executed { address } => {
                format!("Executed {{ address: {:?} }}", address)
            }
            pallet_evm::pallet::Event::ExecutedFailed { address } => {
                format!("ExecutedFailed {{ address: {:?} }}", address)
            }
            _ => format!("{event:?}"),
        }
    }

    fn format_basefee_event(event: &pallet_base_fee::pallet::Event) -> String {
        match event {
            pallet_base_fee::pallet::Event::NewBaseFeePerGas { fee } => {
                format!("NewBaseFeePerGas {{ fee: {} }}", fee)
            }
            pallet_base_fee::pallet::Event::BaseFeeOverflow => "BaseFeeOverflow".to_string(),
            pallet_base_fee::pallet::Event::NewElasticity { elasticity } => {
                format!("NewElasticity {{ elasticity: {} }}", elasticity)
            }
            _ => format!("{event:?}"),
        }
    }

    // Placeholder implementations for other pallets
    fn format_utility_event(event: &pallet_utility::pallet::Event) -> String {
        format!("{event:?}")
    }

    fn format_multisig_event(event: &pallet_multisig::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    fn format_proxy_event(event: &pallet_proxy::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    fn format_scheduler_event(event: &pallet_scheduler::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    fn format_identity_event(event: &pallet_identity::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    fn format_democracy_event(event: &pallet_democracy::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    fn format_council_event(event: &pallet_collective::pallet::Event<selendra_runtime::Runtime, pallet_collective::Instance1>) -> String {
        format!("{event:?}")
    }

    fn format_technical_committee_event(event: &pallet_collective::pallet::Event<selendra_runtime::Runtime, pallet_collective::Instance2>) -> String {
        format!("{event:?}")
    }

    fn format_treasury_event(event: &pallet_treasury::pallet::Event<selendra_runtime::Runtime, ()>) -> String {
        format!("{event:?}")
    }

    fn format_preimage_event(event: &pallet_preimage::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    fn format_vesting_event(event: &pallet_vesting::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    fn format_elections_event(event: &pallet_elections_phragmen::pallet::Event<selendra_runtime::Runtime>) -> String {
        format!("{event:?}")
    }

    #[inline]
    const fn format_balance(amount: u128) -> f64 {
        // More efficient conversion avoiding floating point division when possible
        if amount >= DECIMALS {
            (amount / DECIMALS) as f64 + ((amount % DECIMALS) as f64 / DECIMALS_F64)
        } else {
            amount as f64 / DECIMALS_F64
        }
    }
}