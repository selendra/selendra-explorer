use custom_error::ServiceError;
use ethers::providers::{Http, Middleware, Provider};
use model::{
    contract::ContractType,
    method::{GovernanceAction, LiquidityAction, StakingAction, TransactionMethod},
    transaction::EvmTransactionInfo,
};
use std::sync::Arc;

use super::signature_lookup::{FunctionSignature, SignatureCategory, SignatureLookupService};

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
        // Early returns for simple cases
        if self.is_simple_transfer(&tx_info.input_data) {
            return Ok(TransactionMethod::SimpleTransfer);
        }

        if tx_info.to.is_none() {
            return Ok(TransactionMethod::ContractCreation);
        }

        // Extract function signature once
        let function_sig = self.extract_function_signature(&tx_info.input_data)?;

        // Try signature-based analysis first (most likely to succeed)
        if let Some(method) = self
            .analyze_with_signature_lookup(&function_sig, tx_info)
            .await?
        {
            return Ok(method);
        }

        // Fallback to contract type analysis
        if let Some(to_address) = &tx_info.to {
            if let Ok(contract_type) = self.analyze_contract_type(to_address).await {
                return Ok(self.create_contract_call_with_type(contract_type, &function_sig));
            }
        }

        // Final fallback
        Ok(self.create_unknown_contract_call(&function_sig))
    }

    #[inline]
    fn is_simple_transfer(&self, input_data: &str) -> bool {
        input_data == "0x" || input_data.len() <= 2
    }

    fn extract_function_signature(&self, input_data: &str) -> Result<String, ServiceError> {
        if input_data.len() < 10 {
            return Err(ServiceError::InvalidTransactionData(
                "Input data too short for function signature".to_string(),
            ));
        }
        Ok(input_data[2..10].to_string())
    }

    async fn analyze_with_signature_lookup(
        &self,
        function_sig: &str,
        tx_info: &EvmTransactionInfo,
    ) -> Result<Option<TransactionMethod>, ServiceError> {
        let sig_info = match self.signature_lookup.lookup(function_sig) {
            Some(info) => info,
            None => return Ok(None),
        };

        let method = match sig_info.category {
            SignatureCategory::ERC20 => {
                self.handle_erc20_method(&sig_info.name, tx_info, function_sig)?
            }
            SignatureCategory::UniswapV2 | SignatureCategory::UniswapV3 => {
                self.handle_dex_method(sig_info, function_sig)
            }
            SignatureCategory::Compound | SignatureCategory::Aave | SignatureCategory::Yearn => {
                self.handle_lending_method(&sig_info)
            }
            SignatureCategory::Curve => self.handle_curve_method(&sig_info, function_sig),
            SignatureCategory::ERC721 | SignatureCategory::ERC1155 => {
                self.handle_nft_method(&sig_info, tx_info, function_sig)?
            }
            SignatureCategory::NFTMarketplace => self.handle_nft_marketplace(tx_info),
            SignatureCategory::Staking => self.handle_staking_method(&sig_info),
            SignatureCategory::Governance => self.handle_governance_method(&sig_info),
            SignatureCategory::Generic => {
                self.create_generic_contract_call(&sig_info, function_sig)
            }
            SignatureCategory::Unknown => self.handle_unknown_signature(function_sig, &sig_info),
            _ => self.create_generic_contract_call(&sig_info, function_sig),
        };

        Ok(Some(method))
    }

    fn handle_erc20_method(
        &self,
        method_name: &str,
        tx_info: &EvmTransactionInfo,
        function_sig: &str,
    ) -> Result<TransactionMethod, ServiceError> {
        match method_name {
            "transfer" | "transferFrom" => {
                let token_address = tx_info.to.as_ref().ok_or_else(|| {
                    ServiceError::InvalidTransactionData("Missing recipient address".to_string())
                })?;

                Ok(TransactionMethod::TokenTransfer {
                    token_address: token_address.clone(),
                    token_symbol: None,
                })
            }
            _ => Ok(TransactionMethod::ContractCall {
                contract_type: Some(ContractType::ERC20),
                function_name: Some(method_name.to_string()),
                function_signature: Some(function_sig.to_string()),
            }),
        }
    }

    fn handle_dex_method(
        &self,
        sig_info: &FunctionSignature,
        function_sig: &str,
    ) -> TransactionMethod {
        let protocol = sig_info.protocol.as_deref().unwrap_or("Unknown DEX");
        let method_name = &sig_info.name;

        if method_name.contains("swap") || method_name.contains("exact") {
            TransactionMethod::DeFiSwap {
                protocol: protocol.to_string(),
                from_token: None,
                to_token: None,
            }
        } else if method_name.contains("liquidity") {
            let action = if method_name.contains("add") || method_name.contains("increase") {
                LiquidityAction::AddLiquidity
            } else if method_name.contains("remove") || method_name.contains("decrease") {
                LiquidityAction::RemoveLiquidity
            } else {
                LiquidityAction::AddLiquidity
            };

            TransactionMethod::DeFiLiquidity {
                action,
                protocol: protocol.to_string(),
            }
        } else if method_name == "multicall" {
            TransactionMethod::DeFiSwap {
                protocol: "Uniswap V3 (Multicall)".to_string(),
                from_token: None,
                to_token: None,
            }
        } else {
            TransactionMethod::ContractCall {
                contract_type: Some(ContractType::DEX),
                function_name: Some(method_name.clone()),
                function_signature: Some(function_sig.to_string()),
            }
        }
    }

    fn handle_lending_method(&self, sig_info: &FunctionSignature) -> TransactionMethod {
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
                function_signature: None, // Omit for brevity since we have function_name
            },
        }
    }

    fn handle_curve_method(
        &self,
        sig_info: &FunctionSignature,
        function_sig: &str,
    ) -> TransactionMethod {
        match sig_info.name.as_str() {
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
        }
    }

    fn handle_nft_method(
        &self,
        sig_info: &FunctionSignature,
        tx_info: &EvmTransactionInfo,
        function_sig: &str,
    ) -> Result<TransactionMethod, ServiceError> {
        let collection_address = tx_info.to.as_ref().ok_or_else(|| {
            ServiceError::InvalidTransactionData("Missing collection address".to_string())
        })?;

        let method = if sig_info.name.contains("transfer") {
            TransactionMethod::NftTransfer {
                collection_address: collection_address.clone(),
                token_id: None,
            }
        } else if sig_info.name.contains("mint") {
            TransactionMethod::NftMint {
                collection_address: collection_address.clone(),
                token_id: None,
            }
        } else {
            TransactionMethod::ContractCall {
                contract_type: Some(ContractType::ERC721),
                function_name: Some(sig_info.name.clone()),
                function_signature: Some(function_sig.to_string()),
            }
        };

        Ok(method)
    }

    fn handle_nft_marketplace(&self, tx_info: &EvmTransactionInfo) -> TransactionMethod {
        TransactionMethod::NftTransfer {
            collection_address: tx_info
                .to
                .as_ref()
                .unwrap_or(&"unknown".to_string())
                .clone(),
            token_id: None,
        }
    }

    fn handle_staking_method(&self, sig_info: &FunctionSignature) -> TransactionMethod {
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

    fn handle_governance_method(&self, sig_info: &FunctionSignature) -> TransactionMethod {
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

    fn handle_unknown_signature(
        &self,
        function_sig: &str,
        sig_info: &FunctionSignature,
    ) -> TransactionMethod {
        // Use a lookup table for better performance
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

    fn create_generic_contract_call(
        &self,
        sig_info: &FunctionSignature,
        function_sig: &str,
    ) -> TransactionMethod {
        TransactionMethod::ContractCall {
            contract_type: None,
            function_name: Some(sig_info.name.clone()),
            function_signature: Some(function_sig.to_string()),
        }
    }

    fn create_contract_call_with_type(
        &self,
        contract_type: ContractType,
        function_sig: &str,
    ) -> TransactionMethod {
        TransactionMethod::ContractCall {
            contract_type: Some(contract_type),
            function_name: self
                .signature_lookup
                .lookup(function_sig)
                .map(|s| s.name.clone()),
            function_signature: Some(function_sig.to_string()),
        }
    }

    fn create_unknown_contract_call(&self, function_sig: &str) -> TransactionMethod {
        TransactionMethod::ContractCall {
            contract_type: None,
            function_name: self
                .signature_lookup
                .lookup(function_sig)
                .map(|s| s.name.clone()),
            function_signature: Some(function_sig.to_string()),
        }
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

        // TODO: Enhanced contract type detection
        // Could analyze bytecode patterns, check for standard interfaces, etc.
        Ok(ContractType::Unknown)
    }
}
