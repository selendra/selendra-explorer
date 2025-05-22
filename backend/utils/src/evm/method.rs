use std::{collections::HashMap, sync::Arc};

use custom_error::ServiceError;
use ethers::providers::{Http, Middleware, Provider};
use model::{method::{ContractType, FunctionInfo, LiquidityAction, StakingAction, TransactionMethod}, transaction::EvmTransactionInfo};

pub struct Method {
    provider: Arc<Provider<Http>>,   
}

impl Method {
    pub fn new(provider: Arc<Provider<Http>>) -> Self {
        Self { 
            provider,
        }
    }

    pub async fn analyze_transaction_method(&self, tx_info: &EvmTransactionInfo) -> Result<TransactionMethod, ServiceError> {
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
            
            match self.identify_function_method(function_sig, tx_info).await {
                Ok(method) => return Ok(method),
                Err(_) => {
                    // Continue with other analysis methods
                }
            }
        }

        // 4. Analyze by contract type if we can't identify function
        if let Some(to_address) = &tx_info.to {
            match self.analyze_contract_type(to_address).await {
                Ok(contract_type) => {
                    return Ok(TransactionMethod::ContractCall {
                        contract_type: Some(contract_type),
                        function_name: None,
                        function_signature: Some(input_data[2..10].to_string()),
                    });
                }
                Err(_) => {
                    // Continue
                }
            }
        }

