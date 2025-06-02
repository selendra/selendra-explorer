pub use blockscan_model::{contract::{ContractCreationInfo, ContractType}, method::TransactionMethod, transaction::TransactionStatus};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmBlock {
    pub id: Thing,
    pub number: u32,
    pub hash: String,
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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum NetworkType {
    Evm,
    Subtrate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionType {
    Legacy = 0,
    AccessList = 1,
    DynamicFee = 2,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmTransaction {
    pub id: Thing,
    pub hash: String,
    pub block_number: u64,
    pub timestamp: u128,
    pub from: String,
    pub to: Option<String>,
    pub value: u128,
    pub gas_price:u64,
    pub gas_limit: u64,
    pub gas_used: u64,
    pub nonce: u64,
    pub status: TransactionStatus,
    pub transaction_type: TransactionType,
    pub network_type: NetworkType,
    pub input: Option<String>,
    pub fee: u64,
    pub transaction_method: Option<TransactionMethod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AddressType {
    SS58,
    H160,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmAccountInfo {
    pub address: String,
    pub balance_token: String,
    pub nonce: u64,
    pub is_contract: bool,
    pub address_type: AddressType,
    pub created_at: u128,
    pub last_activity: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmContract {
    pub address: String,
    pub contract_type: ContractType,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub decimals: Option<u8>,
    pub total_supply: Option<String>,
    pub is_verified: bool,
    pub creator_info: Option<ContractCreationInfo>,
}