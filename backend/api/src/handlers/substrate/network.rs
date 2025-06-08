use axum::Json;
use blockscan::SubstrtaeGeneralQuery;
use config::SUBSTRATE_URL;

use crate::handlers::evm::ApiResponse;


pub async fn get_substrate_latest_block() -> Result<Json<ApiResponse<u32>>, axum::http::StatusCode> {
   let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str()).await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let latest_block = api.get_lastest_block().await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse::success(latest_block)))
}

pub async fn get_total_issuance() -> Result<Json<ApiResponse<u128>>, axum::http::StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str()).await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_issuance = api.get_total_issuance().await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse::success(total_issuance)))
}

pub async fn get_current_era() -> Result<Json<ApiResponse<u32>>, axum::http::StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str()).await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let active_era = api.get_current_era().await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse::success(active_era)))
}

pub async fn get_current_session() -> Result<Json<ApiResponse<u32>>, axum::http::StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str()).await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let session = api.get_current_session().await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse::success(session)))
}

