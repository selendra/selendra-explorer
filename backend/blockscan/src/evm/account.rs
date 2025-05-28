use custom_error::ServiceError;
use ethers::{
    providers::{Http, Middleware, Provider},
    types::{Address, Bytes, H256, TransactionRequest, U64, U256},
    utils::keccak256,
};
use model::{
    account::EvmAccountInfo,
    contract::{
        ContractCreationInfo, ContractType, EvmContractTypeInfo, NftMetadata, TokenMetadata,
    },
};
use std::{collections::HashMap, sync::Arc};
use tokio::time::{Duration, timeout};

// Constants for function selectors
mod selectors {
    pub const SUPPORTS_INTERFACE: [u8; 4] = [0x01, 0xff, 0xc9, 0xa7];
    pub const TOTAL_SUPPLY: [u8; 4] = [0x18, 0x16, 0x0d, 0xdd];
    pub const BALANCE_OF_ERC721: [u8; 4] = [0x70, 0xa0, 0x82, 0x31];
    pub const BALANCE_OF_ERC1155: [u8; 4] = [0x00, 0xfd, 0xd5, 0x8e];
    pub const NAME: [u8; 4] = [0x06, 0xfd, 0xde, 0x03];
    pub const SYMBOL: [u8; 4] = [0x95, 0xd8, 0x9b, 0x41];
    pub const DECIMALS: [u8; 4] = [0x31, 0x3c, 0xe5, 0x67];
}

// Interface IDs as constants
mod interface_ids {
    pub const ERC721: [u8; 4] = [0x80, 0xac, 0x58, 0xcd];
    pub const ERC1155: [u8; 4] = [0xd9, 0xb6, 0x7a, 0x26];
}

// Contract signature patterns
struct ContractSignatures {
    erc20: Vec<&'static str>,
    erc721: Vec<&'static str>,
    erc1155: Vec<&'static str>,
}

impl Default for ContractSignatures {
    fn default() -> Self {
        Self {
            erc20: vec![
                "totalSupply()",
                "balanceOf(address)",
                "transfer(address,uint256)",
                "allowance(address,address)",
                "approve(address,uint256)",
                "transferFrom(address,address,uint256)",
            ],
            erc721: vec![
                "balanceOf(address)",
                "ownerOf(uint256)",
                "safeTransferFrom(address,address,uint256)",
                "transferFrom(address,address,uint256)",
                "approve(address,uint256)",
                "getApproved(uint256)",
                "setApprovalForAll(address,bool)",
                "isApprovedForAll(address,address)",
            ],
            erc1155: vec![
                "balanceOf(address,uint256)",
                "balanceOfBatch(address[],uint256[])",
                "setApprovalForAll(address,bool)",
                "isApprovedForAll(address,address)",
                "safeTransferFrom(address,address,uint256,uint256,bytes)",
                "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
            ],
        }
    }
}

pub struct AccountQuery {
    provider: Arc<Provider<Http>>,
    signatures: ContractSignatures,
    call_timeout: Duration,
}

impl AccountQuery {
    pub fn new(provider: Arc<Provider<Http>>) -> Self {
        Self {
            provider,
            signatures: ContractSignatures::default(),
            call_timeout: Duration::from_secs(10),
        }
    }

    pub async fn query_account(&self, address: &str) -> Result<EvmAccountInfo, ServiceError> {
        let addr = self.parse_address(address)?;

        // Batch RPC calls for better performance
        let (balance, nonce, code) = tokio::try_join!(
            self.provider.get_balance(addr, None),
            self.provider.get_transaction_count(addr, None),
            self.provider.get_code(addr, None)
        )?;

        let is_contract = !code.is_empty();
        let contract_info = if is_contract {
            Some(self.detect_contract_type(addr, &code).await?)
        } else {
            None
        };

        Ok(EvmAccountInfo {
            address: format!("{:#x}", addr),
            balance: balance.to_string(),
            balance_token: Self::format_balance_ether(balance),
            nonce: nonce.as_u64(),
            is_contract,
            contract_type: contract_info,
        })
    }

