use std::sync::Arc;
use axum::{extract::{Path, Query, State}, http::StatusCode, Json};
use models::evm::EvmAccountInfo;
use serde::Deserialize;

use crate::{routes::{ApiResponse, PaginationQuery}, AppState};

#[derive(Debug, Deserialize)]
pub struct BalanceRangeQuery {
    #[serde(default = "default_min_balance")]
    pub min_balance: u128,
    #[serde(default = "default_max_balance")]
    pub max_balance: u128,
    #[serde(default = "default_limit")]
    pub limit: u32,
}

fn default_limit() -> u32 {
    20
}

fn default_min_balance() -> u128 {
    0
}

fn default_max_balance() -> u128 {
    u128::MAX
}

// Account API handlers
pub async fn get_account_by_address(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
) -> Result<Json<ApiResponse<Option<EvmAccountInfo>>>, StatusCode> {
    let account_service = state.db.accounts();
    
    match account_service.get_by_address(&address).await {
        Ok(account) => Ok(Json(ApiResponse::success(account))),
        Err(e) => {
            eprintln!("Error fetching account by address: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_all_accounts(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<EvmAccountInfo>>>, StatusCode> {
    let account_service = state.db.accounts(); // Assuming you have this method
    
    match account_service.get_all(pagination.limit, pagination.offset).await {
        Ok(accounts) => Ok(Json(ApiResponse::success(accounts))),
        Err(e) => {
            eprintln!("Error fetching accounts: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_accounts_by_balance_range(
    State(state): State<Arc<AppState>>,
    Query(balance_query): Query<BalanceRangeQuery>,
) -> Result<Json<ApiResponse<Vec<EvmAccountInfo>>>, StatusCode> {
    let account_service = state.db.accounts();
    
    match account_service.get_accounts_by_balance_range(
        balance_query.min_balance,
        balance_query.max_balance,
        balance_query.limit,
    ).await {
        Ok(accounts) => Ok(Json(ApiResponse::success(accounts))),
        Err(e) => {
            eprintln!("Error fetching accounts by balance range: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}