        // 5. Default to unknown contract call
        Ok(TransactionMethod::ContractCall {
            contract_type: None,
            function_name: None,
            function_signature: Some(input_data[2..10].to_string()),
        })
    }

    async fn identify_function_method(&self, function_sig: &str, tx_info: &EvmTransactionInfo) -> Result<TransactionMethod, ServiceError> {
        // Common function signatures
        let function_signatures = self.get_common_function_signatures();
        
        if let Some(function_info) = function_signatures.get(function_sig) {
            match function_info.name.as_str() {
                // Handle transferFrom with contract type detection
                "transferFrom" => {
                    if let Some(to_address) = &tx_info.to {
                        // First check if it's an NFT contract
                        if let Ok(ContractType::ERC721NFT) = self.analyze_contract_type(to_address).await {
                            return Ok(TransactionMethod::NftTransfer {
                                collection_address: to_address.clone(),
                                token_id: None,
                            });
                        }
                        // Otherwise assume it's an ERC20 token transfer
                        else {
                            return Ok(TransactionMethod::TokenTransfer {
                                token_address: to_address.clone(),
                                token_symbol: None,
                            });
                        }
                    }
                }
                
                // ERC20 Token functions (excluding transferFrom which is handled above)
                "transfer" => {
                    if let Some(to_address) = &tx_info.to {
                        return Ok(TransactionMethod::TokenTransfer {
                            token_address: to_address.clone(),
                            token_symbol: None, // Could be enhanced with token registry
                        });
                    }
                }
                
                // DEX functions
                "swapExactTokensForTokens" | "swapTokensForExactTokens" | 
                "swapExactETHForTokens" | "swapExactTokensForETH" => {
                    return Ok(TransactionMethod::DeFiSwap {
                        protocol: "Uniswap".to_string(),
                        from_token: None,
                        to_token: None,
                    });
                }
                
                "swap" => {
                    return Ok(TransactionMethod::DeFiSwap {
                        protocol: "Generic DEX".to_string(),
                        from_token: None,
                        to_token: None,
                    });
                }
                
                // Liquidity functions
                "addLiquidity" | "addLiquidityETH" => {
                    return Ok(TransactionMethod::DeFiLiquidity {
                        action: LiquidityAction::AddLiquidity,
                        protocol: "AMM".to_string(),
                    });
                }
                
                "removeLiquidity" | "removeLiquidityETH" => {
                    return Ok(TransactionMethod::DeFiLiquidity {
                        action: LiquidityAction::RemoveLiquidity,
                        protocol: "AMM".to_string(),
                    });
                }
                
                // NFT-specific functions
                "safeTransferFrom" => {
                    if let Some(to_address) = &tx_info.to {
                        return Ok(TransactionMethod::NftTransfer {
                            collection_address: to_address.clone(),
                            token_id: None,
                        });
                    }
                }
                
                "mint" => {
                    return Ok(TransactionMethod::NftMint {
                        collection_address: tx_info.to.as_ref().unwrap_or(&"unknown".to_string()).clone(),
                        token_id: None,
                    });
                }
                
                // Staking functions
                "stake" | "deposit" => {
                    return Ok(TransactionMethod::DeFiStaking {
                        action: StakingAction::Stake,
                        protocol: "Generic".to_string(),
                    });
                }
                
                "unstake" | "withdraw" => {
                    return Ok(TransactionMethod::DeFiStaking {
                        action: StakingAction::Unstake,
                        protocol: "Generic".to_string(),
                    });
                }
                
                "claimRewards" | "getReward" => {
                    return Ok(TransactionMethod::DeFiStaking {
                        action: StakingAction::ClaimRewards,
                        protocol: "Generic".to_string(),
                    });
                }
                
                _ => {}
            }
        }
        
        Err(ServiceError::InvalidTransactionData("Unknown function signature".to_string()))
    }

    fn get_common_function_signatures(&self) -> HashMap<String, FunctionInfo> {
        let mut signatures = HashMap::new();
        
        // ERC20 functions
        signatures.insert("a9059cbb".to_string(), FunctionInfo { 
            name: "transfer".to_string(), 
            signature: "transfer(address,uint256)".to_string() 
        });
        signatures.insert("23b872dd".to_string(), FunctionInfo { 
            name: "transferFrom".to_string(), 
            signature: "transferFrom(address,address,uint256)".to_string() 
        });
        signatures.insert("095ea7b3".to_string(), FunctionInfo { 
            name: "approve".to_string(), 
            signature: "approve(address,uint256)".to_string() 
        });
        
        // Uniswap V2 functions
        signatures.insert("38ed1739".to_string(), FunctionInfo { 
            name: "swapExactTokensForTokens".to_string(), 
            signature: "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)".to_string() 
        });
        signatures.insert("7ff36ab5".to_string(), FunctionInfo { 
            name: "swapExactETHForTokens".to_string(), 
            signature: "swapExactETHForTokens(uint256,address[],address,uint256)".to_string() 
        });
        
        // Liquidity functions
        signatures.insert("e8e33700".to_string(), FunctionInfo { 
            name: "addLiquidity".to_string(), 
            signature: "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)".to_string() 
        });
        signatures.insert("f305d719".to_string(), FunctionInfo { 
            name: "addLiquidityETH".to_string(), 
            signature: "addLiquidityETH(address,uint256,uint256,uint256,address,uint256)".to_string() 
        });
        
        // NFT functions
        signatures.insert("42842e0e".to_string(), FunctionInfo { 
            name: "safeTransferFrom".to_string(), 
            signature: "safeTransferFrom(address,address,uint256)".to_string() 
        });
        signatures.insert("40c10f19".to_string(), FunctionInfo { 
            name: "mint".to_string(), 
            signature: "mint(address,uint256)".to_string() 
        });
        
        // Generic functions
        signatures.insert("a694fc3a".to_string(), FunctionInfo { 
            name: "stake".to_string(), 
            signature: "stake(uint256)".to_string() 
        });
        signatures.insert("2e1a7d4d".to_string(), FunctionInfo { 
            name: "withdraw".to_string(), 
            signature: "withdraw(uint256)".to_string() 
        });
        
        signatures
    }

    async fn analyze_contract_type(&self, contract_address: &str) -> Result<ContractType, ServiceError> {
        // Parse the contract address
        let address: ethers::types::Address = contract_address
            .parse()
            .map_err(|_| ServiceError::InvalidTransactionData(format!("Invalid address: {}", contract_address)))?;

        // Check if contract supports ERC20 interface
        if self.supports_erc20_interface(address).await? {
            return Ok(ContractType::ERC20Token);
        }

        // Check if contract supports ERC721 interface
        if self.supports_erc721_interface(address).await? {
            return Ok(ContractType::ERC721NFT);
        }

        // Check if contract supports ERC1155 interface
        if self.supports_erc1155_interface(address).await? {
            return Ok(ContractType::ERC1155MultiToken);
        }

        // Could add more sophisticated contract analysis here
        // For now, return Unknown
        Ok(ContractType::Unknown)
    }

    async fn supports_erc20_interface(&self, address: ethers::types::Address) -> Result<bool, ServiceError> {
        // Try to call standard ERC20 functions to see if they exist
        // This is a simplified check - in practice you might want to use ERC165 or ABI detection
        
        // Check if the contract has bytecode (is a contract)
        let code = self.provider.get_code(address, None).await?;
        if code.is_empty() {
            return Ok(false);
        }

        // For a more robust check, you could:
        // 1. Try calling totalSupply() function
        // 2. Check for Transfer event signatures in logs
        // 3. Use a contract registry or token list
        
        // Simplified heuristic: if it has code and we're checking for ERC20, 
        // we'll assume it might be based on other context
        Ok(true) // This should be more sophisticated in practice
    }

    async fn supports_erc721_interface(&self, address: ethers::types::Address) -> Result<bool, ServiceError> {
        let code = self.provider.get_code(address, None).await?;
        Ok(!code.is_empty()) // Simplified check
    }

    async fn supports_erc1155_interface(&self, address: ethers::types::Address) -> Result<bool, ServiceError> {
        let code = self.provider.get_code(address, None).await?;
        Ok(!code.is_empty()) // Simplified check
    }
}