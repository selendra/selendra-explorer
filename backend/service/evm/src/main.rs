pub mod block_process;
pub mod processing_config;

use block_process::BlockProcessingService;
use config::{
    DATABASE_NAMESPACE, DATABASE_PASSWORD, DATABASE_TABLE, DATABASE_URL, DATABASE_USERNAME,
    EVM_RPC_URL,
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

    //1619130  869240
    let config = ProcessingConfig {
        start_block: None,
        end_block: None,
        batch_size: 5,
        delay_between_batches: Duration::from_millis(200),
        max_retries: 3,
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