    pub async fn get_contract_creation_info(
        &self,
        tx_hash: &str,
    ) -> Result<Option<ContractCreationInfo>, ServiceError> {
        let hash = self.parse_hash(tx_hash)?;

        // Batch fetch transaction and receipt
        let (tx_opt, receipt_opt) = tokio::try_join!(
            self.provider.get_transaction(hash),
            self.provider.get_transaction_receipt(hash)
        )?;

        let tx = tx_opt.ok_or_else(|| ServiceError::TransactionNotFound(tx_hash.to_string()))?;
        let receipt = receipt_opt
            .ok_or_else(|| ServiceError::TransactionReceiptNotFound(tx_hash.to_string()))?;

        // Early return if not a contract creation
        if tx.to.is_some() || receipt.contract_address.is_none() {
            return Ok(None);
        }

        let contract_address = receipt.contract_address.unwrap();
        let timestamp = self.get_block_timestamp(tx.block_number).await;

        Ok(Some(ContractCreationInfo {
            contract_address: format!("{:#x}", contract_address),
            creator_address: format!("{:#x}", tx.from),
            transaction_hash: format!("{:#x}", hash),
            block_number: tx.block_number.map(|bn| bn.as_u64()).unwrap_or(0),
            timestamp,
            creation_bytecode: format!("0x{}", hex::encode(&tx.input)),
        }))
    }

    async fn detect_contract_type(
        &self,
        address: Address,
        code: &Bytes,
    ) -> Result<EvmContractTypeInfo, ServiceError> {
        // Try ERC165 first (most reliable)
        if let Ok(contract_type) = self.detect_by_erc165(address).await {
            if !matches!(contract_type, ContractType::Unknown) {
                return self.create_contract_info(contract_type, address).await;
            }
        }

        // Fallback to function signature detection
        let contract_type = self.detect_by_function_signatures(address, code).await?;
        self.create_contract_info(contract_type, address).await
    }

    async fn detect_by_erc165(&self, address: Address) -> Result<ContractType, ServiceError> {
        // Check multiple interfaces concurrently
        let (erc721_result, erc1155_result) = tokio::join!(
            self.call_supports_interface(address, &interface_ids::ERC721),
            self.call_supports_interface(address, &interface_ids::ERC1155)
        );

        if erc721_result.unwrap_or(false) {
            return Ok(ContractType::ERC721);
        }
        if erc1155_result.unwrap_or(false) {
            return Ok(ContractType::ERC1155);
        }

        Ok(ContractType::Unknown)
    }

    async fn call_supports_interface(
        &self,
        address: Address,
        interface_id: &[u8; 4],
    ) -> Result<bool, ServiceError> {
        let mut calldata = Vec::with_capacity(36);
        calldata.extend_from_slice(&selectors::SUPPORTS_INTERFACE);
        calldata.extend_from_slice(interface_id);
        calldata.extend_from_slice(&[0u8; 28]); // Pad to 32 bytes

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(calldata));

