use std::sync::Arc;

use custom_error::ServiceError;
use database::DatabaseService;
use models::evm::EvmBlock;
use ethers::{
    providers::{Http, Provider},
    types::BlockId,
};
// use model::{account::EvmAccount, contract::EvmContract};
use blockscan::BlockStateQuery;
use surrealdb::sql::Thing;

pub struct BlockProcessingService {
    pub provider: Arc<Provider<Http>>,
    pub db_service: DatabaseService,
}

impl BlockProcessingService {
    pub fn new(provider: Arc<Provider<Http>>, db_service: DatabaseService) -> Self {

        Self { provider, db_service }
    }

    pub async fn process_block(&self, block_number: u64) -> Result<(), ServiceError> {
        println!("🚀 Starting to process block {}", block_number);

        let block_id = BlockId::Number(block_number.into());
        let query = BlockStateQuery::new(Arc::clone(&self.provider), block_id);

        println!("🎯  Fetching block information...");
        // todo: save to database
        let block_info = match query.block_info().await {
            Ok(block) => block,
            Err(e) => return Err(e),
        };

        let block_number = block_info.number as u32;

        println!("🔍 Checking if block {} already exists...", block_number);
        let evm_service = self.db_service.evm_blocks();

        if evm_service.exists_by_number(block_number).await? {
            println!("⚠️  Block {} already exists in database, skipping...", block_number);
            return Ok(());
        }

        let total_burned_wei = block_info.base_fee_per_gas.unwrap_or(0) * block_info.gas_used;
        let total_burned_eth = total_burned_wei as f64 / 1e18;
        let session = block_number / 900;
        let era = session / 96;    

        let block_save = EvmBlock {
            id: Thing::from((config::EVM_BLOCK_TABLE, block_info.number.to_string().as_str())),
            number: block_info.number as u32,
            hash: block_info.hash,
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
                println!("✅ Successfully saved block {} with ID: {:?}", 
                    block_number, saved_block.id);
            },
            Err(e) => {
                println!("❌ Failed to save block {}: {}", block_number, e);
                return Err(e);
            }
        }
        
        println!("🎉 Block {} processing completed!", block_number);

        // let transaction_hashes = query.transactions_hash_in_block().await?;
        // println!("🎯 Processing {} transactions...", transaction_hashes.len());
        // for tx_hash in transaction_hashes {
        //     let tx_hash_str = format!("{:#x}", tx_hash);
        //     self.process_transaction(&query, &tx_hash_str).await?;
        // }

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
