pub mod account;
pub mod method;
pub mod signature_lookup;
pub mod utils;

use account::AccountQuery;
use custom_error::ServiceError;
use ethers::{
    providers::{Http, Middleware, Provider},
    types::{BlockId, H256},
};
use method::Method;
use model::{
    block::EvmBlockInfo, contract::ContractCreationInfo, method::TransactionMethod, netwiork::EvmNetworkInfo, transaction::{EvmTransactionInfo, TransactionStatus}
};
use std::sync::Arc;
use utils::calculate_transaction_fee;

pub struct BlockStateQuery {
    pub provider: Arc<Provider<Http>>,
    pub block_id: BlockId,
}

impl BlockStateQuery {
    pub fn new(provider: Arc<Provider<Http>>, block_id: BlockId) -> Self {
        Self { provider, block_id }
    }

    pub async fn network_info(&self) -> Result<EvmNetworkInfo, ServiceError> {
        let chain_id = self.provider.get_chainid().await?.as_u32();
        let gas_price = self.provider.get_gas_price().await?.as_u32();
        let latest_block = self.provider.get_block_number().await?.as_u32();

        // Try to get EIP-1559 fee data
        let (max_priority_fee, max_fee) = match self.provider.estimate_eip1559_fees(None).await {
            Ok((max_fee, max_priority_fee)) => {
                (Some(max_priority_fee.as_u32()), Some(max_fee.as_u32()))
            }
            Err(_) => (None, None),
        };

        Ok(EvmNetworkInfo {
            chain_id: chain_id as u16,
            gas_price,
            max_priority_fee,
            max_fee,
            latest_block_number: latest_block,
            syncing: false,
        })
    }

    pub async fn block_info(&self) -> Result<EvmBlockInfo, ServiceError> {
        let block_id = self.block_id;
        let block = self
            .provider
            .get_block(block_id)
            .await?
            .ok_or(ServiceError::BlockNotFound)?;

        let block_info = EvmBlockInfo {
            number: block
                .number
                .ok_or_else(|| ServiceError::InvalidBlockData("Missing block number".to_string()))?
                .as_u32(),
            hash: block.hash.map(|h| format!("{:#x}", h)),
            parent_hash: format!("{:#x}", block.parent_hash),
            timestamp: block.timestamp.to_string(),
            gas_used: block.gas_used.as_u32(),
            gas_limit: block.gas_limit.as_u32(),
            base_fee_per_gas: block.base_fee_per_gas.map(|fee| fee.as_u32()),
            validate: format!("{:#x}", block.author.unwrap_or_default()),
            extra_data: format!("0x{}", hex::encode(&block.extra_data)),
            transactions_count: block.transactions.len(),
            size: block.size.map(|s| s.as_usize()),
            nonce: block.nonce.map(|n| format!("{:#x}", n)),
        };

        Ok(block_info)
    }

    pub async fn transaction_by_hash(
        &self,
        tx_hash: &str,
    ) -> Result<EvmTransactionInfo, ServiceError> {
        // Parse the transaction hash
        let hash: H256 = tx_hash
            .parse()
            .map_err(|_| ServiceError::InvalidTransactionHash(tx_hash.to_string()))?;

        // Get transaction details
        let tx = self
            .provider
            .get_transaction(hash)
            .await?
            .ok_or_else(|| ServiceError::TransactionNotFound(tx_hash.to_string()))?;

        let receipt = self
            .provider
            .get_transaction_receipt(tx.hash)
            .await?
            .ok_or_else(|| ServiceError::TransactionReceiptNotFound(tx.hash.to_string()))?;

        let timestamp = if let Some(block_num) = tx.block_number {
            match self.provider.get_block(block_num).await? {
                Some(block) => Some(block.timestamp.to_string()),
                None => None,
            }
        } else {
            None
        };

        let status = match receipt.status {
            Some(status) if status.as_u32() == 1 => TransactionStatus::Success,
            Some(_) => TransactionStatus::Failed,
            None => TransactionStatus::Pending,
        };

        let transaction_fee = calculate_transaction_fee(&tx, &receipt)?;

        let transaction_info = EvmTransactionInfo {
            hash: format!("{:#x}", tx.hash),
            block_number: tx.block_number.map(|bn| bn.as_u32()).unwrap_or(0),
            status, // Assume success if in block
            timestamp,
            from: format!("{:#x}", tx.from),
            to: tx.to.map(|addr| format!("{:#x}", addr)),
            value: tx.value.to_string(),
            transaction_fee,
            nonce: tx.nonce.as_u32(),
            transaction_index: tx.transaction_index.map(|idx| idx.as_u32() as u16),
            transaction_type: tx.transaction_type.map(|t| t.as_u32() as u8),
            input_data: format!("0x{}", hex::encode(&tx.input)),
            trasation_method: None,
        };

        Ok(transaction_info)
    }

    // New account query methods
    pub async fn query_account(
        &self,
        address: &str,
    ) -> Result<model::account::EvmAccountInfo, ServiceError> {
        let account_query = AccountQuery::new(self.provider.clone());
        account_query.query_account(address).await
    }

    pub async fn get_transaction_method(
        &self,
        tx_info: &EvmTransactionInfo,
    ) -> Result<TransactionMethod, ServiceError> {
        let method = Method::new(self.provider.clone());
        Ok(method.analyze_transaction_method(tx_info).await?)
    }

    pub async fn transactions_hash_in_block(&self) -> Result<Vec<H256>, ServiceError> {
        let block_id = self.block_id;
        let block = self
            .provider
            .get_block(block_id)
            .await?
            .ok_or(ServiceError::BlockNotFound)?;

        Ok(block.transactions)
    }

    pub async fn get_contract_creation_info(
        &self,
        tx_hash: &str,
    ) -> Result<Option<ContractCreationInfo>, ServiceError> {
        let account_query = AccountQuery::new(self.provider.clone());
        account_query.get_contract_creation_info(tx_hash).await
    }
}
