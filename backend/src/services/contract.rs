use anyhow::Result;
use diesel::prelude::*;
use std::sync::Arc;

use crate::db::{get_connection, DbPool};
use crate::models::contract::{Contract, ContractResponse};
use crate::models::wasm_contract::{WasmContract, WasmContractResponse};
use crate::schema::contracts::dsl as contracts_dsl;
use crate::schema::wasm_contracts::dsl as wasm_contracts_dsl;

/// Get EVM contract by address
pub async fn get_evm_contract_by_address(pool: &DbPool, address: &str) -> Result<Option<Contract>> {
    let conn = get_connection(pool)?;
    let address = address.to_lowercase();
    
    let contract = tokio::task::spawn_blocking(move || {
        contracts_dsl::contracts
            .filter(contracts_dsl::address.eq(address))
            .first::<Contract>(&conn)
            .optional()
    })
    .await??;
    
    Ok(contract)
}

/// Get WASM contract by address
pub async fn get_wasm_contract_by_address(pool: &DbPool, address: &str) -> Result<Option<WasmContract>> {
    let conn = get_connection(pool)?;
    
    let contract = tokio::task::spawn_blocking(move || {
        wasm_contracts_dsl::wasm_contracts
            .filter(wasm_contracts_dsl::address.eq(address))
            .first::<WasmContract>(&conn)
            .optional()
    })
    .await??;
    
    Ok(contract)
}

/// Get contract by address (either EVM or WASM)
pub async fn get_contract_by_address(pool: &DbPool, address: &str) -> Result<Option<ContractResponse>> {
    // Try EVM contract first
    if let Some(contract) = get_evm_contract_by_address(pool, address).await? {
        return Ok(Some(ContractResponse::from_evm_contract(contract)));
    }
    
    // Try WASM contract
    if let Some(contract) = get_wasm_contract_by_address(pool, address).await? {
        return Ok(Some(ContractResponse::from_wasm_contract(contract)));
    }
    
    Ok(None)
}

/// Verify EVM contract
pub async fn verify_evm_contract(
    pool: &DbPool,
    address: &str,
    source_code: &str,
    compiler_version: &str,
    optimization_used: bool,
    runs: i32,
    contract_name: &str,
    abi: &str,
    license_type: &str,
) -> Result<bool> {
    // In a real implementation, you would compile the source code and verify it matches the on-chain bytecode
    // For now, we'll just update the contract record
    
    let conn = get_connection(pool)?;
    let address = address.to_lowercase();
    let now = chrono::Utc::now().naive_utc();
    
    tokio::task::spawn_blocking(move || {
        diesel::update(contracts_dsl::contracts.filter(contracts_dsl::address.eq(address)))
            .set((
                contracts_dsl::name.eq(contract_name),
                contracts_dsl::compiler_version.eq(compiler_version),
                contracts_dsl::optimization_used.eq(optimization_used),
                contracts_dsl::runs.eq(runs),
                contracts_dsl::abi.eq(abi),
                contracts_dsl::verified.eq(true),
                contracts_dsl::verification_date.eq(now),
                contracts_dsl::license_type.eq(license_type),
                contracts_dsl::updated_at.eq(now),
            ))
            .execute(&conn)
    })
    .await??;
    
    Ok(true)
}

/// Verify WASM contract
pub async fn verify_wasm_contract(
    pool: &DbPool,
    address: &str,
    metadata: serde_json::Value,
) -> Result<bool> {
    // In a real implementation, you would verify the metadata matches the on-chain contract
    // For now, we'll just update the contract record
    
    let conn = get_connection(pool)?;
    let now = chrono::Utc::now().naive_utc();
    
    tokio::task::spawn_blocking(move || {
        diesel::update(wasm_contracts_dsl::wasm_contracts.filter(wasm_contracts_dsl::address.eq(address)))
            .set((
                wasm_contracts_dsl::metadata.eq(metadata),
                wasm_contracts_dsl::verified.eq(true),
                wasm_contracts_dsl::verification_date.eq(now),
                wasm_contracts_dsl::updated_at.eq(now),
            ))
            .execute(&conn)
    })
    .await??;
    
    Ok(true)
}
