use axum::{
    http::Method,
    Router,
};
use database::DatabaseService;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
    timeout::TimeoutLayer,
};
use std::{sync::Arc, time::Duration};


use crate::{routes::create_api_routes, AppState};

pub async fn create_app(db: DatabaseService) -> Router {
    let app_state = Arc::new(AppState { db });

    // Create the router first
    let app = create_api_routes().with_state(app_state);

    // Apply middleware layers individually to avoid type conflicts
    app
        .layer(TraceLayer::new_for_http())
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET])
                .allow_headers(Any),
        )
        .layer(TimeoutLayer::new(Duration::from_secs(30)))
}