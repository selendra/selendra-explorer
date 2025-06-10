use serde::{Deserialize, Serialize};

use crate::contract::EvmContractTypeInfo;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountInfo {
    pub address: String,
    pub balance: u128,
    pub balance_token: f64,
    pub free_balance: f64,
    pub nonce: u64,
    pub is_contract: bool,
    pub contract_type: Option<EvmContractTypeInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmAccount {
    pub address: String,
    pub balance: u128,
    pub nonce: u64,
    pub is_contract: bool,
}
