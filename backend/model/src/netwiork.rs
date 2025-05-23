use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmNetworkInfo {
    pub chain_id: u64,
    pub gas_price: u64,
    pub max_priority_fee: Option<u64>,
    pub max_fee: Option<u64>,
    pub latest_block_number: u64,
    pub syncing: bool,
}
