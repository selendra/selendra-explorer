use axum::{
    extract::Request,
    http::Method,
    middleware::{self, Next},
    response::Response,
    Router,
};
use database::DatabaseService;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
    timeout::TimeoutLayer,
};
use tracing::{info, warn};
use std::{sync::Arc, time::Duration};
use tokio::time::Instant;


use crate::{routes::create_api_routes, AppState};

async fn logging_middleware(req: Request, next: Next) -> Response {
    let start = Instant::now();
    let method = req.method().clone();
    let uri = req.uri().clone();
    let user_agent = req
        .headers()
        .get("user-agent")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    info!("📥 {} {} - User-Agent: {}", method, uri, user_agent);

    let response = next.run(req).await;
    let status = response.status();
    let duration = start.elapsed();

    if status.is_success() {
        info!("✅ {} {} - {} - {:?}", method, uri, status, duration);
    } else {
        warn!("❌ {} {} - {} - {:?}", method, uri, status, duration);
    }

    response
}

pub async fn create_app(db: DatabaseService) -> Router {
    let app_state = Arc::new(AppState { db });

    // Create the router first
    let app = create_api_routes().with_state(app_state);

    // Apply middleware layers individually to avoid type conflicts
    app.layer(middleware::from_fn(logging_middleware))
        .layer(TraceLayer::new_for_http())
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET])
                .allow_headers(Any),
        )
        .layer(TimeoutLayer::new(Duration::from_secs(30)))
}