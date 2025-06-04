use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use models::evm::EvmTransaction;
use std::sync::Arc;

use super::{ApiResponse, PaginationQuery};
use crate::AppState;

pub async fn get_all_transactions(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<EvmTransaction>>>, StatusCode> {
    let transaction_service = state.db.transactions();

    match transaction_service
        .get_all(pagination.limit, pagination.offset)
        .await
    {
        Ok(transactions) => Ok(Json(ApiResponse::success(transactions))),
        Err(e) => {
            eprintln!("Error fetching transactions: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_latest_transaction(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Option<EvmTransaction>>>, StatusCode> {
    let transaction_service = state.db.transactions();

    match transaction_service.get_latest().await {
        Ok(transaction) => Ok(Json(ApiResponse::success(transaction))),
        Err(e) => {
            eprintln!("Error fetching latest transaction: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_transaction_by_hash(
    State(state): State<Arc<AppState>>,
    Path(tx_hash): Path<String>,
) -> Result<Json<ApiResponse<Option<EvmTransaction>>>, StatusCode> {
    let transaction_service = state.db.transactions();

    match transaction_service.get_by_hash(&tx_hash).await {
        Ok(transaction) => Ok(Json(ApiResponse::success(transaction))),
        Err(e) => {
            eprintln!("Error fetching transaction by hash: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_transactions_by_block_number(
    State(state): State<Arc<AppState>>,
    Path(block_number): Path<u32>,
) -> Result<Json<ApiResponse<Vec<EvmTransaction>>>, StatusCode> {
    let transaction_service = state.db.transactions();

    match transaction_service
        .get_all_with_block_number(block_number)
        .await
    {
        Ok(transactions) => Ok(Json(ApiResponse::success(transactions))),
        Err(e) => {
            eprintln!("Error fetching transactions by block number: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
