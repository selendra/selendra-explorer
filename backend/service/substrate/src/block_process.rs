use custom_error::ServiceError;
use substrate_api_client::rpc::JsonrpseeClient;
use utils::SubstrtaeBlockQuery;

pub struct BlockProcessingService {
    pub api: JsonrpseeClient
}

impl BlockProcessingService {
    pub fn new(api: JsonrpseeClient) -> Self {
        Self { api }
    }

    pub async fn process_block(&self, block_number: u32) -> Result<(), ServiceError> {
        println!("🚀 Starting to process block {}", block_number);
        let query = SubstrtaeBlockQuery::new(self.api.clone(), block_number).await?;

        println!("🎯  Fetching block information...");
        query.block_info().await?;

        Ok(())
    }
}
