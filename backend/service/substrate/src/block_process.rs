use blockscan::SubstrtaeBlockQuery;
use config::selendra::system::storage::types::extrinsic_count;
use custom_error::ServiceError;
use database::DatabaseService;
use models::substrate::SubstrateBlock;
use substrate_api_client::rpc::JsonrpseeClient;

#[derive(Clone)]
pub struct BlockProcessingService {
    pub api: SubstrtaeBlockQuery,
    pub db_service: DatabaseService,
}

impl BlockProcessingService {
    pub async fn new(client: JsonrpseeClient, db_service: DatabaseService) -> Result<Self, ServiceError> {
        let api = SubstrtaeBlockQuery::new(client.clone(), None).await?;
        Ok(Self { api, db_service })
    }

    pub async fn process_block(&self, block_number: u32) -> Result<(), ServiceError> {
         let block = self.api.block_info().await?;

        let is_finalize = self.api.check_block_finalization_status().await?;
        let timestamp = self.api.get_block_timestamp().await?;

        // save to database
        let block_info = SubstrateBlock {
            number: block.header.number,
            hash: format!("{:#x}", block.header.hash()),
            parent_hash: format!("{:#x}", block.header.parent_hash),
            state_root: format!("{:#x}", block.header.state_root),
            extrinsics_root: format!("{:#x}", block.header.extrinsics_root),
            timestamp,
            is_finalize,
        };

        // save to database
        let extrinsic = self.api.get_extrinsics(block).await?;

        // save to database
        let event = self.api.block_event().await?;

        Ok(())
    }

}
