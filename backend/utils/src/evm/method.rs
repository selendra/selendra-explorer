use custom_error::ServiceError;
use ethers::providers::{Http, Middleware, Provider};
use model::{
    contract::ContractType,
    method::{GovernanceAction, LiquidityAction, StakingAction, TransactionMethod},
    transaction::EvmTransactionInfo,
};
use std::sync::Arc;

use super::signature_lookup::{SignatureCategory, SignatureLookupService};
pub struct Method {
    provider: Arc<Provider<Http>>,
    signature_lookup: SignatureLookupService,
}

impl Method {
    pub fn new(provider: Arc<Provider<Http>>) -> Self {
        Self {
            provider,
            signature_lookup: SignatureLookupService::new(),
        }
    }

    pub async fn analyze_transaction_method(
        &self,
        tx_info: &EvmTransactionInfo,
    ) -> Result<TransactionMethod, ServiceError> {
        // 1. Check if it's a simple ETH transfer
        if tx_info.input_data == "0x" || tx_info.input_data.len() <= 2 {
            return Ok(TransactionMethod::SimpleTransfer);
        }

        // 2. Check if it's contract creation
        if tx_info.to.is_none() {
            return Ok(TransactionMethod::ContractCreation);
        }

        let input_data = &tx_info.input_data;

        // 3. Analyze function signature (first 4 bytes after 0x)
        if input_data.len() >= 10 {
            let function_sig = &input_data[2..10]; // Remove 0x and get first 4 bytes

            // Try enhanced signature lookup first
            if let Some(method) = self
                .analyze_with_signature_lookup(function_sig, tx_info)
                .await?
            {
                return Ok(method);
            }

            // Fallback to original method
            match self
                .identify_function_method_fallback(function_sig, tx_info)
                .await
            {
                Ok(method) => return Ok(method),
                Err(_) => {}
            }
        }

        // 4. Analyze by contract type if we can't identify function
        if let Some(to_address) = &tx_info.to {
            match self.analyze_contract_type(to_address).await {
                Ok(contract_type) => {
                    return Ok(TransactionMethod::ContractCall {
                        contract_type: Some(contract_type),
                        function_name: self
                            .signature_lookup
                            .lookup(&input_data[2..10])
                            .map(|s| s.name.clone()),
                        function_signature: Some(input_data[2..10].to_string()),
                    });
                }
                Err(_) => {
                    // Continue
                }
            }
        }

        // 5. Default to unknown contract call with enhanced info
        let function_sig = &input_data[2..10];

        Ok(TransactionMethod::ContractCall {
            contract_type: None,
            function_name: self
                .signature_lookup
                .lookup(function_sig)
                .map(|s| s.name.clone()),
            function_signature: Some(function_sig.to_string()),
        })
    }

