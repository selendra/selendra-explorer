use custom_error::ServiceError;
use subxt::{OnlineClient, PolkadotConfig};

pub struct SubstrtaeBlockQuery {
    pub api: OnlineClient<PolkadotConfig>,
    pub block_id: u32,
}

impl SubstrtaeBlockQuery {
    pub fn new(api: OnlineClient<PolkadotConfig>, block_id: u32) -> Self {
        Self {
            api,
            block_id
        }
    }

    pub async fn fetch_latest_block(&self) -> Result<u32, ServiceError> {
        match self.api.blocks().at_latest().await {
            Ok(block) => Ok(block.number()),
            Err(e) => return Err(ServiceError::SubstrateError(e.to_string())),
        }
    }

    pub async fn block_info(&self) -> Result<(), ServiceError> {
        let latest_block = match self.api.blocks().at_latest().await {
            Ok(block) => block,
            Err(e) => return Err(ServiceError::SubstrateError(e.to_string())),
        };
        println!("Latest block number: {}", latest_block.number());
        Ok(())
    }
}
