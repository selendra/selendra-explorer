use anyhow::Result;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::db::{get_connection, DbPool};
use crate::schema::accounts::dsl as accounts_dsl;
use crate::schema::blocks::dsl as blocks_dsl;
use crate::schema::contracts::dsl as contracts_dsl;
use crate::schema::extrinsics::dsl as extrinsics_dsl;
use crate::schema::tokens::dsl as tokens_dsl;
use crate::schema::transactions::dsl as transactions_dsl;
use crate::schema::wasm_contracts::dsl as wasm_contracts_dsl;

#[derive(Debug, Serialize, Deserialize)]
pub enum SearchResultType {
    Block,
    Transaction,
    Account,
    EvmContract,
    WasmContract,
    Token,
    Extrinsic,
    Unknown,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub result_type: SearchResultType,
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
}

/// Search for blockchain entities by query
pub async fn search(pool: &DbPool, query: &str) -> Result<Vec<SearchResult>> {
    let conn = get_connection(pool)?;
    let query = query.trim();
    
    // If the query is a number, search for blocks
    if let Ok(block_number) = query.parse::<i64>() {
        return search_by_block_number(pool, block_number).await;
    }
    
    // If the query looks like a hash, search for blocks, transactions, and extrinsics
    if query.starts_with("0x") && query.len() >= 10 {
        return search_by_hash(pool, query).await;
    }
    
    // If the query looks like an address, search for accounts, contracts, and tokens
    if (query.starts_with("0x") && query.len() == 42) || query.len() >= 40 {
        return search_by_address(pool, query).await;
    }
    
    // Otherwise, search by name or other fields
    search_by_name(pool, query).await
}

/// Search by block number
async fn search_by_block_number(pool: &DbPool, block_number: i64) -> Result<Vec<SearchResult>> {
    let conn = get_connection(pool)?;
    
    let results = tokio::task::spawn_blocking(move || {
        let mut search_results = Vec::new();
        
        // Search for blocks
        let blocks = blocks_dsl::blocks
            .filter(blocks_dsl::number.eq(block_number))
            .limit(5)
            .load::<(String, i64, chrono::NaiveDateTime)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (hash, number, timestamp) in blocks {
            search_results.push(SearchResult {
                result_type: SearchResultType::Block,
                id: hash,
                name: Some(format!("Block #{}", number)),
                description: Some(format!("Timestamp: {}", timestamp)),
            });
        }
        
        Ok::<_, diesel::result::Error>(search_results)
    })
    .await??;
    
    Ok(results)
}

/// Search by hash
async fn search_by_hash(pool: &DbPool, hash: &str) -> Result<Vec<SearchResult>> {
    let conn = get_connection(pool)?;
    let hash = hash.to_lowercase();
    
    let results = tokio::task::spawn_blocking(move || {
        let mut search_results = Vec::new();
        
        // Search for blocks
        let blocks = blocks_dsl::blocks
            .filter(blocks_dsl::hash.eq(&hash))
            .select((blocks_dsl::hash, blocks_dsl::number, blocks_dsl::timestamp))
            .limit(1)
            .load::<(String, i64, chrono::NaiveDateTime)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (hash, number, timestamp) in blocks {
            search_results.push(SearchResult {
                result_type: SearchResultType::Block,
                id: hash,
                name: Some(format!("Block #{}", number)),
                description: Some(format!("Timestamp: {}", timestamp)),
            });
        }
        
        // Search for transactions
        let transactions = transactions_dsl::transactions
            .filter(transactions_dsl::hash.eq(&hash))
            .select((
                transactions_dsl::hash,
                transactions_dsl::from_address,
                transactions_dsl::to_address,
            ))
            .limit(1)
            .load::<(String, String, Option<String>)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (hash, from, to) in transactions {
            search_results.push(SearchResult {
                result_type: SearchResultType::Transaction,
                id: hash,
                name: Some("Transaction".to_string()),
                description: Some(format!("From: {} To: {}", from, to.unwrap_or_else(|| "Contract Creation".to_string()))),
            });
        }
        
        // Search for extrinsics
        let extrinsics = extrinsics_dsl::extrinsics
            .filter(extrinsics_dsl::hash.eq(&hash))
            .select((
                extrinsics_dsl::hash,
                extrinsics_dsl::section,
                extrinsics_dsl::method,
            ))
            .limit(1)
            .load::<(String, String, String)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (hash, section, method) in extrinsics {
            search_results.push(SearchResult {
                result_type: SearchResultType::Extrinsic,
                id: hash,
                name: Some(format!("Extrinsic: {}.{}", section, method)),
                description: None,
            });
        }
        
        Ok::<_, diesel::result::Error>(search_results)
    })
    .await??;
    
    Ok(results)
}

