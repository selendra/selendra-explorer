use anyhow::{anyhow, Result};
use chrono::{NaiveDateTime, Utc};
use diesel::prelude::*;
use ethers::prelude::*;
use log::{debug, error, info, warn};
use std::env;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use tokio::time;

use crate::db::{get_connection, DbPool};
use crate::models::account::{Account, NewAccount};
use crate::models::block::{Block, NewBlock};
use crate::models::contract::{Contract, NewContract};
use crate::models::log::{Log, NewLog};
use crate::models::transaction::{NewTransaction, Transaction};
use crate::schema::accounts::dsl as accounts_dsl;
use crate::schema::blocks::dsl as blocks_dsl;
use crate::schema::contracts::dsl as contracts_dsl;
use crate::schema::logs::dsl as logs_dsl;
use crate::schema::transactions::dsl as transactions_dsl;

/// EVM blockchain indexer service
pub struct EvmIndexer {
    provider: Provider<Http>,
    pool: Arc<DbPool>,
    latest_indexed_block: Arc<Mutex<Option<u64>>>,
}

impl EvmIndexer {
    /// Create a new EVM indexer
    pub async fn new(pool: Arc<DbPool>) -> Result<Self> {
        let rpc_url = env::var("SELENDRA_EVM_RPC_URL").unwrap_or_else(|_| "https://rpcx.selendra.org".to_string());
        let provider = Provider::<Http>::try_from(rpc_url)?;
        
        // Get the latest indexed block from the database
        let latest_indexed_block = Self::get_latest_indexed_block(&pool).await?;
        
        Ok(Self {
            provider,
            pool,
            latest_indexed_block: Arc::new(Mutex::new(latest_indexed_block)),
        })
    }
    
    /// Get the latest indexed block from the database
    async fn get_latest_indexed_block(pool: &DbPool) -> Result<Option<u64>> {
        let conn = get_connection(pool)?;
        
        // Use a blocking task for database operations
        let result = tokio::task::spawn_blocking(move || {
            blocks_dsl::blocks
                .order_by(blocks_dsl::number.desc())
                .select(blocks_dsl::number)
                .first::<i64>(&conn)
                .optional()
        })
        .await??;
        
        Ok(result.map(|n| n as u64))
    }
    
    /// Start the indexing process
    pub async fn start_indexing(&self, poll_interval: Duration) -> Result<()> {
        info!("Starting EVM blockchain indexing service");
        
        loop {
            if let Err(e) = self.index_new_blocks().await {
                error!("Error indexing EVM blocks: {}", e);
            }
            
            time::sleep(poll_interval).await;
        }
    }
    
    /// Index new blocks
    async fn index_new_blocks(&self) -> Result<()> {
        // Get the latest block number from the chain
        let latest_chain_block = self.provider.get_block_number().await?;
        let latest_chain_block_num = latest_chain_block.as_u64();
        
        // Get the latest indexed block
        let mut latest_indexed = self.latest_indexed_block.lock().await;
        
        // Determine the starting block
        let start_block = match *latest_indexed {
            Some(num) => num + 1,
            None => {
                // If no blocks have been indexed, start from a recent block
                // In production, you might want to start from genesis or a specific block
                let start_from = latest_chain_block_num.saturating_sub(1000);
                info!("No blocks indexed yet. Starting from block {}", start_from);
                start_from
            }
        };
        
        // Don't proceed if we're already up to date
        if start_block > latest_chain_block_num {
            debug!("Already up to date with the latest block");
            return Ok(());
        }
        
        info!(
            "Indexing EVM blocks from {} to {} ({} blocks)",
            start_block,
            latest_chain_block_num,
            latest_chain_block_num - start_block + 1
        );
        
        // Process blocks in batches to avoid overwhelming the node
        let batch_size = 10;
        let mut current_block = start_block;
        
        while current_block <= latest_chain_block_num {
            let end_block = std::cmp::min(current_block + batch_size - 1, latest_chain_block_num);
            
            for block_num in current_block..=end_block {
                match self.index_block(block_num).await {
                    Ok(_) => {
                        *latest_indexed = Some(block_num);
                        debug!("Indexed EVM block {}", block_num);
                    }
                    Err(e) => {
                        error!("Failed to index EVM block {}: {}", block_num, e);
                        // Continue with the next block instead of stopping the entire process
                    }
                }
            }
            
            current_block = end_block + 1;
        }
        
        info!("Completed indexing EVM blocks up to {}", latest_chain_block_num);
        Ok(())
    }
    
