use serde::{Deserialize, Serialize};
use substrate_api_client::ac_primitives::H256;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormattedEvent {
    pub index: usize,
    pub phase: String,
    pub event: String,
    pub topics: Vec<H256>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventsResponse {
    pub events: Vec<FormattedEvent>,
    pub total_count: usize,
}