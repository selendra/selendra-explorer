use blockscan::SubstrtaeBlockQuery;
use custom_error::ServiceError;
use database::DatabaseService;
use models::substrate::{SubstrateBlock, SubstrateEvent, SubstrateExtrinsic};
use substrate_api_client::rpc::JsonrpseeClient;

#[derive(Clone)]
pub struct BlockProcessingService {
    pub client: JsonrpseeClient,
    pub db_service: DatabaseService,
}

impl BlockProcessingService {
    pub fn new(client: JsonrpseeClient, db_service: DatabaseService) -> Result<Self, ServiceError> {
        Ok(Self { client, db_service })
    }

    pub async fn lastest_block(&self) -> Result<u32, ServiceError> {
        let api = SubstrtaeBlockQuery::new(self.client.clone(), None).await?;
        let latest_block = api.lastest_block().await?;

        Ok(latest_block)
    }

    pub async fn process_block(&self, block_number: u32) -> Result<(), ServiceError> {
        let api = SubstrtaeBlockQuery::new(self.client.clone(), Some(block_number)).await?;

        let block = api.block_info().await?;
        let is_finalize = api.check_block_finalization_status().await?;
        let timestamp = api.get_block_timestamp().await?;
        let events_len = api.block_event().await?.total_count;

        // Create block info
        let block_info = SubstrateBlock {
            number: block.header.number,
            hash: format!("{:#x}", block.header.hash()),
            parent_hash: format!("{:#x}", block.header.parent_hash),
            state_root: format!("{:#x}", block.header.state_root),
            extrinsics_root: format!("{:#x}", block.header.extrinsics_root),
            extrinscs_len: block.extrinsics.len(),
            events_len,
            timestamp,
            is_finalize,
        };

        // Save block to database
        match self.db_service.substrate_blocks().save(&block_info).await {
            Ok(saved_block) => {
                println!(
                    "✅ Block {} saved successfully with hash: {}",
                    saved_block.number, saved_block.hash
                );
            }
            Err(e) => {
                println!("❌ Failed to save block {}: {}", block_number, e);
                return Err(e);
            }
        }

        Ok(())
    }

    pub async fn process_extrinsic(&self, block_number: u32) -> Result<(), ServiceError> {
        let api = SubstrtaeBlockQuery::new(self.client.clone(), Some(block_number)).await?;
        let block = api.block_info().await?;
        let timestamp = api.get_block_timestamp().await?;

        match api.get_extrinsics(block).await {
            Ok(extrinsics) => {
                println!(
                    "📝 Processing {} extrinsics for block {}",
                    extrinsics.len(),
                    block_number
                );

                let mut substrate_extrinsics = Vec::new();

                for (_, extrinsic_details) in extrinsics.iter().enumerate() {
                    let substrate_extrinsic = SubstrateExtrinsic {
                        hash: extrinsic_details.hash.clone(),
                        block_number,
                        extrinsic_index: extrinsic_details.index as u32,
                        is_signed: extrinsic_details.is_signed,
                        signer: extrinsic_details
                            .signature_info
                            .as_ref()
                            .map(|s| s.signer.clone()),
                        call_module: extrinsic_details.call_info.pallet.clone(),
                        call_function: extrinsic_details.call_info.call.clone(),
                        args: serde_json::to_string(&extrinsic_details.call_info.args)
                            .unwrap_or_else(|_| "{}".to_string()),
                        timestamp,
                    };

                    substrate_extrinsics.push(substrate_extrinsic);
                }

                // Save extrinsics in batch
                match self
                    .db_service
                    .substrate_extrinsics()
                    .save_batch(&substrate_extrinsics)
                    .await
                {
                    Ok(saved) => {
                        println!(
                            "✅ Saved {}/{} extrinsics for block {}",
                            saved.len(),
                            substrate_extrinsics.len(),
                            block_number
                        );
                    }
                    Err(e) => {
                        println!(
                            "❌ Failed to save extrinsics for block {}: {}",
                            block_number, e
                        );
                    }
                }
            }

            Err(e) => {
                println!(
                    "⚠️  Failed to get extrinsics for block {}: {}",
                    block_number, e
                );
            }
        };

        Ok(())
    }

    pub async fn process_event(&self, block_number: u32) -> Result<(), ServiceError> {
        let api = SubstrtaeBlockQuery::new(self.client.clone(), Some(block_number)).await?;
        let timestamp = api.get_block_timestamp().await?;

        match api.block_event().await {
            Ok(events) => {
                println!(
                    "📋 Processing {} events for block {}",
                    events.events.len(),
                    block_number
                );

                let mut substrate_events = Vec::new();

                for (index, event) in events.events.iter().enumerate() {
                    // Parse module and event name from event string (e.g., "System.ExtrinsicSuccess")
                    let event_parts: Vec<&str> = event.event.split('.').collect();
                    let (module, event_name) = if event_parts.len() >= 2 {
                        (event_parts[0].to_string(), event.event.clone())
                    } else {
                        ("Unknown".to_string(), event.event.clone())
                    };

                    let substrate_event = SubstrateEvent {
                        block_number,
                        event_index: index as u32,
                        phase: event.phase.clone(),
                        module,
                        event: event_name,
                        data: serde_json::to_string(&event.topics)
                            .unwrap_or_else(|_| "[]".to_string()),
                        timestamp,
                    };

                    substrate_events.push(substrate_event);
                }

                // Save events in batch
                match self
                    .db_service
                    .substrate_events()
                    .save_batch(&substrate_events)
                    .await
                {
                    Ok(saved) => {
                        println!(
                            "✅ Saved {}/{} events for block {}",
                            saved.len(),
                            substrate_events.len(),
                            block_number
                        );
                    }
                    Err(e) => {
                        println!("❌ Failed to save events for block {}: {}", block_number, e);
                    }
                }
            }
            Err(e) => {
                println!("⚠️  Failed to get events for block {}: {}", block_number, e);
            }
        }
        Ok(())
    }
}
