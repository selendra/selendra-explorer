use crate::scan::SubstrateBlockQuery;
use custom_error::ServiceError;
use database::DatabaseService;

#[derive(Clone)]
pub struct BlockProcessingService {
    pub url: String,
    #[allow(dead_code)]
    pub db_service: DatabaseService, 
}

impl BlockProcessingService {
    pub fn new(url: String, db_service: DatabaseService) -> Result<Self, ServiceError> {
        Ok(Self { url, db_service })
    }

    pub async fn lastest_block(&self) -> Result<u32, ServiceError> {
        let client = SubstrateBlockQuery::new(&self.url, None).await?;
        let latest_block = client.latest_block().await?;

        Ok(latest_block)
    }

    pub async fn process_chain_data(&self, block_number: Option<u32>) -> Result<(), ServiceError> {
        let client = SubstrateBlockQuery::new(&self.url, block_number).await?;

        let block = client.get_block().await?;
        let (extrinsics, events) = client.get_extrinsics_with_events(block).await?;
        
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
