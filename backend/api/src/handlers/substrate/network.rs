use axum::Json;

use blockscan::SubstrtaeGeneralQuery;
use config::{BLOCKS_PER_ERA, SUBSTRATE_URL};
use models::substrate::SubstrateEra;

use crate::handlers::ApiResponse;

pub async fn get_substrate_latest_block() -> Result<Json<ApiResponse<u32>>, axum::http::StatusCode>
{
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str())
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let latest_block = api
        .get_lastest_block()
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse::success(latest_block)))
}

pub async fn get_total_issuance() -> Result<Json<ApiResponse<u128>>, axum::http::StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str())
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_issuance = api
        .get_total_issuance()
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse::success(total_issuance)))
}

pub async fn get_era_session() -> Result<Json<ApiResponse<SubstrateEra>>, axum::http::StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str())
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let session = api
        .get_current_session()
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let active_era = api
        .get_current_era()
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let start_at = active_era * BLOCKS_PER_ERA;
    let session_era = SubstrateEra {
        era: active_era,
        start_at,
        end_at: start_at + BLOCKS_PER_ERA,
        session,
    };

    Ok(Json(ApiResponse::success(session_era)))
}

pub async fn get_total_staking() -> Result<Json<ApiResponse<u128>>, axum::http::StatusCode> {
    let api = SubstrtaeGeneralQuery::new(SUBSTRATE_URL.as_str())
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_staking = api
        .get_total_staking()
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse::success(total_staking)))
}