    /// Index a single block
    async fn index_block(&self, block_number: u64) -> Result<()> {
        // Get the block with all transactions
        let block = self
            .provider
            .get_block_with_txs(block_number)
            .await?
            .ok_or_else(|| anyhow!("Block {} not found", block_number))?;
        
        let conn = get_connection(&self.pool)?;
        
        // Use a blocking task for database operations
        tokio::task::spawn_blocking(move || -> Result<()> {
            // Start a transaction
            conn.transaction(|conn| {
                // Insert the block
                let new_block = NewBlock {
                    hash: format!("{:#x}", block.hash.unwrap()),
                    number: block.number.unwrap().as_u64() as i64,
                    timestamp: NaiveDateTime::from_timestamp_opt(
                        block.timestamp.as_u64() as i64,
                        0,
                    ).unwrap_or_else(|| Utc::now().naive_utc()),
                    parent_hash: format!("{:#x}", block.parent_hash),
                    author: block.author.map(|a| format!("{:#x}", a)),
                    state_root: format!("{:#x}", block.state_root),
                    transactions_root: format!("{:#x}", block.transactions_root),
                    receipts_root: format!("{:#x}", block.receipts_root),
                    gas_used: block.gas_used.as_u64() as i64,
                    gas_limit: block.gas_limit.as_u64() as i64,
                    extra_data: Some(format!("0x{}", hex::encode(&block.extra_data))),
                    logs_bloom: block.logs_bloom.map(|b| format!("{:#x}", b)),
                    size: block.size.map(|s| s as i32),
                    difficulty: Some(block.difficulty.to_string()),
                    total_difficulty: block.total_difficulty.map(|d| d.to_string()),
                    consensus_engine: Some("aura".to_string()),
                    finalized: Some(true), // Assuming all indexed blocks are finalized
                    extrinsics_root: None, // EVM blocks don't have this
                    validator_set: None,   // EVM blocks don't have this
                };
                
                diesel::insert_into(blocks_dsl::blocks)
                    .values(&new_block)
                    .on_conflict(blocks_dsl::hash)
                    .do_update()
                    .set(&new_block)
                    .execute(conn)?;
                
                // Process all transactions in the block
                for (tx_idx, tx) in block.transactions.iter().enumerate() {
                    // Insert the transaction
                    let new_tx = NewTransaction {
                        hash: format!("{:#x}", tx.hash),
                        block_hash: format!("{:#x}", block.hash.unwrap()),
                        block_number: block.number.unwrap().as_u64() as i64,
                        from_address: format!("{:#x}", tx.from),
                        to_address: tx.to.map(|a| format!("{:#x}", a)),
                        value: tx.value.to_string(),
                        gas: tx.gas.as_u64() as i64,
                        gas_price: tx.gas_price.unwrap_or_default().as_u64() as i64,
                        input: Some(format!("0x{}", hex::encode(&tx.input))),
                        nonce: tx.nonce.as_u64() as i32,
                        transaction_index: tx_idx as i32,
                        status: None, // Will be updated when we get the receipt
                        transaction_type: tx.transaction_type.map(|t| t as i32),
                        max_fee_per_gas: tx.max_fee_per_gas.map(|f| f.as_u64() as i64),
                        max_priority_fee_per_gas: tx.max_priority_fee_per_gas.map(|f| f.as_u64() as i64),
                        execution_type: "evm".to_string(),
                    };
                    
                    diesel::insert_into(transactions_dsl::transactions)
                        .values(&new_tx)
                        .on_conflict(transactions_dsl::hash)
                        .do_update()
                        .set(&new_tx)
                        .execute(conn)?;
                    
                    // Update or create accounts for from and to addresses
                    Self::update_account(conn, tx.from, false)?;
                    if let Some(to_addr) = tx.to {
                        Self::update_account(conn, to_addr, false)?;
                    }
                }
                
                Ok(())
            })
        })
        .await??;
        
        // After the block is indexed, get receipts and update transaction status and logs
        self.index_receipts_for_block(&block).await?;
        
        Ok(())
    }
    
