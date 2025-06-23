pub mod block_process;
pub mod processing_config;

use block_process::BlockProcessingService;
use config::{
    BATCH_SIZE, DATABASE_NAMESPACE, DATABASE_PASSWORD, DATABASE_TABLE, DATABASE_URL, DATABASE_USERNAME, DELAY_BATCH, END_AT, EVM_RPC_URL, MAX_RETRIES, START_AT
};
use dotenv::dotenv;
use ethers::providers::{Http, Provider};
use processing_config::{ContinuousProcessor, ProcessingConfig};
use std::{sync::Arc, time::Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting Evm Processing Service");
    dotenv().ok();

    let provider = Provider::<Http>::try_from(EVM_RPC_URL.as_str())?;
    let provider = Arc::new(provider);
    let database = database::DatabaseService::new(
        DATABASE_URL.as_str(),
        DATABASE_USERNAME.as_str(),
        DATABASE_PASSWORD.as_str(),
        DATABASE_NAMESPACE.as_str(),
        DATABASE_TABLE.as_str(),
    )
    .await?;

    // Initialize block processing service
    let block_processor = BlockProcessingService::new(Arc::clone(&provider), database);

    let config = ProcessingConfig {
        start_block: START_AT,
        end_block: END_AT,
        batch_size: BATCH_SIZE,
        delay_between_batches: Duration::from_millis(DELAY_BATCH),
        max_retries: MAX_RETRIES,
    };

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
