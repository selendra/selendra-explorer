pub mod block_process;

use block_process::BlockProcessingService;
use subxt::{OnlineClient, PolkadotConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting Subtrate Block Processing Service");

    let endpoint = "wss://rpcx.selendra.org";
    let api = OnlineClient::<PolkadotConfig>::from_url(endpoint).await?;

    let block_processor = BlockProcessingService::new(api);

    let block_number: u32 = 1000;

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
