use custom_error::ServiceError;
use ethers::{
    providers::{Http, Middleware, Provider},
    types::{Address, Bytes, TransactionRequest, U256},
    utils::keccak256,
};
use model::{
    account::EvmAccountInfo,
    contract::{ContractType, EvmContractTypeInfo, NftMetadata, TokenMetadata},
};
use std::sync::Arc;

pub struct AccountQuery {
    provider: Arc<Provider<Http>>,
}

impl AccountQuery {
    pub fn new(provider: Arc<Provider<Http>>) -> Self {
        Self { provider }
    }

    pub async fn query_account(&self, address: &str) -> Result<EvmAccountInfo, ServiceError> {
        let addr: Address = address.parse().map_err(|e| {
            ServiceError::InvalidTransactionData(format!("Invalid address {}: {}", address, e))
        })?;

        let balance = self.provider.get_balance(addr, None).await?;
        let nonce = self.provider.get_transaction_count(addr, None).await?;
        let code = self.provider.get_code(addr, None).await?;

        let is_contract = !code.is_empty();

        let contract_info = if is_contract {
            Some(self.detect_contract_type(addr, &code).await?)
        } else {
            None
        };

        Ok(EvmAccountInfo {
            address: format!("{:#x}", addr),
            balance: balance.to_string(),
            balance_eth: format!("{:.6}", balance.as_u128() as f64 / 1e18),
            nonce: nonce.as_u64(),
            is_contract,
            contract_type: contract_info,
        })
    }

    /// Main contract type detection method
    async fn detect_contract_type(
        &self,
        address: Address,
        code: &Bytes,
    ) -> Result<EvmContractTypeInfo, ServiceError> {
        // First try ERC165 detection (most reliable)
        if let Ok(contract_type) = self.detect_by_erc165(address).await {
            if !matches!(contract_type, ContractType::Unknown) {
                return Ok(self.create_contract_info(contract_type, address).await?);
            }
        }

        // Fall back to function signature detection
        let contract_type = self.detect_by_function_signatures(address, code).await?;
        Ok(self.create_contract_info(contract_type, address).await?)
    }

    /// Detect contract type using ERC165 supportsInterface
    async fn detect_by_erc165(&self, address: Address) -> Result<ContractType, ServiceError> {
        // Interface IDs
        let erc721_interface_id = [0x80, 0xac, 0x58, 0xcd]; // 0x80ac58cd
        let erc1155_interface_id = [0xd9, 0xb6, 0x7a, 0x26]; // 0xd9b67a26

        // Check ERC721
        if let Ok(supports_erc721) = self
            .call_supports_interface(address, &erc721_interface_id)
            .await
        {
            if supports_erc721 {
                return Ok(ContractType::ERC721);
            }
        }

        // Check ERC1155
        if let Ok(supports_erc1155) = self
            .call_supports_interface(address, &erc1155_interface_id)
            .await
        {
            if supports_erc1155 {
                return Ok(ContractType::ERC1155);
            }
        }

        Ok(ContractType::Unknown)
    }

    /// Helper to call supportsInterface function
    async fn call_supports_interface(
        &self,
        address: Address,
        interface_id: &[u8; 4],
    ) -> Result<bool, ServiceError> {
        let selector = [0x01, 0xff, 0xc9, 0xa7]; // supportsInterface selector
        let mut calldata = Vec::new();
        calldata.extend_from_slice(&selector);
        calldata.extend_from_slice(interface_id);
        calldata.extend_from_slice(&[0u8; 28]); // Pad to 32 bytes

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(calldata));

