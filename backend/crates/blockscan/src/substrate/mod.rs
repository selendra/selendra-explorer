// mod event;
// mod extrinsic;
pub mod substrate_subxt;
// mod validator;

// use blockscan_model::{
//     event::EventsResponse, extrinsic::ExtrinsicDetails, validator::ActiveValidator,
// };
use custom_error::ServiceError;
use subxt::{
    OnlineClient,
    SubstrateConfig,
    utils::H256, blocks::Block,
    backend::{legacy::LegacyRpcMethods, rpc::RpcClient}
};

#[derive(Clone)]
pub struct SubstrateBlockQuery {
    pub client: OnlineClient<SubstrateConfig>,
    pub block_hash: H256,
}

impl SubstrateBlockQuery {
    pub async fn new(
        url: &str,
        block_number: Option<u32>,
    ) -> Result<Self, ServiceError> {
        let client = OnlineClient::<SubstrateConfig>::from_url(url)
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Failed to create client: {:?}", e)))?;

        let rpc_client = RpcClient::from_url(url).await
            .map_err(|e| ServiceError::SubstrateError(format!("Failed to create RPC client: {:?}", e)))?;

        let rpc = LegacyRpcMethods::<SubstrateConfig>::new(rpc_client);

        let block_hash = match block_number {
            Some(num) => {
                // Specific block number provided
                let hash = rpc.chain_get_block_hash(Some(num.into())).await
                    .map_err(|e| ServiceError::SubstrateError(format!("Error getting block hash: {:?}", e)))?
                    .ok_or_else(|| ServiceError::SubstrateError("Block hash not found".to_string()))?;
                hash
            }
            None => {
                let latest_hash =client.blocks().at_latest().await.map_err(|e| {
                    ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
                })?.hash();

                latest_hash
            }
        };

        Ok(Self {
            client,
            block_hash,
        })
    }

    pub async fn latest_block(&self) -> Result<u32, ServiceError> {
        let latest_block = self.client.blocks().at_latest().await.map_err(|e| {
            ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
        })?;
        Ok(latest_block.number())
    }

    pub async fn block_info(&self) -> Result<Block<SubstrateConfig, OnlineClient<SubstrateConfig>>, ServiceError> {
        let block = self.client.blocks().at(self.block_hash).await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting block: {:?}", e)))?;

        Ok(block)
    }
}