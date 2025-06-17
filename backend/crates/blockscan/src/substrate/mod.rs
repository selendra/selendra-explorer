mod event;
mod extrinsic;
pub mod substrate_subxt;
mod validator;

use blockscan_model::{
    event::EventsResponse, extrinsic::ExtrinsicDetails, validator::ActiveValidator,
};
use custom_error::ServiceError;
pub use substrate_api_client::rpc::JsonrpseeClient;
use substrate_api_client::{
    Api, GetChainInfo, GetStorage,
    ac_primitives::{BlakeTwo256, Block, DefaultRuntimeConfig, H256, Header, OpaqueExtrinsic},
};

#[derive(Clone)]
pub struct SubstrtaeBlockQuery {
    pub api: Api<DefaultRuntimeConfig, JsonrpseeClient>,
    pub block_number: u32,
    pub block_hash: Option<H256>,
}

impl SubstrtaeBlockQuery {
    pub async fn new(
        client: JsonrpseeClient,
        block_number: Option<u32>,
    ) -> Result<Self, ServiceError> {
        let api = Api::<DefaultRuntimeConfig, _>::new(client)
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Failed to create API: {:?}", e)))?;

        let (block_number, block_hash) = match block_number {
            Some(num) => {
                // Specific block number provided
                let hash = api.get_block_hash(Some(num.into())).await.map_err(|e| {
                    ServiceError::SubstrateError(format!("Error getting block hash: {:?}", e))
                })?;
                (num, hash)
            }
            None => {
                // No block number provided, get latest
                let latest_block = api
                    .get_block(None)
                    .await
                    .map_err(|e| {
                        ServiceError::SubstrateError(format!("Error getting latest block: {:?}", e))
                    })?
                    .ok_or_else(|| ServiceError::SubstrateError("No blocks found".to_string()))?;

                let block_num = latest_block.header.number;
                let block_hash = api
                    .get_block_hash(Some(block_num.into()))
                    .await
                    .map_err(|e| {
                        ServiceError::SubstrateError(format!("Error getting block hash: {:?}", e))
                    })?;

                (block_num, block_hash)
            }
        };

        Ok(Self {
            api,
            block_number,
            block_hash,
        })
    }

    pub async fn lastest_block(&self) -> Result<u32, ServiceError> {
        match self.api.get_block(None).await {
            Ok(Some(block)) => Ok(block.header.number),
            Ok(None) => return Err(ServiceError::SubstrateError(format!("No blocks found"))),
            Err(e) => {
                return Err(ServiceError::SubstrateError(format!(
                    "Error getting latest block: {:?}",
                    e
                )));
            }
        }
    }

    pub async fn block_info(
        &self,
    ) -> Result<Block<Header<u32, BlakeTwo256>, OpaqueExtrinsic>, ServiceError> {
        let block = match self.api.get_block(self.block_hash).await {
            Ok(Some(block)) => block,
            Ok(None) => return Err(ServiceError::SubstrateError(format!("Block not found"))),
            Err(e) => {
                return Err(ServiceError::SubstrateError(format!(
                    "Error getting block: {:?}",
                    e
                )));
            }
        };

        Ok(block)
    }

    pub async fn get_extrinsics(
        &self,
        block: Block<Header<u32, BlakeTwo256>, OpaqueExtrinsic>,
    ) -> Result<Vec<ExtrinsicDetails>, ServiceError> {
        let extrinsic = extrinsic::ExtrinsicInfo::new(block);
        extrinsic.get_extrinsics().await
    }

    pub async fn block_event(&self) -> Result<EventsResponse, ServiceError> {
        let event = event::EventInfo::new(self.api.clone(), self.block_hash);
        event.get_events().await
    }

    pub async fn active_validaora(&self) -> Result<Vec<ActiveValidator>, ServiceError> {
        let validator = validator::ValidatorInfo::new(self.api.clone(), self.block_hash);
        validator.get_all_validators().await
    }

    pub async fn get_block_timestamp(&self) -> Result<u64, ServiceError> {
        match self
            .api
            .get_storage::<u64>("Timestamp", "Now", self.block_hash)
            .await
        {
            Ok(Some(timestamp)) => Ok(timestamp),
            Ok(None) => Err(ServiceError::SubstrateError(
                "Timestamp not found".to_string(),
            )),
            Err(e) => Err(ServiceError::SubstrateError(format!(
                "Error getting timestamp: {:?}",
                e
            ))),
        }
    }

    pub async fn check_block_finalization_status(&self) -> Result<bool, ServiceError> {
        let finalized_head = self.api.get_finalized_head().await.map_err(|e| {
            ServiceError::SubstrateError(format!("Error getting finalized head: {:?}", e))
        })?;

        if self.block_hash == finalized_head {
            return Ok(true);
        }

        let finalized_block = self
            .api
            .get_block(finalized_head)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting finalized block: {:?}", e))
            })?
            .ok_or_else(|| ServiceError::SubstrateError("Finalized block not found".to_string()))?;

        let finalized_block_number = finalized_block.header.number;

        Ok(self.block_number <= finalized_block_number)
    }
}
