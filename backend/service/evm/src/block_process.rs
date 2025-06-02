use std::sync::Arc;

use custom_error::ServiceError;
use database::DatabaseService;
use models::evm::{EvmBlock, EvmTransaction, NetworkType, TransactionType};
use ethers::{
    providers::{Http, Middleware, Provider},
    types::BlockId,
};
use blockscan::BlockStateQuery;
use surrealdb::sql::Thing;

#[derive(Clone)]
pub struct BlockProcessingService {
    pub provider: Arc<Provider<Http>>,
    pub db_service: DatabaseService,
}

impl BlockProcessingService {
    pub fn new(provider: Arc<Provider<Http>>, db_service: DatabaseService) -> Self {
        Self { provider, db_service }
    }

    pub async fn lastest_block(&self) -> Result<u64, ServiceError> {
        let latest_block = self.provider.get_block_number().await.map_err(|e| {
            ServiceError::ProviderError(e)
        })?;

        Ok(latest_block.as_u64())
    }

    pub async fn process_block(&self, block_number: u32) -> Result<(), ServiceError> {
        let block_id = BlockId::Number(block_number.into());
        let query = BlockStateQuery::new(Arc::clone(&self.provider), block_id);

        println!("🚀 Starting to process block {}", block_number);
        println!("🔍 Checking if block {} already exists...", block_number);
        let evm_service = self.db_service.evm_blocks();
        if evm_service.exists_by_number(block_number).await? {
            println!("⚠️  Block {} already exists in database, skipping...", block_number);
            return Ok(());
        }

        println!("🎯  Fetching block information...");
        // todo: save to database
        let block_info = match query.block_info().await {
            Ok(block) => block,
            Err(e) => return Err(e),
        };

        let total_burned_wei = block_info.base_fee_per_gas.unwrap_or(0) * block_info.gas_used;
        let total_burned_eth = total_burned_wei as f64 / 1e18;
        let session = block_number / 900;
        let era = session / 96;    

        let block_save = EvmBlock {
            id: Thing::from((config::EVM_BLOCK_TABLE, block_info.number.to_string().as_str())),
            number: block_info.number as u32,
            hash: block_info.hash.unwrap_or("0x536274806b33f992898c98f2ad4fe6e190057900fcd8505083e3b765790b4bed".to_string()),
            parent_hash: block_info.parent_hash,
            timestamp: block_info.timestamp as u128,
            transaction_count: block_info.transactions_count as u16,
            size: block_info.size.unwrap_or(0),
            gas_used: block_info.gas_used,
            gas_limit: block_info.gas_limit,
            base_fee: block_info.base_fee_per_gas.unwrap_or(0) / 1_000_000_000u64,
            burn_fee: total_burned_eth,
            validator: block_info.validate,
            extra_data: block_info.extra_data,
            nonce: block_info.nonce.map(|n| n as u32),
            session,
            era
        };

        match evm_service.save(&block_save).await {
            Ok(saved_block) => {
                println!("✅ Successfully saved block {} with hash: {:?}", 
                    block_number, saved_block.hash);
            },
            Err(e) => {
                // Check if it's a duplicate record error
                if e.to_string().contains("already exists") {
                    println!("⚠️  Block {} was inserted by another process, skipping...", block_number);
                    return Ok(()); // Treat as success since the block exists
                } else {
                    println!("❌ Failed to save block {}: {}", block_number, e);
                    return Err(e);
                }
            }
        }
        Ok(())
    }

    pub async fn process_transactions(&self, block_number: u32) -> Result<(), ServiceError> {
        let block_id = BlockId::Number(block_number.into());
        let query = BlockStateQuery::new(Arc::clone(&self.provider), block_id);
        let tx_service = self.db_service.transactions();
        
        println!("🎯 Fetching transactions information...");
        let tx_hashes = query.transactions_hash_in_block().await?;
        
        for tx_hash in tx_hashes {
            let tx_hash = format!("{:#x}", tx_hash);
            
            println!("🔍 Checking if transaction {} already exists...", tx_hash);
            if tx_service.is_exist_by_hash(&tx_hash).await? {
                println!("⚠️ Transaction {} already exists in database", tx_hash);
                return Ok(())
            }
    
            let mut transaction_info = query.transaction_by_hash(&tx_hash).await?;
            let transaction_method = query.get_transaction_method(&transaction_info).await?;
            transaction_info.trasation_method = Some(transaction_method);
    
            let new_tx = EvmTransaction {
                id: Thing::from((config::EVM_TXS_TABLE, tx_hash.to_string().as_str())),
                hash: transaction_info.hash,
                block_number: transaction_info.block_number,
                timestamp: transaction_info.timestamp.unwrap_or(0),
                from: transaction_info.from,
                to: transaction_info.to,
                value: transaction_info.value,
                gas_price: transaction_info.transaction_fee.gas_price.unwrap_or(0),
                gas_limit: transaction_info.transaction_fee.gas_limit,
                gas_used: transaction_info.transaction_fee.gas_used,
                nonce: transaction_info.nonce,
                status: transaction_info.status,
                transaction_type: transaction_info.transaction_type
                    .map(|t| match t {
                        0 => TransactionType::Legacy,
                        1 => TransactionType::AccessList,
                        2 => TransactionType::DynamicFee,
                        _ => TransactionType::Legacy,
                    })
                    .unwrap_or(TransactionType::Legacy),
                network_type: NetworkType::Evm,
                input: None,
                fee: transaction_info.transaction_fee.total_fee,
                transaction_method: transaction_info.trasation_method,
            };
    
            match tx_service.save(&new_tx).await {
                Ok(_) => {
                    println!("🎉 Transaction {} processing completed!", tx_hash);
                },
                Err(e) => {
                    // Check if it's a "already exists" error
                    let error_msg = e.to_string();
                    if error_msg.contains("already exists") {
                        println!("⚠️ Transaction {} already exists (caught during save), skipping...", tx_hash);
                        continue; // Continue processing other transactions
                    } else {
                        println!("❌ Failed to save Transaction {}: {}", tx_hash, e);
                        return Err(e); // Only return error for non-duplicate issues
                    }
                }
            }
        }
        Ok(())
    }

    pub async fn process_transaction(
        &self,
        query: &BlockStateQuery,
        tx_hash: &str,
    ) -> Result<(), ServiceError> {
        let mut transaction_info = query.transaction_by_hash(tx_hash).await?;
        let transaction_method = query.get_transaction_method(&transaction_info).await?;

        // todo: save to transaction_info database
        transaction_info.trasation_method = Some(transaction_method);

        println!("🎯 Fetching account information...");
        self.process_account(query, tx_hash, &transaction_info.from)
            .await?;
        if let Some(to) = &transaction_info.to {
            self.process_account(query, tx_hash, to).await?;
        }

        Ok(())
    }

    async fn process_account(
        &self,
        query: &BlockStateQuery,
        tx_hash: &str,
        address: &str,
    ) -> Result<(), ServiceError> {
        println!("👥 processing {} account...", address);
        let account_info = query.query_account(address).await?;

        // todo: save to database
        let _account = {
            account_info.clone().address;
            account_info.balance_token;
            account_info.nonce;
            account_info.is_contract;
        };

        if let Some(contract) = account_info.contract_type {
            let _creator_info = query.get_contract_creation_info(&tx_hash).await?;

            // todo: save to database
            let _contract = {
                account_info.address;
                contract.contract_type;
                contract.name;
                contract.symbol;
                contract.decimals;
                contract.total_supply;
            };
        }
        Ok(())
    }
}
