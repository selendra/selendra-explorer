use crate::scan::SubstrateBlockQuery;
use custom_error::ServiceError;
use database::DatabaseService;

#[derive(Clone)]
pub struct BlockProcessingService {
    pub client: SubstrateBlockQuery,
    #[allow(dead_code)]
    pub db_service: DatabaseService, 
}

impl BlockProcessingService {
    pub async fn new(url: String, block_number: Option<u32>, db_service: DatabaseService) -> Result<Self, ServiceError> {
        let client = SubstrateBlockQuery::new(&url, block_number).await?;
        Ok(
            Self { 
                client, 
                db_service 
        })
    }

    pub async fn lastest_block(&self) -> Result<u32, ServiceError> {
        let latest_block = self.client.latest_block().await?;

        Ok(latest_block)
    }

    pub async fn _chain_info(&self) -> Result<(), ServiceError> {
        let _current_era = self.client.get_current_era();
        let _current_session = self.client.get_current_session();
        let _total_issuance = self.client.get_total_issuance();
        let _total_staking = self.client.get_total_staking();
        Ok(())
    }

    pub async fn validator_info(&self) -> Result<(), ServiceError> {
        self.client.get_validator().await?;
        Ok(())
    }

    pub async fn process_chain_data(&self) -> Result<(), ServiceError> {
        let block = self.client.get_block().await?;
        let _is_finalize = self.client.is_block_finalized().await?;
        let (extrinsics, events) = self.client.get_extrinsics_with_events(block).await?;
        
        println!("Extrinsics: {:?}", extrinsics);
        println!("Events: {:?}", events);
        
        // Process each extrinsic with its events
        for (extrinsic, extrinsic_events) in extrinsics.iter().zip(events.iter()) {
            println!("Extrinsic {}: {} - {}", 
                extrinsic.index, 
                extrinsic.call_info.pallet, 
                extrinsic.call_info.call
            );
            
            for event in extrinsic_events {
                println!("  Event {}: {} - {} (Phase: {})", 
                    event.event_index,
                    event.pallet,
                    event.event,
                    event.phase
                );
                
                if !event.decoded_data.is_empty() {
                    for (key, value) in &event.decoded_data {
                        println!("    {}: {}", key, value);
                    }
                }
            }
        }
        
        Ok(())
    }
}
