use custom_error::ServiceError;
use model::event::{EventsResponse, FormattedEvent};
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

impl EventInfo {
    pub fn new(api: Api<DefaultRuntimeConfig, JsonrpseeClient>, block_hash: Option<H256>) -> Self {
        Self { api, block_hash }
    }

    pub async fn get_events(&self) -> Result<EventsResponse, ServiceError> {
        let events = match self
            .api
            .get_storage::<Vec<EventRecord>>("System", "Events", self.block_hash)
            .await
        {
            Ok(events) => events,
            Err(e) => {
                return Err(ServiceError::SubstrateError(format!(
                    "Failed to get events: {:?}",
                    e
                )));
            }
        };

        if let Some(events) = events {
            let formatted_events: Vec<FormattedEvent> = events
                .iter()
                .enumerate()
                .map(|(index, event_record)| FormattedEvent {
                    index: index + 1,
                    phase: self.format_phase(&event_record.phase),
                    event: self.format_event(&event_record.event),
                    topics: event_record.topics.clone(),
                })
                .collect();

            Ok(EventsResponse {
                total_count: formatted_events.len(),
                events: formatted_events,
            })
        } else {
            Ok(EventsResponse {
                total_count: 0,
                events: vec![],
            })
        }
    }

    fn format_phase(&self, phase: &frame_system::Phase) -> String {
        match phase {
            frame_system::Phase::ApplyExtrinsic(index) => format!("Extrinsic #{}", index),
            frame_system::Phase::Finalization => "Finalization".to_string(),
            frame_system::Phase::Initialization => "Initialization".to_string(),
        }
    }

    fn format_event(&self, event: &selendra_runtime::RuntimeEvent) -> String {
        match event {
            selendra_runtime::RuntimeEvent::System(system_event) => {
                format!("System::{}", self.format_system_event(system_event))
            }
            selendra_runtime::RuntimeEvent::Balances(balance_event) => {
                format!("Balances::{}", self.format_balance_event(balance_event))
            }
            _ => format!("{:?}", event),
        }
    }

    fn format_balance_event(
        &self,
        event: &pallet_balances::pallet::Event<selendra_runtime::Runtime>,
    ) -> String {
        match event {
            pallet_balances::pallet::Event::Transfer { from, to, amount } => {
                format!(
                    "Transfer {{ from: {}, to: {}, amount: {} }}",
                    from.to_string(),
                    to.to_string(),
                    self.format_balance(*amount)
                )
            }
            pallet_balances::pallet::Event::Withdraw { who, amount } => {
                format!(
                    "Withdraw {{ who: {}, amount: {} }}",
                    who.to_string(),
                    self.format_balance(*amount)
                )
            }
            pallet_balances::pallet::Event::Endowed {
                account,
                free_balance,
            } => {
                format!(
                    "Endowed {{ account: {}, balance: {} }}",
                    account.to_string(),
                    self.format_balance(*free_balance)
                )
            }
            pallet_balances::pallet::Event::Deposit { who, amount } => {
                format!(
                    "Deposit {{ who: {}, amount: {} }}",
                    who.to_string(),
                    self.format_balance(*amount)
                )
            }
            _ => format!("{:?}", event),
        }
    }

    fn format_system_event(
        &self,
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
                format!("NewAccount {{ account: {} }}", account.to_string())
            }
            _ => format!("{:?}", event),
        }
    }

    fn format_balance(&self, amount: u128) -> f64 {
        // Assuming 18 decimal places (adjust for your chain)
        let decimals = 1_000_000_000_000_000_000u128; // 10^18
        if amount >= decimals {
            amount as f64 / decimals as f64
        } else {
            amount as f64
        }
    }
}
