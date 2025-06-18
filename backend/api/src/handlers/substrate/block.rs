use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use models::substrate::SubstrateBlock;
use std::sync::Arc;

use crate::{
    AppState,
    handlers::{ApiResponse, PaginationQuery},
};

// Substrate Block API Handlers
pub async fn get_all_substrate_blocks(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateBlock>>>, StatusCode> {
    let block_service = state.db.substrate_blocks();

    match block_service
        .get_all(pagination.limit, pagination.offset)
        .await
    {
        Ok(blocks) => Ok(Json(ApiResponse::success(blocks))),
        Err(e) => {
            eprintln!("Error fetching substrate blocks: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_block_by_number(
    State(state): State<Arc<AppState>>,
    Path(block_number): Path<u32>,
) -> Result<Json<ApiResponse<Option<SubstrateBlock>>>, StatusCode> {
    let block_service = state.db.substrate_blocks();

    match block_service.get_by_number(block_number).await {
        Ok(Some(block)) => Ok(Json(ApiResponse::success(Some(block)))),
        Ok(None) => Ok(Json(ApiResponse::success(None))),
        Err(e) => {
            eprintln!("Error fetching substrate block by number: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_latest_substrate_block(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Option<SubstrateBlock>>>, StatusCode> {
    let block_service = state.db.substrate_blocks();

    match block_service.get_latest().await {
        Ok(Some(block)) => Ok(Json(ApiResponse::success(Some(block)))),
        Ok(None) => Ok(Json(ApiResponse::success(None))),
        Err(e) => {
            eprintln!("Error fetching latest substrate block: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_block_by_hash(
    State(state): State<Arc<AppState>>,
    Path(block_hash): Path<String>,
) -> Result<Json<ApiResponse<Option<SubstrateBlock>>>, StatusCode> {
    let block_service = state.db.substrate_blocks();

    match block_service.get_by_hash(&block_hash).await {
        Ok(Some(block)) => Ok(Json(ApiResponse::success(Some(block)))),
        Ok(None) => Ok(Json(ApiResponse::success(None))),
        Err(e) => {
            eprintln!("Error fetching substrate block by hash: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
