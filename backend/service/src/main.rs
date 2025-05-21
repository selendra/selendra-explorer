use std::sync::Arc;

use ethers::{providers::{Http, Provider}, types::BlockId};
use utils::BlockStateQuery;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = Provider::<Http>::try_from("https://rpcx.selendra.org")?;
    let provider = Arc::new(provider);

    let query = BlockStateQuery::new(Arc::clone(&provider));

    let block_number: u64 = 1000;

    let block_id = BlockId::Number(block_number.into());

    let block_info = query.evm_block_info(&block_id).await;

    println!("{:?}", block_info);

    Ok(())
}