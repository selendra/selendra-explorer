pub mod block_process;
pub mod processing_config;

use block_process::BlockProcessingService;
use config::{
    BATCH_SIZE, DATABASE_NAMESPACE, DATABASE_PASSWORD, DATABASE_TABLE, DATABASE_URL, DATABASE_USERNAME, DELAY_BATCH, END_AT, MAX_RETRIES, START_AT, SUBSTRATE_URL
};
use dotenv::dotenv;
use processing_config::{ContinuousProcessor, ProcessingConfig};
use std::time::Duration;
use substrate_api_client::rpc::JsonrpseeClient;

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

    let client = JsonrpseeClient::new(&SUBSTRATE_URL).await.map_err(|e| {
        Box::<dyn std::error::Error>::from(format!("Failed to connect to endpoint: {:?}", e))
    })?;

    let config = ProcessingConfig {
        start_block: START_AT,
        end_block: END_AT,
        batch_size: BATCH_SIZE,
        delay_between_batches: Duration::from_millis(DELAY_BATCH),
        max_retries: MAX_RETRIES,
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