/// Search by address
async fn search_by_address(pool: &DbPool, address: &str) -> Result<Vec<SearchResult>> {
    let conn = get_connection(pool)?;
    let address = address.to_lowercase();
    
    let results = tokio::task::spawn_blocking(move || {
        let mut search_results = Vec::new();
        
        // Search for accounts
        let accounts = accounts_dsl::accounts
            .filter(accounts_dsl::address.eq(&address))
            .select((accounts_dsl::address, accounts_dsl::balance, accounts_dsl::is_contract))
            .limit(1)
            .load::<(String, String, bool)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (address, balance, is_contract) in accounts {
            search_results.push(SearchResult {
                result_type: SearchResultType::Account,
                id: address,
                name: Some("Account".to_string()),
                description: Some(format!("Balance: {} | Contract: {}", balance, is_contract)),
            });
        }
        
        // Search for EVM contracts
        let contracts = contracts_dsl::contracts
            .filter(contracts_dsl::address.eq(&address))
            .select((contracts_dsl::address, contracts_dsl::name))
            .limit(1)
            .load::<(String, Option<String>)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (address, name) in contracts {
            search_results.push(SearchResult {
                result_type: SearchResultType::EvmContract,
                id: address,
                name: name.or_else(|| Some("EVM Contract".to_string())),
                description: None,
            });
        }
        
        // Search for WASM contracts
        let wasm_contracts = wasm_contracts_dsl::wasm_contracts
            .filter(wasm_contracts_dsl::address.eq(&address))
            .select((wasm_contracts_dsl::address, wasm_contracts_dsl::contract_type))
            .limit(1)
            .load::<(String, String)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (address, contract_type) in wasm_contracts {
            search_results.push(SearchResult {
                result_type: SearchResultType::WasmContract,
                id: address,
                name: Some(format!("{} Contract", contract_type)),
                description: None,
            });
        }
        
        // Search for tokens
        let tokens = tokens_dsl::tokens
            .filter(tokens_dsl::address.eq(&address))
            .select((tokens_dsl::address, tokens_dsl::name, tokens_dsl::symbol))
            .limit(1)
            .load::<(String, String, String)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (address, name, symbol) in tokens {
            search_results.push(SearchResult {
                result_type: SearchResultType::Token,
                id: address,
                name: Some(format!("{} ({})", name, symbol)),
                description: None,
            });
        }
        
        Ok::<_, diesel::result::Error>(search_results)
    })
    .await??;
    
    Ok(results)
}

/// Search by name
async fn search_by_name(pool: &DbPool, query: &str) -> Result<Vec<SearchResult>> {
    let conn = get_connection(pool)?;
    let query = format!("%{}%", query);
    
    let results = tokio::task::spawn_blocking(move || {
        let mut search_results = Vec::new();
        
        // Search for contracts by name
        let contracts = contracts_dsl::contracts
            .filter(contracts_dsl::name.like(&query))
            .select((contracts_dsl::address, contracts_dsl::name))
            .limit(5)
            .load::<(String, Option<String>)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (address, name) in contracts {
            search_results.push(SearchResult {
                result_type: SearchResultType::EvmContract,
                id: address,
                name: name.or_else(|| Some("EVM Contract".to_string())),
                description: None,
            });
        }
        
        // Search for tokens by name or symbol
        let tokens = tokens_dsl::tokens
            .filter(tokens_dsl::name.like(&query).or(tokens_dsl::symbol.like(&query)))
            .select((tokens_dsl::address, tokens_dsl::name, tokens_dsl::symbol))
            .limit(5)
            .load::<(String, String, String)>(&conn)
            .optional()?
            .unwrap_or_default();
        
        for (address, name, symbol) in tokens {
            search_results.push(SearchResult {
                result_type: SearchResultType::Token,
                id: address,
                name: Some(format!("{} ({})", name, symbol)),
                description: None,
            });
        }
        
        Ok::<_, diesel::result::Error>(search_results)
    })
    .await??;
    
    Ok(results)
}
