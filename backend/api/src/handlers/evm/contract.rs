use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use models::evm::{ContractType, EvmContract};
use std::sync::Arc;

use crate::{
    AppState,
    handlers::{ApiResponse, PaginationQuery},
};

pub async fn get_all_contracts(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<EvmContract>>>, StatusCode> {
    let contract_service = state.db.contracts();

    match contract_service
        .get_all(pagination.limit, pagination.offset)
        .await
    {
        Ok(contracts) => Ok(Json(ApiResponse::success(contracts))),
        Err(e) => {
            eprintln!("Error fetching contracts: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_contract_by_address(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
) -> Result<Json<ApiResponse<Option<EvmContract>>>, StatusCode> {
    let contract_service = state.db.contracts();

    match contract_service.get_by_address(&address).await {
        Ok(contract) => Ok(Json(ApiResponse::success(contract))),
        Err(e) => {
            eprintln!("Error fetching contract by address: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_contracts_by_type(
    State(state): State<Arc<AppState>>,
    Path(contract_type): Path<String>,
) -> Result<Json<ApiResponse<Vec<EvmContract>>>, StatusCode> {
    let contract_service = state.db.contracts();

    // Parse the contract type from string - adjust based on your ContractType enum variants
    let parsed_contract_type = match contract_type.to_lowercase().as_str() {
        "erc20" => ContractType::ERC20,
        "erc721" => ContractType::ERC721,
        "erc1155" => ContractType::ERC1155,
        "dex" => ContractType::DEX,
        "lending" | "lendingprotocol" => ContractType::LendingProtocol,
        "proxy" => ContractType::Proxy,
        "oracle" => ContractType::Oracle,
        "unknown" => ContractType::Unknown,
        _ => {
            eprintln!("Invalid contract type: {}", contract_type);
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    match contract_service.get_by_type(&parsed_contract_type).await {
        Ok(contracts) => Ok(Json(ApiResponse::success(contracts))),
        Err(e) => {
            eprintln!("Error fetching contracts by type: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_verified_contracts(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Vec<EvmContract>>>, StatusCode> {
    let contract_service = state.db.contracts();

    match contract_service.get_verified_contracts().await {
        Ok(contracts) => Ok(Json(ApiResponse::success(contracts))),
        Err(e) => {
            eprintln!("Error fetching verified contracts: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
