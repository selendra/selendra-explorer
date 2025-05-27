mod extrinsic;
mod event;

use custom_error::ServiceError;
use model::{event::EventsResponse, extrinsic::ExtrinsicDetails};
use substrate_api_client::{ac_primitives::{BlakeTwo256, Block, DefaultRuntimeConfig, Header, OpaqueExtrinsic, H256}, rpc::JsonrpseeClient, Api, GetChainInfo, GetStorage};
pub struct SubstrtaeBlockQuery {
    pub api: Api<DefaultRuntimeConfig, JsonrpseeClient>,
    pub block_number: u32,
    pub block_hash: Option<H256>,
}

impl SubstrtaeBlockQuery {
    pub async fn new(client: JsonrpseeClient, block_number: u32) -> Result<Self, ServiceError> {
        let api = Api::<DefaultRuntimeConfig, _>::new(client)
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Failed to create API: {:?}", e)))?;

        let block_hash = match api.get_block_hash(Some(block_number.into())).await {
            Ok(hash) => hash,
            Err(e) => return Err(ServiceError::SubstrateError(format!("Error getting block hash: {:?}", e))),
        };
        Ok(Self {
            api,
            block_number,
            block_hash
        })
    }

    pub async fn fetch_latest_block(&self) -> Result<u32, ServiceError> {
        match self.api.get_block(None).await {
            Ok(Some(block)) => {
                Ok(block.header.number)
            },
            Ok(None) => return Err(ServiceError::SubstrateError(format!("No blocks found"))),
            Err(e) => return Err(ServiceError::SubstrateError(format!("Error getting latest block: {:?}", e)))
        }
    }

    pub async fn block_info(&self) -> Result<(), ServiceError> {
        let block = match self.api.get_block(self.block_hash).await {
            Ok(Some(block)) => block,
            Ok(None) => return Err(ServiceError::SubstrateError(format!("Block not found"))),
            Err(e) => return Err(ServiceError::SubstrateError(format!("Error getting block: {:?}", e))),
        };
        println!("Block detail: {:?}", block);

        let timestamp = self.get_block_timestamp().await?;
        println!("timestamp: {:?}", timestamp);

        let finalize = self.check_block_finalization_status().await?;
        println!("is finalize: {:?}", finalize);

        let extrinsics = self.get_extrinsics(block).await?;
        println!("extrinsics data: {:?}", extrinsics);

        let event = self.block_event().await?;
        println!("event data: {:?}", event);
        Ok(())
    }

    async fn get_block_timestamp(&self) -> Result<u64, ServiceError> {
        match self.api.get_storage::<u64>("Timestamp", "Now", self.block_hash).await {
            Ok(Some(timestamp)) => Ok(timestamp),
            Ok(None) => Err(ServiceError::SubstrateError("Timestamp not found".to_string())),
            Err(e) => Err(ServiceError::SubstrateError(format!("Error getting timestamp: {:?}", e))),
        }
    }

    async fn check_block_finalization_status(&self) -> Result<bool, ServiceError> {
        let finalized_head = self.api
            .get_finalized_head()
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting finalized head: {:?}", e)))?;

        if self.block_hash == finalized_head {
            return Ok(true);
        }
    
        let finalized_block = self.api
            .get_block(finalized_head)
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting finalized block: {:?}", e)))?
            .ok_or_else(|| ServiceError::SubstrateError("Finalized block not found".to_string()))?;
    
        let finalized_block_number = finalized_block.header.number;
    
        Ok(self.block_number <= finalized_block_number)
    }

    async fn get_extrinsics(&self, block: Block<Header<u32, BlakeTwo256>, OpaqueExtrinsic>) -> Result<Vec<ExtrinsicDetails>, ServiceError> {
        let extrinsic = extrinsic::ExtrinsicInfo::new(block);
        extrinsic.get_extrinsics().await
    }

    async fn block_event(&self) -> Result<EventsResponse, ServiceError>{
        let event = event::EventInfo::new(self.api.clone(), self.block_hash);
        event.get_events().await
    }
    
}
