pub mod middleware;
pub mod routes;

use database::DatabaseService;
use middleware::create_app;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use config::{
    DATABASE_NAMESPACE, DATABASE_PASSWORD, DATABASE_TABLE, DATABASE_URL, DATABASE_USERNAME,
};
use dotenv::dotenv;

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseService,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let database = database::DatabaseService::new(
        DATABASE_URL.as_str(),
        DATABASE_USERNAME.as_str(),
        DATABASE_PASSWORD.as_str(),
        DATABASE_NAMESPACE.as_str(),
        DATABASE_TABLE.as_str(),
    )
    .await?;

    let app = create_app(database).await;

    // write address like this to not make typos
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = TcpListener::bind(addr).await?;

    // Move the log statement BEFORE axum::serve() since serve() blocks indefinitely
    println!("🚀 Server running on http://{}", addr);
    
    // This call blocks indefinitely until the server shuts down
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}