        match timeout(
            self.call_timeout,
            self.provider.call(&call_request.into(), None),
        )
        .await
        {
            Ok(Ok(result)) => Ok(result.len() >= 32 && result[31] == 1),
            _ => Ok(false),
        }
    }

    async fn detect_by_function_signatures(
        &self,
        address: Address,
        code: &Bytes,
    ) -> Result<ContractType, ServiceError> {
        // Pre-compute signature hashes for better performance
        let signature_cache = self.build_signature_cache();

        let (erc20_matches, erc721_matches, erc1155_matches) = (
            self.count_signature_matches(code, &signature_cache, &self.signatures.erc20),
            self.count_signature_matches(code, &signature_cache, &self.signatures.erc721),
            self.count_signature_matches(code, &signature_cache, &self.signatures.erc1155),
        );

        // Verify contracts in order of specificity
        if erc1155_matches >= 4 && self.verify_erc1155_contract(address).await.unwrap_or(false) {
            return Ok(ContractType::ERC1155);
        }

        if erc721_matches >= 6 && self.verify_erc721_contract(address).await.unwrap_or(false) {
            return Ok(ContractType::ERC721);
        }

        if erc20_matches >= 5 && self.verify_erc20_contract(address).await.unwrap_or(false) {
            return Ok(ContractType::ERC20);
        }

        Ok(ContractType::Unknown)
    }

    fn build_signature_cache(&self) -> HashMap<&'static str, [u8; 4]> {
        let mut cache = HashMap::new();

        for signatures in [
            &self.signatures.erc20,
            &self.signatures.erc721,
            &self.signatures.erc1155,
        ] {
            for &sig in signatures {
                if !cache.contains_key(sig) {
                    let hash = keccak256(sig.as_bytes());
                    let mut selector = [0u8; 4];
                    selector.copy_from_slice(&hash[0..4]);
                    cache.insert(sig, selector);
                }
            }
        }

        cache
    }

    fn count_signature_matches(
        &self,
        code: &Bytes,
        cache: &HashMap<&'static str, [u8; 4]>,
        signatures: &[&'static str],
    ) -> usize {
        signatures
            .iter()
            .filter(|&&sig| {
                if let Some(selector) = cache.get(sig) {
                    code.as_ref().windows(4).any(|window| window == selector)
                } else {
                    false
                }
            })
            .count()
    }

    async fn verify_erc20_contract(&self, address: Address) -> Result<bool, ServiceError> {
        self.make_verification_call(address, &selectors::TOTAL_SUPPLY, &[])
            .await
    }

    async fn verify_erc721_contract(&self, address: Address) -> Result<bool, ServiceError> {
        let zero_address = [0u8; 32];
        self.make_verification_call(address, &selectors::BALANCE_OF_ERC721, &zero_address)
            .await
    }

    async fn verify_erc1155_contract(&self, address: Address) -> Result<bool, ServiceError> {
        let mut data = Vec::with_capacity(64);
        data.extend_from_slice(&[0u8; 32]); // Zero address
        data.extend_from_slice(&[0u8; 32]); // Zero token ID

        self.make_verification_call(address, &selectors::BALANCE_OF_ERC1155, &data)
            .await
    }

    async fn make_verification_call(
        &self,
        address: Address,
        selector: &[u8; 4],
        params: &[u8],
    ) -> Result<bool, ServiceError> {
        let mut calldata = Vec::with_capacity(4 + params.len());
        calldata.extend_from_slice(selector);
        calldata.extend_from_slice(params);

        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(calldata));

        match timeout(
            self.call_timeout,
            self.provider.call(&call_request.into(), None),
        )
        .await
        {
            Ok(Ok(result)) => Ok(result.len() == 32),
            _ => Ok(false),
        }
    }

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

        match contract_type {
            ContractType::ERC20 => {
                if let Ok(token_info) = self.get_erc20_metadata(address).await {
                    info.name = token_info.name;
                    info.symbol = token_info.symbol;
                    info.decimals = token_info.decimals;
                    info.total_supply = token_info.total_supply.map(|ts| ts.to_string());
                }
            }
            ContractType::ERC721 => {
                if let Ok(nft_info) = self.get_erc721_metadata(address).await {
                    info.name = nft_info.name;
                    info.symbol = nft_info.symbol;
                }
            }
            _ => {}
        }

        Ok(info)
    }

    async fn get_erc20_metadata(&self, address: Address) -> Result<TokenMetadata, ServiceError> {
        // Fetch metadata concurrently
        let (name_result, symbol_result, decimals_result, supply_result) = tokio::join!(
            self.call_string_function(address, &selectors::NAME),
            self.call_string_function(address, &selectors::SYMBOL),
            self.call_decimals_function(address),
            self.call_total_supply_function(address)
        );

        Ok(TokenMetadata {
            name: name_result.ok(),
            symbol: symbol_result.ok(),
            decimals: decimals_result.ok(),
            total_supply: supply_result.ok(),
        })
    }

    async fn get_erc721_metadata(&self, address: Address) -> Result<NftMetadata, ServiceError> {
        let (name_result, symbol_result) = tokio::join!(
            self.call_string_function(address, &selectors::NAME),
            self.call_string_function(address, &selectors::SYMBOL)
        );

        Ok(NftMetadata {
            name: name_result.ok(),
            symbol: symbol_result.ok(),
        })
    }

    async fn call_string_function(
        &self,
        address: Address,
        selector: &[u8; 4],
    ) -> Result<String, ServiceError> {
        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(selector.to_vec()));

        let result = timeout(
            self.call_timeout,
            self.provider.call(&call_request.into(), None),
        )
        .await
        .map_err(|_| ServiceError::InvalidTransactionData("Call timeout".to_string()))?
        .map_err(|e| ServiceError::InvalidTransactionData(format!("Call failed: {}", e)))?;

        Self::decode_string_response(&result)
    }

    async fn call_decimals_function(&self, address: Address) -> Result<u8, ServiceError> {
        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(selectors::DECIMALS.to_vec()));

        let result = timeout(
            self.call_timeout,
            self.provider.call(&call_request.into(), None),
        )
        .await
        .map_err(|_| ServiceError::InvalidTransactionData("Call timeout".to_string()))?
        .map_err(|e| ServiceError::InvalidTransactionData(format!("Call failed: {}", e)))?;

        if result.len() != 32 {
            return Err(ServiceError::InvalidTransactionData(
                "Invalid decimals response".to_string(),
            ));
        }

        Ok(result[31])
    }

    async fn call_total_supply_function(&self, address: Address) -> Result<U256, ServiceError> {
        let call_request = TransactionRequest::new()
            .to(address)
            .data(Bytes::from(selectors::TOTAL_SUPPLY.to_vec()));

        let result = timeout(
            self.call_timeout,
            self.provider.call(&call_request.into(), None),
        )
        .await
        .map_err(|_| ServiceError::InvalidTransactionData("Call timeout".to_string()))?
        .map_err(|e| ServiceError::InvalidTransactionData(format!("Call failed: {}", e)))?;

        if result.len() != 32 {
            return Err(ServiceError::InvalidTransactionData(
                "Invalid totalSupply response".to_string(),
            ));
        }

        Ok(U256::from_big_endian(&result))
    }

    // Helper methods
    fn parse_address(&self, address: &str) -> Result<Address, ServiceError> {
        address.parse().map_err(|e| {
            ServiceError::InvalidTransactionData(format!("Invalid address {}: {}", address, e))
        })
    }

    fn parse_hash(&self, tx_hash: &str) -> Result<H256, ServiceError> {
        tx_hash
            .parse()
            .map_err(|_| ServiceError::InvalidTransactionHash(tx_hash.to_string()))
    }

    fn format_balance_ether(balance: U256) -> String {
        format!("{:.6}", balance.as_u128() as f64 / 1e18)
    }

    fn decode_string_response(result: &Bytes) -> Result<String, ServiceError> {
        if result.len() < 64 {
            return Err(ServiceError::InvalidTransactionData(
                "Invalid response length".to_string(),
            ));
        }

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

    async fn get_block_timestamp(&self, block_number: Option<U64>) -> String {
        if let Some(block_num) = block_number {
            match self.provider.get_block(block_num).await {
                Ok(Some(block)) => block.timestamp.to_string(),
                _ => "0".to_string(),
            }
        } else {
            "0".to_string()
        }
    }
}
