use axum::{Json, http::StatusCode};
use blockscan::{BlockStateQuery, ethers};
use config::EVM_RPC_URL;
use ethers::providers::{Http, Provider};
use models::evm::EvmNetworkInfo;
use std::sync::Arc;

use crate::handlers::ApiResponse;

pub async fn get_all_network_info() -> Result<Json<ApiResponse<EvmNetworkInfo>>, StatusCode> {
    let provider = Provider::<Http>::try_from(EVM_RPC_URL.as_str())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let provider = Arc::new(provider);

    let query = BlockStateQuery::new(Arc::clone(&provider), None);

    let network_info = match query.network_info().await {
        Ok(info) => info,
        Err(_e) => {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    Ok(Json(ApiResponse::success(network_info)))
}
