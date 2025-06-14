use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use models::substrate::SubstrateEvent;
use serde::Deserialize;
use std::sync::Arc;

use crate::handlers::evm::{ApiResponse, PaginationQuery};
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct EventByModuleQuery {
    pub module: String,
    #[serde(default)]
    pub event: Option<String>,
    #[serde(default = "default_limit")]
    pub limit: u32,
}

#[derive(Debug, Deserialize)]
pub struct RecentEventsQuery {
    #[serde(default = "default_hours")]
    pub hours: u32,
    #[serde(default = "default_limit")]
    pub limit: u32,
}

fn default_limit() -> u32 {
    20
}

fn default_hours() -> u32 {
    24
}

// Substrate Event API Handlers
pub async fn get_all_substrate_events(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateEvent>>>, StatusCode> {
    let event_service = state.db.substrate_events();

    match event_service
        .get_all(pagination.limit, pagination.offset)
        .await
    {
        Ok(events) => Ok(Json(ApiResponse::success(events))),
        Err(e) => {
            eprintln!("Error fetching substrate events: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_events_by_block_number(
    State(state): State<Arc<AppState>>,
    Path(block_number): Path<u32>,
) -> Result<Json<ApiResponse<Vec<SubstrateEvent>>>, StatusCode> {
    let event_service = state.db.substrate_events();

    match event_service
        .get_by_block_number(block_number)
        .await
    {
        Ok(events) => Ok(Json(ApiResponse::success(events))),
        Err(e) => {
            eprintln!("Error fetching substrate events by block number: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_events_by_module(
    State(state): State<Arc<AppState>>,
    Query(query): Query<EventByModuleQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateEvent>>>, StatusCode> {
    let event_service = state.db.substrate_events();

    let result = match query.event {
        Some(event_name) => {
            // Get events by both module and event name
            event_service
                .get_by_module_and_event(&query.module, &event_name, query.limit)
                .await
        }
        None => {
            // Get events by module only
            event_service
                .get_by_module(&query.module, query.limit)
                .await
        }
    };

    match result {
        Ok(events) => Ok(Json(ApiResponse::success(events))),
        Err(e) => {
            eprintln!("Error fetching substrate events by module: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_substrate_events_by_event_name(
    State(state): State<Arc<AppState>>,
    Path(event_name): Path<String>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateEvent>>>, StatusCode> {
    let event_service = state.db.substrate_events();

    match event_service
        .get_by_event_name(&event_name, pagination.limit)
        .await
    {
        Ok(events) => Ok(Json(ApiResponse::success(events))),
        Err(e) => {
            eprintln!("Error fetching substrate events by event name: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_recent_substrate_events(
    State(state): State<Arc<AppState>>,
    Query(query): Query<RecentEventsQuery>,
) -> Result<Json<ApiResponse<Vec<SubstrateEvent>>>, StatusCode> {
    let event_service = state.db.substrate_events();

    match event_service
        .get_recent_events(query.hours, query.limit)
        .await
    {
        Ok(events) => Ok(Json(ApiResponse::success(events))),
        Err(e) => {
            eprintln!("Error fetching recent substrate events: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}