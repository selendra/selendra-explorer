pub mod block_process;
pub mod processing_config;

use block_process::BlockProcessingService;
use config::{
    DATABASE_NAMESPACE, DATABASE_PASSWORD, DATABASE_TABLE, DATABASE_URL, DATABASE_USERNAME,
};
use dotenv::dotenv;
use processing_config::{ContinuousProcessor, ProcessingConfig};
use substrate_api_client::rpc::JsonrpseeClient;
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting Evm Processing Service");
    dotenv().ok();

    let database = database::DatabaseService::new(
        DATABASE_URL.as_str(),
        DATABASE_USERNAME.as_str(),
        DATABASE_PASSWORD.as_str(),
        DATABASE_NAMESPACE.as_str(),
        DATABASE_TABLE.as_str(),
    )
    .await?;

    let endpoint = "wss://rpcx.selendra.org";
    let client = JsonrpseeClient::new(endpoint).await.map_err(|e| {
        Box::<dyn std::error::Error>::from(format!("Failed to connect to endpoint: {:?}", e))
    })?;
    
    //1619130  869240
    let config = ProcessingConfig {
        start_block: Some(1619130),
        end_block: Some(1619366),
        batch_size: 5,
        delay_between_batches: Duration::from_millis(200),
        max_retries: 3,
    };

     // Initialize block processing service
    let block_processor = BlockProcessingService::new(client, database)?;
    let processor = ContinuousProcessor::new(block_processor, config);

    match processor.start_processing().await {
        Ok(_) => println!("🎉 All blocks processed successfully!"),
        Err(e) => println!("❌ Processing failed: {}", e),
    }

    // // start continue block sync
    // match processor.start_continuous_sync().await {
    //     Ok(_) => println!("✅ Continuous sync started successfully"),
    //     Err(e) => println!("❌ Continuous sync failed: {}", e),
    // }

    Ok(())
}
