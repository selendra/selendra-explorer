use std::sync::Arc;
use axum::{routing::get, Router};

use crate::AppState;

async fn hello_world() -> &'static str {
    "Hello, world!"
}


pub fn create_api_routes() -> Router<Arc<AppState>> {
    Router::new().route("/explorer", get(hello_world))
}