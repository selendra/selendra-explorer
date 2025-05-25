use ethers::types::U256;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmContractTypeInfo {
    pub contract_type: ContractType,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub decimals: Option<u8>,
    pub total_supply: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContractType {
    ERC20,
    ERC721,
    ERC1155,
    DEX,
    LendingProtocol,
    Proxy,
    Oracle,
    Unknown,
}

// Helper structs for metadata
#[derive(Debug)]
pub struct TokenMetadata {
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub decimals: Option<u8>,
    pub total_supply: Option<U256>,
}

#[derive(Debug)]
pub struct NftMetadata {
    pub name: Option<String>,
    pub symbol: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmContract {
    pub address: String,
    pub contract_type: ContractType,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub decimals: Option<u8>,
    pub total_supply: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_verified: Option<bool>,
    pub creator_info: Option<ContractCreationInfo>,
}

// New struct to track contract creation details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractCreationInfo {
    pub contract_address: String,
    pub creator_address: String,
    pub transaction_hash: String,
    pub block_number: u32,
    pub timestamp: String,
    pub creation_bytecode: String,
}