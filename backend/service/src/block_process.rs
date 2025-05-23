use std::sync::Arc;

use custom_error::ServiceError;
use ethers::{providers::{Http, Provider}, types::BlockId};
use utils::BlockStateQuery;

pub struct BlockProcessingService {
    pub provider: Arc<Provider<Http>>,
}

impl BlockProcessingService {
    pub fn new(provider: Arc<Provider<Http>>) -> Self {
        Self { 
            provider,
        }
    }

    pub async fn process_block(&self, block_number: u64) -> Result<(), ServiceError> {
        println!("🚀 Starting to process block {}", block_number);
        
        let block_id = BlockId::Number(block_number.into());
        let query = BlockStateQuery::new(Arc::clone(&self.provider), block_id);

        // 1. Get block information
        println!("🎯  Fetching block information...");
        let _block_info = query.block_info().await?;
        println!("📦 block data: {:?}", _block_info);

        let transaction_hashes = query.transactions_hash_in_block().await?;
        println!("🎯 Processing {} transactions...", transaction_hashes.len());

        for tx_hash in transaction_hashes {
            let tx_hash_str = format!("{:#x}", tx_hash);
            self.process_transaction(&query, &tx_hash_str).await?;
        }

        Ok(())
    }

    async fn process_transaction(&self, query: &BlockStateQuery, tx_hash: &str) -> Result<(), ServiceError>{
        let mut transaction_info = query.transaction_by_hash(tx_hash).await?;

        let transaction_method = query.get_transaction_method(&transaction_info).await?;
        transaction_info.trasation_method = Some(transaction_method);

        println!("🔄 transaction data: {:?}", transaction_info);

        println!("🎯 Fetching account information...");
        self.process_account(query, &transaction_info.from).await?;
        if let Some(to) = &transaction_info.to {
            self.process_account(query, to).await?;
        }

        Ok(())
    }

    async fn process_account(&self, query: &BlockStateQuery, address: &str) -> Result<(), ServiceError>{

        println!("👥 processing {} account...", address);
        let account_info = query.query_account(address).await?;
        println!("👥 account data: {:?}", account_info);
        Ok(())
    }
}
