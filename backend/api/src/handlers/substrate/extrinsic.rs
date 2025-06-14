use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use models::substrate::SubstrateExtrinsic;
use serde::Deserialize;
use std::sync::Arc;

use crate::handlers::evm::{ApiResponse, PaginationQuery};
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct ExtrinsicByModuleQuery {
    pub module: String,
    #[serde(default)]
    pub function: Option<String>,
    #[serde(default = "default_limit")]
    pub limit: u32,
}

fn default_limit() -> u32 {
    20
}

// Substrate Extrinsic API Handlers
pub async fn get_all_substrate_extrinsics(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateExtrinsic>>>, StatusCode> {
    let extrinsic_service = state.db.substrate_extrinsics();

    match extrinsic_service
        .get_all(pagination.limit, pagination.offset)
        .await
    {
        Ok(extrinsics) => Ok(Json(ApiResponse::success(extrinsics))),
        Err(e) => {
            eprintln!("Error fetching substrate extrinsics: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_extrinsics_by_block_number(
    State(state): State<Arc<AppState>>,
    Path(block_number): Path<u32>,
) -> Result<Json<ApiResponse<Vec<SubstrateExtrinsic>>>, StatusCode> {
    let extrinsic_service = state.db.substrate_extrinsics();

    match extrinsic_service
        .get_by_block_number(block_number)
        .await
    {
        Ok(extrinsics) => Ok(Json(ApiResponse::success(extrinsics))),
        Err(e) => {
            eprintln!("Error fetching substrate extrinsics by block number: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_extrinsics_by_signer(
    State(state): State<Arc<AppState>>,
    Path(signer): Path<String>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateExtrinsic>>>, StatusCode> {
    let extrinsic_service = state.db.substrate_extrinsics();

    match extrinsic_service
        .get_by_signer(&signer, pagination.limit)
        .await
    {
        Ok(extrinsics) => Ok(Json(ApiResponse::success(extrinsics))),
        Err(e) => {
            eprintln!("Error fetching substrate extrinsics by signer: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_extrinsics_by_module(
    State(state): State<Arc<AppState>>,
    Query(query): Query<ExtrinsicByModuleQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateExtrinsic>>>, StatusCode> {
    let extrinsic_service = state.db.substrate_extrinsics();

    let result = match query.function {
        Some(function) => {
            // Get extrinsics by both module and function
            extrinsic_service
                .get_by_module_and_function(&query.module, &function, query.limit)
                .await
        }
        None => {
            // Get extrinsics by module only
            extrinsic_service
                .get_by_module(&query.module, query.limit)
                .await
        }
    };

    match result {
        Ok(extrinsics) => Ok(Json(ApiResponse::success(extrinsics))),
        Err(e) => {
            eprintln!("Error fetching substrate extrinsics by module: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}