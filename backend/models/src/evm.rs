use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmBlock {
    pub id: Thing,
    pub number: u32,
    pub hash: Option<String>,
    pub parent_hash: String,
    pub timestamp: u128,
    pub transaction_count: u16,
    pub size: usize,
    pub gas_used: u64,
    pub gas_limit: u64,
    pub base_fee: u64,
    pub burn_fee: f64,
    pub validator: String,
    pub extra_data: String,
    pub nonce: Option<u32>,
    pub session: u32,
    pub era: u32,
}
