use serde::{Deserialize, Serialize};

use crate::contract::EvmContractTypeInfo;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmAccountInfo {
    pub address: String,
    pub balance: String,
    pub balance_eth: String,
    pub nonce: u64,
    pub is_contract: bool,
    pub contract_type: Option<EvmContractTypeInfo>,
}
