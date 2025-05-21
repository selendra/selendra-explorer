use std::sync::Arc;

use custom_error::ServiceError;
use ethers::{providers::{Http, Middleware, Provider}, types::BlockId};
use model::{block::EvmBlockInfo, netwiork::EvmNetworkInfo};

pub struct BlockStateQuery {
    pub provider: Arc<Provider<Http>>,
}

impl BlockStateQuery {
    pub fn new(provider: Arc<Provider<Http>>) -> Self {
        Self { provider }
    }

    pub async fn evm_block_info(&self, block_id: &BlockId) -> Result<EvmBlockInfo, ServiceError> {
        let block = self
            .provider
            .get_block(*block_id)
            .await?
            .ok_or(ServiceError::BlockNotFound)?;

        let block_info = EvmBlockInfo {
            number: block.number
                .ok_or_else(|| ServiceError::InvalidBlockData("Missing block number".to_string()))?
                .as_u64(),
            hash: block.hash.map(|h| format!("{:#x}", h)),
            parent_hash: format!("{:#x}", block.parent_hash),
            timestamp: block.timestamp.to_string(),
            gas_used: block.gas_used.as_u64(),
            gas_limit: block.gas_limit.as_u64(),
            base_fee_per_gas: block.base_fee_per_gas.map(|fee| fee.as_u64()),
            miner: format!("{:#x}", block.author.unwrap_or_default()),
            extra_data: format!("0x{}", hex::encode(&block.extra_data)),
            transactions_count: block.transactions.len(),
        };

        Ok(block_info)
    }

    pub async fn evm_network_info(&self) -> Result<EvmNetworkInfo, ServiceError> {
        let chain_id = self.provider.get_chainid().await?.as_u64();
        let gas_price = self.provider.get_gas_price().await?.as_u64();
        let latest_block = self.provider.get_block_number().await?.as_u64();

        // Try to get EIP-1559 fee data
        let (max_priority_fee, max_fee) = match self.provider.estimate_eip1559_fees(None).await {
            Ok((max_fee, max_priority_fee)) => (Some(max_priority_fee.as_u64()), Some(max_fee.as_u64())),
            Err(_) => (None, None),
        };

        Ok(EvmNetworkInfo {
            chain_id,
            gas_price,
            max_priority_fee,
            max_fee,
            latest_block_number: latest_block,
            syncing: false,
        })
    }
}