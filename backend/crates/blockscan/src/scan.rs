use custom_error::ServiceError;
use subxt::{
    OnlineClient, SubstrateConfig,
    backend::{legacy::LegacyRpcMethods, rpc::RpcClient},
    blocks::{Block, ExtrinsicEvents},
    utils::H256,
};

use crate::{
    data_types::{CallInfo, ExtrinsicDetails},
    extrinsic::ExtrinsicDecoder,
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
    ) -> Result<(Vec<ExtrinsicDetails>, Vec<ExtrinsicEvents<SubstrateConfig>>), ServiceError> {
        let extrinsics = block
            .extrinsics()
            .await
            .map_err(|e| ServiceError::SubstrateError(e.to_string()))?;

        let decoder = ExtrinsicDecoder::new();
        let mut extrinsic_details = Vec::new();
        let mut events = Vec::new();

        for ext in extrinsics.iter() {
            let idx = ext.index();

            // Skip the first extrinsic (timestamp)
            if idx == 0 {
                continue;
            }

            // Process events for this extrinsic
            let event = ext
                .events()
                .await
                .map_err(|e| ServiceError::SubstrateError(e.to_string()))?;
            events.push(event);

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

        Ok((extrinsic_details, events))
    }

    pub async fn _event_info(
        &self,
        _event: ExtrinsicEvents<SubstrateConfig>,
    ) -> Result<(), ServiceError> {
        todo!();
        // Process event information here
    }
}
