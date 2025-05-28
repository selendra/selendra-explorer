use custom_error::ServiceError;
use blockscan_model::event::{EventsResponse, FormattedEvent};
use substrate_api_client::{
    Api, GetStorage,
    ac_primitives::{DefaultRuntimeConfig, H256},
    rpc::JsonrpseeClient,
};

pub struct EventInfo {
    pub api: Api<DefaultRuntimeConfig, JsonrpseeClient>,
    pub block_hash: Option<H256>,
}

type EventRecord = frame_system::EventRecord<selendra_runtime::RuntimeEvent, H256>;

// Constants for better maintainability
const DECIMALS: u128 = 1_000_000_000_000_000_000; // 10^18
const DECIMALS_F64: f64 = 1_000_000_000_000_000_000.0;

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
            _ => format!("{event:?}"),
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
                    "ExtrinsicSuccess (weight: {}, class: {:?})",
                    dispatch_info.weight.ref_time(),
                    dispatch_info.class
                )
            }
            frame_system::pallet::Event::NewAccount { account } => {
                format!("NewAccount {{ account: {account} }}")
            }
            _ => format!("{event:?}"),
        }
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