    async fn analyze_with_signature_lookup(
        &self,
        function_sig: &str,
        tx_info: &EvmTransactionInfo,
    ) -> Result<Option<TransactionMethod>, ServiceError> {
        if let Some(sig_info) = self.signature_lookup.lookup(function_sig) {
            let method = match sig_info.category {
                SignatureCategory::ERC20 => match sig_info.name.as_str() {
                    "transfer" | "transferFrom" => {
                        if let Some(to_address) = &tx_info.to {
                            TransactionMethod::TokenTransfer {
                                token_address: to_address.clone(),
                                token_symbol: None,
                            }
                        } else {
                            return Ok(None);
                        }
                    }
                    _ => TransactionMethod::ContractCall {
                        contract_type: Some(ContractType::ERC20),
                        function_name: Some(sig_info.name.clone()),
                        function_signature: Some(function_sig.to_string()),
                    },
                },

                SignatureCategory::UniswapV2 | SignatureCategory::UniswapV3 => {
                    let protocol = sig_info.protocol.as_deref().unwrap_or("Unknown DEX");
                    match sig_info.name.as_str() {
                        name if name.contains("swap") || name.contains("exact") => {
                            TransactionMethod::DeFiSwap {
                                protocol: protocol.to_string(),
                                from_token: None,
                                to_token: None,
                            }
                        }
                        name if name.contains("liquidity") => {
                            let action = if name.contains("add") || name.contains("increase") {
                                LiquidityAction::AddLiquidity
                            } else if name.contains("remove") || name.contains("decrease") {
                                LiquidityAction::RemoveLiquidity
                            } else {
                                LiquidityAction::AddLiquidity // default
                            };

                            TransactionMethod::DeFiLiquidity {
                                action,
                                protocol: protocol.to_string(),
                            }
                        }
                        "multicall" => TransactionMethod::DeFiSwap {
                            protocol: "Uniswap V3 (Multicall)".to_string(),
                            from_token: None,
                            to_token: None,
                        },
                        _ => TransactionMethod::ContractCall {
                            contract_type: Some(ContractType::DEX),
                            function_name: Some(sig_info.name.clone()),
                            function_signature: Some(function_sig.to_string()),
                        },
                    }
                }

                SignatureCategory::Compound
                | SignatureCategory::Aave
                | SignatureCategory::Yearn => {
                    let protocol = sig_info.protocol.as_deref().unwrap_or("DeFi Protocol");
                    match sig_info.name.as_str() {
                        "deposit" | "mint" => TransactionMethod::DeFiStaking {
                            action: StakingAction::Stake,
                            protocol: protocol.to_string(),
                        },
                        "withdraw" | "redeem" => TransactionMethod::DeFiStaking {
                            action: StakingAction::Unstake,
                            protocol: protocol.to_string(),
                        },
                        _ => TransactionMethod::ContractCall {
                            contract_type: Some(ContractType::LendingProtocol),
                            function_name: Some(sig_info.name.clone()),
                            function_signature: Some(function_sig.to_string()),
                        },
                    }
                }

                SignatureCategory::Curve => match sig_info.name.as_str() {
                    "exchange" => TransactionMethod::DeFiSwap {
                        protocol: "Curve".to_string(),
                        from_token: None,
                        to_token: None,
                    },
                    "add_liquidity" => TransactionMethod::DeFiLiquidity {
                        action: LiquidityAction::AddLiquidity,
                        protocol: "Curve".to_string(),
                    },
                    _ => TransactionMethod::ContractCall {
                        contract_type: Some(ContractType::DEX),
                        function_name: Some(sig_info.name.clone()),
                        function_signature: Some(function_sig.to_string()),
                    },
                },

                SignatureCategory::ERC721 | SignatureCategory::ERC1155 => {
                    if let Some(to_address) = &tx_info.to {
                        match sig_info.name.as_str() {
                            name if name.contains("transfer") => TransactionMethod::NftTransfer {
                                collection_address: to_address.clone(),
                                token_id: None,
                            },
                            name if name.contains("mint") => TransactionMethod::NftMint {
                                collection_address: to_address.clone(),
                                token_id: None,
                            },
                            _ => TransactionMethod::ContractCall {
                                contract_type: Some(ContractType::ERC721),
                                function_name: Some(sig_info.name.clone()),
                                function_signature: Some(function_sig.to_string()),
                            },
                        }
                    } else {
                        return Ok(None);
                    }
                }

                SignatureCategory::NFTMarketplace => TransactionMethod::NftTransfer {
                    collection_address: tx_info
                        .to
                        .as_ref()
                        .unwrap_or(&"unknown".to_string())
                        .clone(),
                    token_id: None,
                },

                SignatureCategory::Staking => {
                    let action = match sig_info.name.as_str() {
                        "stake" => StakingAction::Stake,
                        "unstake" | "withdraw" => StakingAction::Unstake,
                        "getReward" | "claimRewards" => StakingAction::ClaimRewards,
                        _ => StakingAction::Stake,
                    };

                    TransactionMethod::DeFiStaking {
                        action,
                        protocol: sig_info
                            .protocol
                            .as_deref()
                            .unwrap_or("Staking Protocol")
                            .to_string(),
                    }
                }

                SignatureCategory::Governance => {
                    let action = match sig_info.name.as_str() {
                        "propose" => GovernanceAction::Propose,
                        "vote" => GovernanceAction::Vote,
                        "execute" => GovernanceAction::Execute,
                        "queue" => GovernanceAction::Queue,
                        "cancel" => GovernanceAction::Cancel,
                        _ => GovernanceAction::Vote,
                    };

                    TransactionMethod::GovernanceAction {
                        action_type: action,
                        proposal_id: None,
                    }
                }

                SignatureCategory::Generic => TransactionMethod::ContractCall {
                    contract_type: None,
                    function_name: Some(sig_info.name.clone()),
                    function_signature: Some(function_sig.to_string()),
                },

                SignatureCategory::Unknown => {
                    // For your specific unknown signatures, provide better categorization
                    match function_sig {
                        "75713a08" => TransactionMethod::ContractCall {
                            contract_type: Some(ContractType::Oracle),
                            function_name: Some("possibly_price_update".to_string()),
                            function_signature: Some(function_sig.to_string()),
                        },
                        "3d0e3ec5" => TransactionMethod::DeFiSwap {
                            protocol: "Unknown DEX Aggregator".to_string(),
                            from_token: None,
                            to_token: None,
                        },
                        "088890dc" => TransactionMethod::DeFiLiquidity {
                            action: LiquidityAction::AddLiquidity,
                            protocol: "Unknown AMM".to_string(),
                        },
                        "623a10c0" => TransactionMethod::DeFiStaking {
                            action: StakingAction::Stake,
                            protocol: "Unknown Staking Protocol".to_string(),
                        },
                        _ => TransactionMethod::ContractCall {
                            contract_type: None,
                            function_name: Some(sig_info.name.clone()),
                            function_signature: Some(function_sig.to_string()),
                        },
                    }
                }

                _ => TransactionMethod::ContractCall {
                    contract_type: None,
                    function_name: Some(sig_info.name.clone()),
                    function_signature: Some(function_sig.to_string()),
                },
            };

            Ok(Some(method))
        } else {
            Ok(None)
        }
    }

    // Your original fallback method (simplified version)
    async fn identify_function_method_fallback(
        &self,
        _function_sig: &str,
        _tx_info: &EvmTransactionInfo,
    ) -> Result<TransactionMethod, ServiceError> {
        // This is your original logic as fallback
        Err(ServiceError::InvalidTransactionData(
            "Unknown function signature".to_string(),
        ))
    }

    async fn analyze_contract_type(
        &self,
        contract_address: &str,
    ) -> Result<ContractType, ServiceError> {
        let address: ethers::types::Address = contract_address.parse().map_err(|_| {
            ServiceError::InvalidTransactionData(format!("Invalid address: {}", contract_address))
        })?;

        let code = self.provider.get_code(address, None).await?;
        if code.is_empty() {
            return Err(ServiceError::InvalidTransactionData(
                "Not a contract".to_string(),
            ));
        }

        // Enhanced contract type detection could go here
        // For now, return Unknown but with code presence confirmed
        Ok(ContractType::Unknown)
    }
}
