pub mod account_process;

use config::{
    DATABASE_NAMESPACE, DATABASE_PASSWORD, DATABASE_TABLE, DATABASE_URL, DATABASE_USERNAME,
    SUBSTRATE_URL,
};
use database::DatabaseService;
use dotenv::dotenv;
use subxt::{OnlineClient, SubstrateConfig};

use crate::account_process::AccountProcessingService;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    println!("🚀 Starting Account Processing Service");

    let api = OnlineClient::<SubstrateConfig>::from_url(SUBSTRATE_URL.as_str()).await?;
    let database = DatabaseService::new(
        DATABASE_URL.as_str(),
        DATABASE_USERNAME.as_str(),
        DATABASE_PASSWORD.as_str(),
        DATABASE_NAMESPACE.as_str(),
        DATABASE_TABLE.as_str(),
    )
    .await?;

    // Initialize block processing service
    let processor = AccountProcessingService::new(api, database);
    processor.process_account().await?;

    Ok(())
}
