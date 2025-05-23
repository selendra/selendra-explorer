use std::sync::Arc;

use block_process::BlockProcessingService;
use ethers::providers::{Http, Provider};

pub mod block_process;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting Block Processing Service");

    let provider = Provider::<Http>::try_from(
        "https://mainnet.infura.io/v3/24a3e0a1e6474ff183c2e832a7e1a6a0",
    )?;
    let provider = Arc::new(provider);

    // Initialize block processing service
    let block_processor = BlockProcessingService::new(Arc::clone(&provider));

    let block_number: u64 = 22534498;

    match block_processor.process_block(block_number).await {
        Ok(_success) => {
            println!("\n🎉 Block processing completed successfully!");
        }
        Err(e) => {
            println!("❌ Failed to process block {}: {}", block_number, e);
        }
    }

    Ok(())
}