    /// Index transaction receipts for a block
    async fn index_receipts_for_block(&self, block: &Block<Transaction>) -> Result<()> {
        let conn = get_connection(&self.pool)?;
        
        for tx in &block.transactions {
            // Get the receipt
            let receipt = self
                .provider
                .get_transaction_receipt(tx.hash)
                .await?
                .ok_or_else(|| anyhow!("Receipt for transaction {} not found", tx.hash))?;
            
            // Use a blocking task for database operations
            let tx_hash = format!("{:#x}", tx.hash);
            let status = receipt.status.map(|s| s.as_u64() == 1);
            let logs = receipt.logs.clone();
            let contract_address = receipt.contract_address;
            
            tokio::task::spawn_blocking(move || -> Result<()> {
                // Update transaction status
                diesel::update(transactions_dsl::transactions.filter(transactions_dsl::hash.eq(&tx_hash)))
                    .set(transactions_dsl::status.eq(status))
                    .execute(&conn)?;
                
                // Process logs
                for (log_idx, log) in logs.iter().enumerate() {
                    let new_log = NewLog {
                        transaction_hash: tx_hash.clone(),
                        log_index: log_idx as i32,
                        address: format!("{:#x}", log.address),
                        data: format!("0x{}", hex::encode(&log.data)),
                        topic0: log.topics.get(0).map(|t| format!("{:#x}", t)),
                        topic1: log.topics.get(1).map(|t| format!("{:#x}", t)),
                        topic2: log.topics.get(2).map(|t| format!("{:#x}", t)),
                        topic3: log.topics.get(3).map(|t| format!("{:#x}", t)),
                    };
                    
                    diesel::insert_into(logs_dsl::logs)
                        .values(&new_log)
                        .on_conflict((logs_dsl::transaction_hash, logs_dsl::log_index))
                        .do_update()
                        .set(&new_log)
                        .execute(&conn)?;
                    
                    // Update or create account for the log address
                    Self::update_account(&conn, log.address, true)?;
                }
                
                // If this is a contract creation transaction, create a contract record
                if let Some(contract_addr) = contract_address {
                    // Get the contract bytecode
                    let bytecode = match Self::get_contract_bytecode(&conn, &format!("{:#x}", contract_addr)) {
                        Ok(code) => code,
                        Err(_) => "0x".to_string(), // Default empty bytecode if we can't fetch it
                    };
                    
                    let new_contract = NewContract {
                        address: format!("{:#x}", contract_addr),
                        creator_address: format!("{:#x}", tx.from),
                        creator_transaction_hash: tx_hash.clone(),
                        bytecode,
                        abi: None,
                        name: None,
                        compiler_version: None,
                        optimization_used: None,
                        runs: None,
                        verified: false,
                        verification_date: None,
                        license_type: None,
                        contract_type: "evm".to_string(),
                    };
                    
                    diesel::insert_into(contracts_dsl::contracts)
                        .values(&new_contract)
                        .on_conflict(contracts_dsl::address)
                        .do_update()
                        .set(&new_contract)
                        .execute(&conn)?;
                    
                    // Mark the account as a contract
                    Self::update_account(&conn, contract_addr, true)?;
                }
                
                Ok(())
            })
            .await??;
        }
        
        Ok(())
    }
    
    /// Update or create an account
    fn update_account(conn: &PgConnection, address: Address, is_contract: bool) -> Result<()> {
        let addr_str = format!("{:#x}", address);
        
        // Check if the account exists
        let account = accounts_dsl::accounts
            .filter(accounts_dsl::address.eq(&addr_str))
            .first::<Account>(conn)
            .optional()?;
        
        if let Some(mut account) = account {
            // Update the account if it exists
            if is_contract && !account.is_contract {
                diesel::update(accounts_dsl::accounts.filter(accounts_dsl::address.eq(&addr_str)))
                    .set(accounts_dsl::is_contract.eq(true))
                    .execute(conn)?;
            }
        } else {
            // Create a new account if it doesn't exist
            let new_account = NewAccount {
                address: addr_str,
                balance: "0".to_string(), // Will be updated by a separate process
                nonce: 0,                 // Will be updated by a separate process
                code: None,               // Will be updated for contracts
                is_contract,
            };
            
            diesel::insert_into(accounts_dsl::accounts)
                .values(&new_account)
                .execute(conn)?;
        }
        
        Ok(())
    }
    
    /// Get contract bytecode
    fn get_contract_bytecode(conn: &PgConnection, address: &str) -> Result<String> {
        // In a real implementation, you would fetch this from the blockchain
        // For now, we'll return a placeholder
        Ok("0x".to_string())
    }
}
