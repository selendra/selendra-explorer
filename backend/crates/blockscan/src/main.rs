pub mod data_types;
mod processing;
mod scan;
mod substrate;

use crate::processing::BlockProcessingService;
use config::{
    DATABASE_NAMESPACE, DATABASE_PASSWORD, DATABASE_TABLE, DATABASE_URL, DATABASE_USERNAME,
};
use dotenv::dotenv;
use substrate::{event, extrinsic};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let database = database::DatabaseService::new(
        DATABASE_URL.as_str(),
        DATABASE_USERNAME.as_str(),
        DATABASE_PASSWORD.as_str(),
        DATABASE_NAMESPACE.as_str(),
        DATABASE_TABLE.as_str(),
    )
    .await?;

    let processor = BlockProcessingService::new("wss://rpc.selendra.org".to_string(), Some(3_456_091), database).await?;
    println!("laste block {:?}", processor.lastest_block().await?);
    // processor.process_chain_data(Some(3606538)).await?;
    // processor.process_chain_data().await?;
    processor.validator_info().await?;
    Ok(())
}

// _------------------------------------?
