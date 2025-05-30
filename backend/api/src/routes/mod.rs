pub mod evm;

use std::sync::Arc;
use axum::{routing::get, Router};
use evm::{block::{get_all_blocks, get_block_by_hash, get_block_by_number, get_latest_block}, transaction::{get_all_transactions, get_latest_transaction, get_transaction_by_hash, get_transactions_by_block_number}};
use serde::{Deserialize, Serialize};
use crate::AppState;


#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    #[serde(default = "default_limit")]
    pub limit: u32,
    #[serde(default = "default_offset")]
    pub offset: u32,
}

fn default_limit() -> u32 {
    20
}

fn default_offset() -> u32 {
    0
}

// API Response wrapper
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}


pub fn create_api_routes() -> Router<Arc<AppState>> {
    Router::new()
        // block
        .route("/api/blocks", get(get_all_blocks))
        .route("/api/blocks/number/{block_number}", get(get_block_by_number))
        .route("/api/blocks/hash/{block_hash}", get(get_block_by_hash))
        .route("/api/blocks/latest", get(get_latest_block))
        // transaction
        .route("/api/transactions", get(get_all_transactions))
        .route("/api/transactions/latest", get(get_latest_transaction))
        .route("/api/transactions/block/{block_number}", get(get_transactions_by_block_number))
        .route("/api/transactions/hash/{tx_hash}", get(get_transaction_by_hash)
    )
}