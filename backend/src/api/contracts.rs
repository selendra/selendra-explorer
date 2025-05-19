use actix_web::{get, post, web, HttpResponse, Responder};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::db::{get_connection, DbPool};
use crate::models::contract::{Contract, ContractResponse};
use crate::models::wasm_contract::{WasmContract, WasmContractResponse};
use crate::schema::contracts::dsl as evm_contracts_dsl;
use crate::schema::wasm_contracts::dsl as wasm_contracts_dsl;
use crate::services::contract as contract_service;

#[derive(Debug, Deserialize)]
pub struct ContractsQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub contract_type: Option<String>,
    pub verified: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct ContractsResponse {
    pub contracts: Vec<ContractResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[get("/contracts")]
async fn get_contracts(
    pool: web::Data<DbPool>,
    query: web::Query<ContractsQueryParams>,
) -> impl Responder {
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;
    let contract_type = query.contract_type.clone();
    let verified = query.verified;

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let contracts_result = web::block(move || {
        let mut total = 0;
        let mut contracts = Vec::new();

        // If contract_type is specified, filter by it
        match contract_type.as_deref() {
            Some("evm") => {
                // Get EVM contracts
                let mut query = evm_contracts_dsl::contracts.into_boxed();

                if let Some(verified_val) = verified {
                    query = query.filter(evm_contracts_dsl::verified.eq(verified_val));
                }

                total = query.clone().count().get_result::<i64>(&mut conn)?;

                let evm_contracts: Vec<Contract> = query
                    .order(evm_contracts_dsl::created_at.desc())
                    .limit(page_size)
                    .offset(offset)
                    .load(&mut conn)?;

                for contract in evm_contracts {
                    contracts.push(ContractResponse::from_evm_contract(contract));
                }
            }
            Some("wasm") => {
                // Get WASM contracts
                let mut query = wasm_contracts_dsl::wasm_contracts.into_boxed();

                if let Some(verified_val) = verified {
                    query = query.filter(wasm_contracts_dsl::verified.eq(verified_val));
                }

                total = query.clone().count().get_result::<i64>(&mut conn)?;

                let wasm_contracts: Vec<WasmContract> = query
                    .order(wasm_contracts_dsl::created_at.desc())
                    .limit(page_size)
                    .offset(offset)
                    .load(&mut conn)?;

                for contract in wasm_contracts {
                    contracts.push(ContractResponse::from_wasm_contract(contract));
                }
            }
            _ => {
                // Get both EVM and WASM contracts
                // This is a bit more complex as we need to combine results from two tables

                // Get EVM contracts count
                let mut evm_query = evm_contracts_dsl::contracts.into_boxed();
                if let Some(verified_val) = verified {
                    evm_query = evm_query.filter(evm_contracts_dsl::verified.eq(verified_val));
                }
                let evm_count = evm_query.clone().count().get_result::<i64>(&mut conn)?;

                // Get WASM contracts count
                let mut wasm_query = wasm_contracts_dsl::wasm_contracts.into_boxed();
                if let Some(verified_val) = verified {
                    wasm_query = wasm_query.filter(wasm_contracts_dsl::verified.eq(verified_val));
                }
                let wasm_count = wasm_query.clone().count().get_result::<i64>(&mut conn)?;

                total = evm_count + wasm_count;

                // For simplicity, we'll get half from each type
                let half_page_size = page_size / 2;
                let remainder = page_size % 2;

                // Get EVM contracts
                let evm_contracts: Vec<Contract> = evm_query
                    .order(evm_contracts_dsl::created_at.desc())
                    .limit(half_page_size + remainder)
                    .offset(offset / 2)
                    .load(&mut conn)?;

                for contract in evm_contracts {
                    contracts.push(ContractResponse::from_evm_contract(contract));
                }

                // Get WASM contracts
                let wasm_contracts: Vec<WasmContract> = wasm_query
                    .order(wasm_contracts_dsl::created_at.desc())
                    .limit(half_page_size)
                    .offset(offset / 2)
                    .load(&mut conn)?;

                for contract in wasm_contracts {
                    contracts.push(ContractResponse::from_wasm_contract(contract));
                }

                // Sort combined results by created_at
                contracts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
            }
        }

        Ok::<_, diesel::result::Error>((contracts, total))
    })
    .await;

    match contracts_result {
        Ok(Ok((contracts, total))) => HttpResponse::Ok().json(ContractsResponse {
            contracts,
            total,
            page,
            page_size,
        }),
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_contracts: {:?}", db_err);
            HttpResponse::InternalServerError()
                .json(format!("Error fetching contracts: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_contracts: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[get("/contracts/{address}")]
async fn get_contract_by_address(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
) -> impl Responder {
    let address = path.into_inner().to_lowercase();

    // Try to get the contract from the service
    match contract_service::get_contract_by_address(&pool, &address).await {
        Ok(Some(contract)) => HttpResponse::Ok().json(contract),
        Ok(None) => HttpResponse::NotFound().json("Contract not found"),
        Err(e) => {
            eprintln!("Error in get_contract_by_address: {:?}", e);
            HttpResponse::InternalServerError().json(format!("Error fetching contract: {:?}", e))
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct VerifyEvmContractRequest {
    pub source_code: String,
    pub compiler_version: String,
    pub optimization_used: bool,
    pub runs: i32,
    pub contract_name: String,
    pub license_type: String,
}

#[post("/contracts/{address}/verify/evm")]
async fn verify_evm_contract(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
    data: web::Json<VerifyEvmContractRequest>,
) -> impl Responder {
    let address = path.into_inner().to_lowercase();
    let data = data.into_inner();

    // Check if the contract exists
    let contract = match contract_service::get_evm_contract_by_address(&pool, &address).await {
        Ok(Some(contract)) => contract,
        Ok(None) => return HttpResponse::NotFound().json("Contract not found"),
        Err(e) => {
            eprintln!("Error in verify_evm_contract: {:?}", e);
            return HttpResponse::InternalServerError()
                .json(format!("Error fetching contract: {:?}", e));
        }
    };

    // If already verified, return error
    if contract.verified {
        return HttpResponse::BadRequest().json("Contract is already verified");
    }

    // Verify the contract
    match contract_service::verify_evm_contract(
        &pool,
        &address,
        &data.source_code,
        &data.compiler_version,
        data.optimization_used,
        data.runs,
        &data.contract_name,
        "[]", // Empty ABI for now
        &data.license_type,
    )
    .await
    {
        Ok(true) => HttpResponse::Ok().json("Contract verified successfully"),
        Ok(false) => HttpResponse::BadRequest().json("Contract verification failed"),
        Err(e) => {
            eprintln!("Error in verify_evm_contract: {:?}", e);
            HttpResponse::InternalServerError().json(format!("Error verifying contract: {:?}", e))
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct VerifyWasmContractRequest {
    pub metadata: JsonValue,
}

#[post("/contracts/{address}/verify/wasm")]
async fn verify_wasm_contract(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
    data: web::Json<VerifyWasmContractRequest>,
) -> impl Responder {
    let address = path.into_inner();
    let data = data.into_inner();

    // Check if the contract exists
    let contract = match contract_service::get_wasm_contract_by_address(&pool, &address).await {
        Ok(Some(contract)) => contract,
        Ok(None) => return HttpResponse::NotFound().json("Contract not found"),
        Err(e) => {
            eprintln!("Error in verify_wasm_contract: {:?}", e);
            return HttpResponse::InternalServerError()
                .json(format!("Error fetching contract: {:?}", e));
        }
    };

    // If already verified, return error
    if contract.verified {
        return HttpResponse::BadRequest().json("Contract is already verified");
    }

    // Verify the contract
    match contract_service::verify_wasm_contract(&pool, &address, data.metadata).await {
        Ok(true) => HttpResponse::Ok().json("Contract verified successfully"),
        Ok(false) => HttpResponse::BadRequest().json("Contract verification failed"),
        Err(e) => {
            eprintln!("Error in verify_wasm_contract: {:?}", e);
            HttpResponse::InternalServerError().json(format!("Error verifying contract: {:?}", e))
        }
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_contracts)
        .service(get_contract_by_address)
        .service(verify_evm_contract)
        .service(verify_wasm_contract);
}
