use anyhow::Result;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::db::{get_connection, DbPool};
use crate::schema::accounts::dsl as accounts_dsl;
use crate::schema::blocks::dsl as blocks_dsl;
use crate::schema::contracts::dsl as contracts_dsl;
use crate::schema::transactions::dsl as transactions_dsl;
use crate::schema::wasm_contracts::dsl as wasm_contracts_dsl;

#[derive(Debug, Serialize, Deserialize)]
pub struct BlockchainStats {
    pub latest_block_number: i64,
    pub latest_block_hash: String,
    pub latest_block_timestamp: chrono::NaiveDateTime,
    pub total_blocks: i64,
    pub total_transactions: i64,
    pub total_accounts: i64,
    pub total_contracts: i64,
    pub total_evm_contracts: i64,
    pub total_wasm_contracts: i64,
    pub avg_block_time: f64,
    pub avg_transactions_per_block: f64,
}

/// Get blockchain statistics
pub async fn get_blockchain_stats(pool: &DbPool) -> Result<BlockchainStats> {
    let conn = get_connection(pool)?;
    
    let stats = tokio::task::spawn_blocking(move || {
        // Get latest block
        let (latest_block_number, latest_block_hash, latest_block_timestamp) = blocks_dsl::blocks
            .order_by(blocks_dsl::number.desc())
            .select((blocks_dsl::number, blocks_dsl::hash, blocks_dsl::timestamp))
            .first::<(i64, String, chrono::NaiveDateTime)>(&conn)?;
        
        // Get total blocks
        let total_blocks = blocks_dsl::blocks.count().get_result::<i64>(&conn)?;
        
        // Get total transactions
        let total_transactions = transactions_dsl::transactions.count().get_result::<i64>(&conn)?;
        
        // Get total accounts
        let total_accounts = accounts_dsl::accounts.count().get_result::<i64>(&conn)?;
        
        // Get total EVM contracts
        let total_evm_contracts = contracts_dsl::contracts.count().get_result::<i64>(&conn)?;
        
        // Get total WASM contracts
        let total_wasm_contracts = wasm_contracts_dsl::wasm_contracts.count().get_result::<i64>(&conn)?;
        
        // Calculate average block time (last 100 blocks)
        let blocks = blocks_dsl::blocks
            .order_by(blocks_dsl::number.desc())
            .select(blocks_dsl::timestamp)
            .limit(100)
            .load::<chrono::NaiveDateTime>(&conn)?;
        
        let avg_block_time = if blocks.len() >= 2 {
            let mut total_time = 0.0;
            let mut count = 0;
            
            for i in 0..blocks.len() - 1 {
                let time_diff = (blocks[i] - blocks[i + 1]).num_milliseconds() as f64 / 1000.0;
                total_time += time_diff;
                count += 1;
            }
            
            if count > 0 {
                total_time / count as f64
            } else {
                0.0
            }
        } else {
            0.0
        };
        
        // Calculate average transactions per block (last 100 blocks)
        let avg_transactions_per_block = if total_blocks > 0 {
            total_transactions as f64 / total_blocks as f64
        } else {
            0.0
        };
        
        Ok::<_, diesel::result::Error>(BlockchainStats {
            latest_block_number,
            latest_block_hash,
            latest_block_timestamp,
            total_blocks,
            total_transactions,
            total_accounts,
            total_contracts: total_evm_contracts + total_wasm_contracts,
            total_evm_contracts,
            total_wasm_contracts,
            avg_block_time,
            avg_transactions_per_block,
        })
    })
    .await??;
    
    Ok(stats)
}

/// Get daily transaction counts for the last N days
pub async fn get_daily_transaction_stats(pool: &DbPool, days: i64) -> Result<Vec<(String, i64)>> {
    let conn = get_connection(pool)?;
    
    let stats = tokio::task::spawn_blocking(move || {
        // Calculate the date range
        let now = chrono::Utc::now().naive_utc();
        let start_date = now - chrono::Duration::days(days);
        
        // Query for daily transaction counts
        let results = diesel::sql_query(format!(
            "SELECT 
                date_trunc('day', created_at) as day, 
                COUNT(*) as count 
             FROM transactions 
             WHERE created_at >= '{}' 
             GROUP BY day 
             ORDER BY day",
            start_date
        ))
        .load::<(chrono::NaiveDateTime, i64)>(&conn)?;
        
        // Format the results
        let formatted_results = results
            .into_iter()
            .map(|(day, count)| (day.format("%Y-%m-%d").to_string(), count))
            .collect::<Vec<_>>();
        
        Ok::<_, diesel::result::Error>(formatted_results)
    })
    .await??;
    
    Ok(stats)
}
