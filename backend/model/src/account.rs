use serde::{Deserialize, Serialize};

use crate::contract::EvmContractTypeInfo;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmAccountInfo {
    pub address: String,
    pub balance: String,
    pub balance_token: String,
    pub nonce: u32,
    pub is_contract: bool,
    pub contract_type: Option<EvmContractTypeInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmAccount {
    pub address: String,
    pub balance: String,
    pub nonce:u32,
    pub is_contract: bool,
}
