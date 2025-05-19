use anyhow::Result;
use diesel::prelude::*;
use ethers::prelude::*;
use std::sync::Arc;

use crate::db::{get_connection, DbPool};
use crate::models::account::Account;
use crate::schema::accounts::dsl as accounts_dsl;

/// Get account details by address
pub async fn get_account_by_address(pool: &DbPool, address: &str) -> Result<Option<Account>> {
    let conn = get_connection(pool)?;
    let address = address.to_lowercase();
    
    let account = tokio::task::spawn_blocking(move || {
        accounts_dsl::accounts
            .filter(accounts_dsl::address.eq(address))
            .first::<Account>(&conn)
            .optional()
    })
    .await??;
    
    Ok(account)
}

/// Update account balance
pub async fn update_account_balance(
    pool: &DbPool,
    address: &str,
    provider: &Provider<Http>,
) -> Result<()> {
    let conn = get_connection(pool)?;
    let address_str = address.to_lowercase();
    
    // Convert address string to ethers Address
    let address_bytes = address_str.strip_prefix("0x").unwrap_or(&address_str);
    let address = Address::from_slice(&hex::decode(address_bytes)?);
    
    // Get balance from provider
    let balance = provider.get_balance(address, None).await?;
    
    // Update in database
    tokio::task::spawn_blocking(move || {
        diesel::update(accounts_dsl::accounts.filter(accounts_dsl::address.eq(address_str)))
            .set(accounts_dsl::balance.eq(balance.to_string()))
            .execute(&conn)
    })
    .await??;
    
    Ok(())
}

/// Update account nonce
pub async fn update_account_nonce(
    pool: &DbPool,
    address: &str,
    provider: &Provider<Http>,
) -> Result<()> {
    let conn = get_connection(pool)?;
    let address_str = address.to_lowercase();
    
    // Convert address string to ethers Address
    let address_bytes = address_str.strip_prefix("0x").unwrap_or(&address_str);
    let address = Address::from_slice(&hex::decode(address_bytes)?);
    
    // Get nonce from provider
    let nonce = provider.get_transaction_count(address, None).await?;
    
    // Update in database
    tokio::task::spawn_blocking(move || {
        diesel::update(accounts_dsl::accounts.filter(accounts_dsl::address.eq(address_str)))
            .set(accounts_dsl::nonce.eq(nonce.as_u64() as i32))
            .execute(&conn)
    })
    .await??;
    
    Ok(())
}

/// Update account code
pub async fn update_account_code(
    pool: &DbPool,
    address: &str,
    provider: &Provider<Http>,
) -> Result<()> {
    let conn = get_connection(pool)?;
    let address_str = address.to_lowercase();
    
    // Convert address string to ethers Address
    let address_bytes = address_str.strip_prefix("0x").unwrap_or(&address_str);
    let address = Address::from_slice(&hex::decode(address_bytes)?);
    
    // Get code from provider
    let code = provider.get_code(address, None).await?;
    let code_str = if code.is_empty() {
        None
    } else {
        Some(format!("0x{}", hex::encode(code)))
    };
    
    // Update in database
    tokio::task::spawn_blocking(move || {
        diesel::update(accounts_dsl::accounts.filter(accounts_dsl::address.eq(address_str)))
            .set((
                accounts_dsl::code.eq(code_str),
                accounts_dsl::is_contract.eq(code_str.is_some()),
            ))
            .execute(&conn)
    })
    .await??;
    
    Ok(())
}
