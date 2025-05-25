use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmNetworkInfo {
    pub chain_id: u16,
    pub gas_price: u32,
    pub max_priority_fee: Option<u32>,
    pub max_fee: Option<u32>,
    pub latest_block_number: u32,
    pub syncing: bool,
}
