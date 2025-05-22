use std::sync::Arc;

use ethers::{providers::{Http, Provider}, types::BlockId};
use utils::BlockStateQuery;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = Provider::<Http>::try_from("https://mainnet.infura.io/v3/24a3e0a1e6474ff183c2e832a7e1a6a0")?;
    let provider = Arc::new(provider);

    let block_number: u64 = 22534498;
    let block_id = BlockId::Number(block_number.into());

    let query = BlockStateQuery::new(Arc::clone(&provider), block_id);

    // Example 1: Get network information
    println!("\n=== Network Information ===");
    match query.network_info().await {
        Ok(network_info) => {
            println!("Network info: {:?}", network_info.chain_id);
        }
        Err(e) => {
            println!("Error getting network info: {}", e);
        }
    }

    // Example 2: Get block information
    match query.block_info().await {
        Ok(block_info) => {
            println!("Block {}: {:?}", block_number, block_info.hash);
        }
        Err(e) => {
            println!("Error getting block info: {}", e);
        }
    }

    // Example 3: Get transaction by hash
    println!("\n=== Transaction by Hash ===");
    let transations_hash = query.transactions_hash_in_block().await?;
    let tx_hash = format!("{:#x}", transations_hash[0]); // Replace with real hash
    match query.transaction_by_hash(&tx_hash).await {
        Ok(tx_info) => {
            println!("Transaction: {:?}", tx_info);
        }
        Err(e) => {
            println!("Error getting transaction: {}", e);
        }
    }

    Ok(())
}
