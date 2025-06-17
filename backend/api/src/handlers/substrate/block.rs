use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use models::substrate::{SubstrateBlock, SubstrateBlockRes};
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
) -> Result<Json<ApiResponse<Option<SubstrateBlockRes>>>, StatusCode> {
    let block_service = state.db.substrate_blocks();
    let extrinsic_service = state.db.substrate_extrinsics();
    let event_service = state.db.substrate_events();

    match block_service.get_by_number(block_number).await {
        Ok(Some(block)) => {
            // Get counts for extrinsics and events
            let extrinsics_count = extrinsic_service
                .count_by_block_number(block_number)
                .await
                .unwrap_or(0) as usize;

            let events_count = event_service
                .count_by_block_number(block_number)
                .await
                .unwrap_or(0) as usize;

            let block_res = SubstrateBlockRes {
                number: block.number,
                timestamp: block.timestamp,
                is_finalize: block.is_finalize,
                hash: block.hash,
                parent_hash: block.parent_hash,
                state_root: block.state_root,
                extrinsics_root: block.extrinsics_root,
                extrinscs_len: extrinsics_count,
                event_len: events_count,
            };

            Ok(Json(ApiResponse::success(Some(block_res))))
        }
        Ok(None) => Ok(Json(ApiResponse::success(None))),
        Err(e) => {
            eprintln!("Error fetching substrate block by number: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_latest_substrate_block(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Option<SubstrateBlockRes>>>, StatusCode> {
    let block_service = state.db.substrate_blocks();
    let extrinsic_service = state.db.substrate_extrinsics();
    let event_service = state.db.substrate_events();

    match block_service.get_latest().await {
        Ok(Some(block)) => {
            // Get counts for extrinsics and events
            let extrinsics_count = extrinsic_service
                .count_by_block_number(block.number)
                .await
                .unwrap_or(0) as usize;

            let events_count = event_service
                .count_by_block_number(block.number)
                .await
                .unwrap_or(0) as usize;

            let block_res = SubstrateBlockRes {
                number: block.number,
                timestamp: block.timestamp,
                is_finalize: block.is_finalize,
                hash: block.hash,
                parent_hash: block.parent_hash,
                state_root: block.state_root,
                extrinsics_root: block.extrinsics_root,
                extrinscs_len: extrinsics_count,
                event_len: events_count,
            };

            Ok(Json(ApiResponse::success(Some(block_res))))
        }
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
) -> Result<Json<ApiResponse<Option<SubstrateBlockRes>>>, StatusCode> {
    let block_service = state.db.substrate_blocks();
    let extrinsic_service = state.db.substrate_extrinsics();
    let event_service = state.db.substrate_events();

    match block_service.get_by_hash(&block_hash).await {
        Ok(Some(block)) => {
            // Get counts for extrinsics and events
            let extrinsics_count = extrinsic_service
                .count_by_block_number(block.number)
                .await
                .unwrap_or(0) as usize;

            let events_count = event_service
                .count_by_block_number(block.number)
                .await
                .unwrap_or(0) as usize;

            let block_res = SubstrateBlockRes {
                number: block.number,
                timestamp: block.timestamp,
                is_finalize: block.is_finalize,
                hash: block.hash,
                parent_hash: block.parent_hash,
                state_root: block.state_root,
                extrinsics_root: block.extrinsics_root,
                extrinscs_len: extrinsics_count,
                event_len: events_count,
            };

            Ok(Json(ApiResponse::success(Some(block_res))))
        }
        Ok(None) => Ok(Json(ApiResponse::success(None))),
        Err(e) => {
            eprintln!("Error fetching substrate block by hash: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
