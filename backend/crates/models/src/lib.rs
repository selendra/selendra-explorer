use serde::{Deserialize, Serialize};

pub mod evm;
pub mod substrate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AddressType {
    SS58,
    H160,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountInfo {
    pub address: String,
    pub balance_token: f64,
    pub free_balance: f64,
    pub nonce: u64,
    pub is_contract: bool,
    pub address_type: AddressType,
    pub created_at: u128,
    pub last_activity: u128,
}
