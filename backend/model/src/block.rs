// use ethers::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmBlockInfo {
    pub number: u64,
    pub hash: Option<String>,
    pub parent_hash: String,
    pub timestamp: String,
    pub gas_used: u64,
    pub gas_limit: u64,
    pub base_fee_per_gas: Option<u64>,
    pub validate: String,
    pub extra_data: String,
    pub transactions_count: usize,
    pub size: Option<usize>,
    pub nonce: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateBlockInfo {}
