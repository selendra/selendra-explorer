use std::sync::Arc;
use axum::{extract::{Path, Query, State}, http::StatusCode, Json};
use models::evm::EvmBlock;

use crate::{routes::{ApiResponse, PaginationQuery}, AppState};

// Block API Handlers
pub async fn get_all_blocks(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<EvmBlock>>>, StatusCode> {
    let block_service = state.db.evm_blocks();
    
    match block_service.get_all(pagination.limit, pagination.offset).await {
        Ok(blocks) => Ok(Json(ApiResponse::success(blocks))),
        Err(e) => {
            eprintln!("Error fetching blocks: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_latest_block(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Option<EvmBlock>>>, StatusCode> {
    let block_service = state.db.evm_blocks();
    
    match block_service.get_latest().await {
        Ok(block) => Ok(Json(ApiResponse::success(block))),
        Err(e) => {
            eprintln!("Error fetching latest block: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_block_by_number(
    State(state): State<Arc<AppState>>,
    Path(block_number): Path<u32>,
) -> Result<Json<ApiResponse<Option<EvmBlock>>>, StatusCode> {
    let block_service = state.db.evm_blocks();
    
    match block_service.get_by_number(block_number).await {
        Ok(block) => Ok(Json(ApiResponse::success(block))),
        Err(e) => {
            eprintln!("Error fetching block by number: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_block_by_hash(
    State(state): State<Arc<AppState>>,
    Path(block_hash): Path<String>,
) -> Result<Json<ApiResponse<Option<EvmBlock>>>, StatusCode> {
    let block_service = state.db.evm_blocks();
    
    match block_service.get_by_hash(&block_hash).await {
        Ok(block) => Ok(Json(ApiResponse::success(block))),
        Err(e) => {
            eprintln!("Error fetching block by hash: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}