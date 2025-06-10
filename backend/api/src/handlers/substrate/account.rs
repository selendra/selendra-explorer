use axum::{
    Json,
    extract::Path,
    http::StatusCode,
};
use blockscan::SubstrtaeGeneralQuery;
use config::SUBSTRATE_URL;

use crate::handlers::evm::ApiResponse;

// Account API handlers
pub async fn get_ss58_from_evm(
    Path(address): Path<String>,
) -> Result<Json<ApiResponse<Option<String>>>, StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str()).await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    match api.evm_to_ss58(&address) {
        Ok(account) => Ok(Json(ApiResponse::success(Some(account)))),
        Err(_) => {
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_evm_from_ss58(
    Path(address): Path<String>,
) -> Result<Json<ApiResponse<Option<String>>>, StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str()).await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    match api.ss58_to_evm_address(&address) {
        Ok(account) => Ok(Json(ApiResponse::success(Some(account)))),
        Err(_) => {
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}