        match self.provider.call(&call_request.into(), None).await {
            Ok(result) => {
                if result.len() >= 32 {
                    // Last byte should be 1 for true, 0 for false
                    Ok(result[31] == 1)
                } else {
                    Ok(false)
                }
            }
            Err(_) => Ok(false),
        }
    }

    /// Detect contract type by checking function signatures in bytecode
    async fn detect_by_function_signatures(
        &self,
        address: Address,
        code: &Bytes,
    ) -> Result<ContractType, ServiceError> {
        // Define function signatures for each contract type
        let erc20_signatures = vec![
            "totalSupply()",
            "balanceOf(address)",
            "transfer(address,uint256)",
            "allowance(address,address)",
            "approve(address,uint256)",
            "transferFrom(address,address,uint256)",
        ];

        let erc721_signatures = vec![
            "balanceOf(address)",
            "ownerOf(uint256)",
            "safeTransferFrom(address,address,uint256)",
            "transferFrom(address,address,uint256)",
            "approve(address,uint256)",
            "getApproved(uint256)",
            "setApprovalForAll(address,bool)",
            "isApprovedForAll(address,address)",
        ];

        let erc1155_signatures = vec![
            "balanceOf(address,uint256)",
            "balanceOfBatch(address[],uint256[])",
            "setApprovalForAll(address,bool)",
            "isApprovedForAll(address,address)",
            "safeTransferFrom(address,address,uint256,uint256,bytes)",
            "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
        ];

        // Count matches for each contract type
        let erc20_matches = self.count_signature_matches(code, &erc20_signatures);
        let erc721_matches = self.count_signature_matches(code, &erc721_signatures);
        let erc1155_matches = self.count_signature_matches(code, &erc1155_signatures);

        // Determine contract type based on matches
        // ERC1155 takes precedence as it's more specific
        if erc1155_matches >= 4 {
            // Try to verify with actual function calls
            if self.verify_erc1155_contract(address).await.unwrap_or(false) {
                return Ok(ContractType::ERC1155);
            }
        }

        if erc721_matches >= 6 {
            // Try to verify with actual function calls
            if self.verify_erc721_contract(address).await.unwrap_or(false) {
                return Ok(ContractType::ERC721);
            }
        }

        if erc20_matches >= 5 {
            // Try to verify with actual function calls
            if self.verify_erc20_contract(address).await.unwrap_or(false) {
                return Ok(ContractType::ERC20);
            }
        }

        Ok(ContractType::Unknown)
    }

    /// Count how many function signatures match in the contract bytecode
    fn count_signature_matches(&self, code: &Bytes, signatures: &[&str]) -> usize {
        let mut matches = 0;

        for sig in signatures {
            let selector = keccak256(sig.as_bytes());
            let selector_bytes = &selector[0..4];

            if code
                .as_ref()
                .windows(4)
                .any(|window| window == selector_bytes)
            {
                matches += 1;
            }
        }

        matches
    }

    /// Verify ERC20 contract by calling totalSupply function
    async fn verify_erc20_contract(&self, address: Address) -> Result<bool, ServiceError> {
        // totalSupply() selector: 0x18160ddd
        let selector = [0x18, 0x16, 0x0d, 0xdd];

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(selector.to_vec()));

        match self.provider.call(&call_request.into(), None).await {
            Ok(result) => Ok(result.len() == 32), // Should return uint256 (32 bytes)
            Err(_) => Ok(false),
        }
    }

    /// Verify ERC721 contract by calling balanceOf function
    async fn verify_erc721_contract(&self, address: Address) -> Result<bool, ServiceError> {
        // balanceOf(address) selector: 0x70a08231
        let selector = [0x70, 0xa0, 0x82, 0x31];
        let zero_address = [0u8; 32]; // Zero address padded to 32 bytes

        let mut calldata = Vec::new();
        calldata.extend_from_slice(&selector);
        calldata.extend_from_slice(&zero_address);

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(calldata));

        match self.provider.call(&call_request.into(), None).await {
            Ok(result) => Ok(result.len() == 32), // Should return uint256 (32 bytes)
            Err(_) => Ok(false),
        }
    }

    /// Verify ERC1155 contract by calling balanceOf function
    async fn verify_erc1155_contract(&self, address: Address) -> Result<bool, ServiceError> {
        // balanceOf(address,uint256) selector: 0x00fdd58e
        let selector = [0x00, 0xfd, 0xd5, 0x8e];
        let zero_address = [0u8; 32]; // Zero address
        let zero_token_id = [0u8; 32]; // Zero token ID

        let mut calldata = Vec::new();
        calldata.extend_from_slice(&selector);
        calldata.extend_from_slice(&zero_address);
        calldata.extend_from_slice(&zero_token_id);

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(calldata));

        match self.provider.call(&call_request.into(), None).await {
            Ok(result) => Ok(result.len() == 32), // Should return uint256 (32 bytes)
            Err(_) => Ok(false),
        }
    }

    /// Create contract info with additional metadata
    async fn create_contract_info(
        &self,
        contract_type: ContractType,
        address: Address,
    ) -> Result<EvmContractTypeInfo, ServiceError> {
        let mut info = EvmContractTypeInfo {
            contract_type: contract_type.clone(),
            name: None,
            symbol: None,
            decimals: None,
            total_supply: None,
        };

        // Try to get additional info for ERC20 tokens
        if matches!(contract_type, ContractType::ERC20) {
            if let Ok(token_info) = self.get_erc20_metadata(address).await {
                info.name = token_info.name;
                info.symbol = token_info.symbol;
                info.decimals = token_info.decimals;
                info.total_supply = token_info.total_supply.map(|ts| ts.to_string());
            }
        }

        // Try to get additional info for ERC721 tokens
        if matches!(contract_type, ContractType::ERC721) {
            if let Ok(nft_info) = self.get_erc721_metadata(address).await {
                info.name = nft_info.name;
                info.symbol = nft_info.symbol;
            }
        }

        Ok(info)
    }

    /// Get ERC20 token metadata using raw calls
    async fn get_erc20_metadata(&self, address: Address) -> Result<TokenMetadata, ServiceError> {
        let name = self
            .call_string_function(address, &[0x06, 0xfd, 0xde, 0x03])
            .await
            .ok(); // name()
        let symbol = self
            .call_string_function(address, &[0x95, 0xd8, 0x9b, 0x41])
            .await
            .ok(); // symbol()
        let decimals = self.call_decimals_function(address).await.ok();
        let total_supply = self.call_total_supply_function(address).await.ok();

        Ok(TokenMetadata {
            name,
            symbol,
            decimals,
            total_supply,
        })
    }

    /// Get ERC721 token metadata using raw calls
    async fn get_erc721_metadata(&self, address: Address) -> Result<NftMetadata, ServiceError> {
        let name = self
            .call_string_function(address, &[0x06, 0xfd, 0xde, 0x03])
            .await
            .ok(); // name()
        let symbol = self
            .call_string_function(address, &[0x95, 0xd8, 0x9b, 0x41])
            .await
            .ok(); // symbol()

        Ok(NftMetadata { name, symbol })
    }

    /// Helper to call string functions (name, symbol)
    async fn call_string_function(
        &self,
        address: Address,
        selector: &[u8; 4],
    ) -> Result<String, ServiceError> {
        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(selector.to_vec()));

        let result = self
            .provider
            .call(&call_request.into(), None)
            .await
            .map_err(|e| ServiceError::InvalidTransactionData(format!("Call failed: {}", e)))?;

        if result.len() < 64 {
            return Err(ServiceError::InvalidTransactionData(
                "Invalid response length".to_string(),
            ));
        }

        // Skip offset (first 32 bytes) and length (next 32 bytes), then read string
        let length = U256::from_big_endian(&result[32..64]).as_usize();
        if result.len() < 64 + length {
            return Err(ServiceError::InvalidTransactionData(
                "String length exceeds data".to_string(),
            ));
        }

        let string_bytes = &result[64..64 + length];
        String::from_utf8(string_bytes.to_vec())
            .map_err(|e| ServiceError::InvalidTransactionData(format!("Invalid UTF-8: {}", e)))
    }

    /// Helper to call decimals function
    async fn call_decimals_function(&self, address: Address) -> Result<u8, ServiceError> {
        let selector = [0x31, 0x3c, 0xe5, 0x67]; // decimals()

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(selector.to_vec()));

        let result = self
            .provider
            .call(&call_request.into(), None)
            .await
            .map_err(|e| ServiceError::InvalidTransactionData(format!("Call failed: {}", e)))?;

        if result.len() != 32 {
            return Err(ServiceError::InvalidTransactionData(
                "Invalid decimals response".to_string(),
            ));
        }

        Ok(result[31]) // Last byte contains the decimals value
    }

    /// Helper to call totalSupply function
    async fn call_total_supply_function(&self, address: Address) -> Result<U256, ServiceError> {
        let selector = [0x18, 0x16, 0x0d, 0xdd]; // totalSupply()

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(selector.to_vec()));

        let result = self
            .provider
            .call(&call_request.into(), None)
            .await
            .map_err(|e| ServiceError::InvalidTransactionData(format!("Call failed: {}", e)))?;

        if result.len() != 32 {
            return Err(ServiceError::InvalidTransactionData(
                "Invalid totalSupply response".to_string(),
            ));
        }

        Ok(U256::from_big_endian(&result))
    }
}
