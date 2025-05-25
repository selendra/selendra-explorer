use custom_error::ServiceError;
use subxt::{client::OnlineClient, config::PolkadotConfig};
use utils::SubstrtaeBlockQuery;

pub struct BlockProcessingService {
    pub api: OnlineClient<PolkadotConfig>
}

impl BlockProcessingService {
    pub fn new(api: OnlineClient<PolkadotConfig>) -> Self {
        Self { api }
    }

    pub async fn process_block(&self, block_number: u32) -> Result<(), ServiceError> {
        println!("🚀 Starting to process block {}", block_number);
        let query = SubstrtaeBlockQuery::new(self.api.clone(), block_number);

        println!("🎯  Fetching block information...");
        query.block_info().await?;

        Ok(())
    }
}
