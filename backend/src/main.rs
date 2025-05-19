use actix_cors::Cors;
use actix_web::{middleware, App, HttpServer};
use dotenv::dotenv;
use log::info;
use std::env;
use std::sync::Arc;
use std::time::Duration;

mod api;
mod db;
mod models;
mod schema;
mod services;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv().ok();

    // Initialize logger
    env_logger::init();

    // Get server configuration from environment
    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("SERVER_PORT must be a valid port number");

    log::info!("Starting server at http://{}:{}", host, port);

    // Initialize database connection pool
    let pool = db::establish_connection_pool();
    let pool_arc = Arc::new(pool.clone());

    // Start blockchain indexing services
    let evm_poll_interval = Duration::from_secs(15);
    let substrate_poll_interval = Duration::from_secs(15);
    let sync_service = services::blockchain::sync::BlockchainSyncService::new(
        pool_arc,
        evm_poll_interval,
        substrate_poll_interval,
    );

    // Start the synchronization service in the background
    tokio::spawn(async move {
        match sync_service.start().await {
            Ok((evm_handle, substrate_handle)) => {
                log::info!("Blockchain synchronization services started successfully");
                // Wait for both handles to complete (they should run indefinitely)
                let _ = tokio::try_join!(
                    async {
                        evm_handle
                            .await
                            .map_err(|e| log::error!("EVM indexer error: {}", e))
                    },
                    async {
                        substrate_handle
                            .await
                            .map_err(|e| log::error!("Substrate indexer error: {}", e))
                    }
                );
            }
            Err(e) => {
                log::error!("Failed to start blockchain synchronization services: {}", e);
            }
        }
    });

    // Start HTTP server
    HttpServer::new(move || {
        // Configure CORS
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .app_data(pool.clone())
            // Register API routes here
            .configure(api::configure_routes)
    })
    .bind((host, port))?
    .run()
    .await
}
