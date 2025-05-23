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
