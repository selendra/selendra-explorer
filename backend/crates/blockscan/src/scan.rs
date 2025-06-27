use custom_error::ServiceError;
use subxt::{
    backend::rpc::RpcClient, blocks::{Block, ExtrinsicEvents}, ext::subxt_rpcs::LegacyRpcMethods, utils::H256, OnlineClient, SubstrateConfig
};

use crate::{
    data_types::{CallInfo, EventDetails, EventPhase, ExtrinsicDetails}, event::EventDecoder, extrinsic::ExtrinsicDecoder
};

#[derive(Clone)]
pub struct SubstrateBlockQuery {
    pub client: OnlineClient<SubstrateConfig>,
    pub block_hash: H256,
}

impl SubstrateBlockQuery {
    pub async fn new(url: &str, block_number: Option<u32>) -> Result<Self, ServiceError> {
        let client = OnlineClient::<SubstrateConfig>::from_url(url)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to create client: {:?}", e))
            })?;

        let rpc_client = RpcClient::from_url(url).await.map_err(|e| {
            ServiceError::SubstrateError(format!("Failed to create RPC client: {:?}", e))
        })?;

        let rpc = LegacyRpcMethods::<SubstrateConfig>::new(rpc_client);

        let block_hash = match block_number {
            Some(num) => {
                // Specific block number provided
                let hash = rpc
                    .chain_get_block_hash(Some(num.into()))
                    .await
                    .map_err(|e| {
                        ServiceError::SubstrateError(format!("Error getting block hash: {:?}", e))
                    })?
                    .ok_or_else(|| {
                        ServiceError::SubstrateError("Block hash not found".to_string())
                    })?;
                hash
            }
            None => {
                let latest_hash = client
                    .blocks()
                    .at_latest()
                    .await
                    .map_err(|e| {
                        ServiceError::SubstrateError(format!(
                            "Error getting lastest block: {:?}",
                            e
                        ))
                    })?
                    .hash();

                latest_hash
            }
        };

        Ok(Self { client, block_hash })
    }

    pub async fn latest_block(&self) -> Result<u32, ServiceError> {
        let latest_block = self.client.blocks().at_latest().await.map_err(|e| {
            ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
        })?;
        Ok(latest_block.number())
    }

    pub async fn get_block(
        &self,
    ) -> Result<Block<SubstrateConfig, OnlineClient<SubstrateConfig>>, ServiceError> {
        let block = self
            .client
            .blocks()
            .at(self.block_hash)
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting block: {:?}", e)))?;

        Ok(block)
    }

    pub async fn get_extrinsics_with_events(
        &self,
        block: Block<SubstrateConfig, OnlineClient<SubstrateConfig>>,
    ) -> Result<(Vec<ExtrinsicDetails>, Vec<Vec<EventDetails>>), ServiceError> {
        let extrinsics = block
            .extrinsics()
            .await
            .map_err(|e| ServiceError::SubstrateError(e.to_string()))?;

        let decoder = ExtrinsicDecoder::new();
        let mut extrinsic_details = Vec::new();
        let mut all_events = Vec::new();

        for ext in extrinsics.iter() {
            let idx = ext.index();

            // Skip the first extrinsic (timestamp)
            if idx == 0 {
                continue;
            }

            // Process events for this extrinsic
            let extrinsic_events = ext
                .events()
                .await
                .map_err(|e| ServiceError::SubstrateError(e.to_string()))?;
            
            let event_details = self.event_info(extrinsic_events, idx).await?;
            all_events.push(event_details);

            // Process extrinsic details
            let raw_bytes = ext.bytes();
            let hash = format!("{:?}", ext.hash());

            let extrinsic_detail = match decoder.decode_extrinsic(raw_bytes, idx).await {
                Ok(mut detail) => {
                    detail.hash = hash;
                    detail
                }
                Err(e) => ExtrinsicDetails {
                    index: idx,
                    hash: "0xErr".to_string(),
                    is_signed: false,
                    signature_info: None,
                    call_info: CallInfo {
                        pallet: "DecodeError".to_string(),
                        call: e.to_string(),
                        args: Vec::new(),
                    },
                    raw_length: raw_bytes.len(),
                },
            };

            extrinsic_details.push(extrinsic_detail);
        }

        Ok((extrinsic_details, all_events))
    }

    pub async fn event_info(
        &self,
        events: ExtrinsicEvents<SubstrateConfig>,
        extrinsic_index: u32,
    ) -> Result<Vec<EventDetails>, ServiceError> {
        let event_decoder = EventDecoder::new();
        let mut event_details = Vec::new();

        for (event_index, event) in events.iter().enumerate() {
            let event = event.map_err(|e| ServiceError::SubstrateError(e.to_string()))?;
            
            // Get the phase
            let phase = match event.phase() {
                subxt::events::Phase::ApplyExtrinsic(idx) => EventPhase::ApplyExtrinsic(idx),
                subxt::events::Phase::Finalization => EventPhase::Finalization,
                subxt::events::Phase::Initialization => EventPhase::Initialization,
            };

            // Get pallet and event indices
            let pallet_index = event.pallet_index();
            let event_variant = event.variant_index();
            
            // Get event name
            let (pallet_name, event_name) = event_decoder.get_event_name(pallet_index, event_variant);
            
            // Get raw event data
            let raw_data = event.field_bytes();
            
            // Decode event data
            let decoded_data = event_decoder.decode_event_data(pallet_index, event_variant, raw_data);
            
            // Get topics (if any)
            let topics = event.topics().iter().map(|t| format!("{:?}", t)).collect();

            let event_detail = EventDetails {
                extrinsic_index,
                event_index: event_index as u32,
                pallet: pallet_name,
                event: event_name,
                phase,
                topics,
                data: raw_data.to_vec(),
                decoded_data,
            };

            event_details.push(event_detail);
        }

        Ok(event_details)
    }
}