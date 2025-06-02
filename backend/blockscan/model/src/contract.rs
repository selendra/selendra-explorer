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

// New struct to track contract creation details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractCreationInfo {
    pub contract_address: String,
    pub creator_address: Option<String>,
    pub transaction_hash: Option<String>,
    pub block_number: u64,
    pub timestamp: String,
    pub creation_bytecode: String,
}
