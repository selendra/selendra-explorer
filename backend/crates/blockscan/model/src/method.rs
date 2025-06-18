use serde::{Deserialize, Serialize};

use crate::contract::ContractType;

#[derive(Debug, Clone)]
pub struct FunctionInfo {
    pub name: String,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionMethod {
    // Basic transfers
    SimpleTransfer,

    // Contract interactions
    ContractCreation,
    ContractCall {
        contract_type: Option<ContractType>,
        function_name: Option<String>,
        function_signature: Option<String>,
    },

    // DeFi operations
    TokenTransfer {
        token_address: String,
        token_symbol: Option<String>,
    },
    DeFiSwap {
        protocol: String,
        from_token: Option<String>,
        to_token: Option<String>,
    },
    DeFiLiquidity {
        action: LiquidityAction,
        protocol: String,
    },
    DeFiStaking {
        action: StakingAction,
        protocol: String,
    },

    // NFT operations
    NftTransfer {
        collection_address: String,
        token_id: Option<String>,
    },
    NftMint {
        collection_address: String,
        token_id: Option<String>,
    },

    // Other methods
    GovernanceAction {
        action_type: GovernanceAction,
        proposal_id: Option<String>,
    },
    MultisigOperation,
    DataStorage,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LiquidityAction {
    AddLiquidity,
    RemoveLiquidity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StakingAction {
    Stake,
    Unstake,
    ClaimRewards,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GovernanceAction {
    Propose,
    Vote,
    Execute,
    Queue,
    Cancel,
}
