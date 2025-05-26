pub mod block_process;

use block_process::BlockProcessingService;
use substrate_api_client::rpc::JsonrpseeClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting Subtrate Block Processing Service");

    let endpoint = "wss://rpcx.selendra.org";
    let client = JsonrpseeClient::new(endpoint)
        .await
        .map_err(|e| Box::<dyn std::error::Error>::from(format!("Failed to connect to endpoint: {:?}", e)))?;

    let block_processor = BlockProcessingService::new(client);

    let block_number: u32 = 869242;

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
