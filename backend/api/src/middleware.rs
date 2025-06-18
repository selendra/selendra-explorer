use axum::{Router, http::Method};
use database::DatabaseService;
use std::{sync::Arc, time::Duration};
use tower_http::{
    cors::{Any, CorsLayer},
    timeout::TimeoutLayer,
    trace::TraceLayer,
};

use crate::{AppState, routes::create_api_routes};

pub async fn create_app(db: DatabaseService) -> Router {
    let app_state = Arc::new(AppState { db });

    // Create the router first
    let app = create_api_routes().with_state(app_state);

    // Apply middleware layers individually to avoid type conflicts
    app.layer(TraceLayer::new_for_http())
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET])
                .allow_headers(Any),
        )
        .layer(TimeoutLayer::new(Duration::from_secs(30)))
}
