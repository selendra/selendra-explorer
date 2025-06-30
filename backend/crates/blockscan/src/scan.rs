use custom_error::ServiceError;
use subxt::{
    backend::rpc::RpcClient, blocks::{Block, ExtrinsicEvents}, ext::subxt_rpcs::LegacyRpcMethods, utils::H256, OnlineClient, SubstrateConfig
};

use crate::{
    data_types::{CallInfo, DataEvent, DataExtrinsic, EventPhase}, event::EventDecoder, extrinsic::ExtrinsicDecoder, substrate::validator::ValidatorQuery
};

#[derive(Clone)]
pub struct SubstrateBlockQuery {
    pub rpc: LegacyRpcMethods<SubstrateConfig>,
    pub client: OnlineClient<SubstrateConfig>,
    pub block_hash: H256,
    pub block_number: u32
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

        let (block_hash, actual_block_number) = match block_number {
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
                (hash, num)
            }
            None => {
                // Get the latest block
                let latest_block = client
                    .blocks()
                    .at_latest()
                    .await
                    .map_err(|e| {
                        ServiceError::SubstrateError(format!(
                            "Error getting latest block: {:?}",
                            e
                        ))
                    })?;

                let latest_hash = latest_block.hash();
                let latest_number = latest_block.number();

                (latest_hash, latest_number)
            }
        };

        Ok(Self {
            rpc,
            client,
            block_hash,
            block_number: actual_block_number,
        })
    }

    pub async fn latest_block(&self) -> Result<u32, ServiceError> {
        let latest_block = self.client.blocks().at_latest().await.map_err(|e| {
            ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
        })?;
        Ok(latest_block.number())
    }

    pub async fn is_block_finalized(&self) -> Result<bool, ServiceError> {
        let finalized_hash = self.rpc
            .chain_get_finalized_head()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting finalized head: {:?}", e))
            })?;

        let finalized_block = self
            .client
            .blocks()
            .at(finalized_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting finalized block: {:?}", e))
            })?;
        Ok(self.block_number <= finalized_block.number())
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
    ) -> Result<(Vec<DataExtrinsic>, Vec<Vec<DataEvent>>), ServiceError> {
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
                Err(e) => DataExtrinsic {
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
    ) -> Result<Vec<DataEvent>, ServiceError> {
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
            
            // Decode event data
            let decoded_data = event_decoder.decode_event_data(pallet_index, event_variant, event.clone());
            
            // Get topics (if any)
            let topics = event.topics().iter().map(|t| format!("{:?}", t)).collect();

            let event_detail = DataEvent {
                extrinsic_index,
                event_index: event_index as u32,
                pallet: pallet_name,
                event: event_name,
                phase,
                topics,
                decoded_data,
            };

            event_details.push(event_detail);
        }

        Ok(event_details)
    }

    pub async fn get_validator(&self) -> Result<(), ServiceError> {
        let validate = ValidatorQuery::new(self.rpc.clone(), self.client.clone()).await?;
        validate.get_validators_in_era().await?;
        Ok(())
    }

    pub async fn get_current_era(&self) -> Result<u32, ServiceError> {
        let active_era = self
            .client
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
            })?
            .fetch(&config::selendra::storage().staking().active_era())
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting active era: {:?}", e))
            })?;

        match active_era {
            Some(era) => Ok(era.index),
            None => Err(ServiceError::SubstrateError(
                "No active era found".to_string(),
            )),
        }
    }

    pub async fn get_current_session(&self) -> Result<u32, ServiceError> {
        let session = self
            .client
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
            })?
            .fetch(&config::selendra::storage().session().current_index())
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting active era: {:?}", e))
            })?;

        Ok(session.unwrap_or(0))
    }

    pub async fn get_total_issuance(&self) -> Result<u128, ServiceError> {
        let total_issuance = self
            .client
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
            })?
            .fetch(&config::selendra::storage().balances().total_issuance())
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting total issuance: {:?}", e))
            })?;

        Ok(total_issuance.unwrap_or(0))
    }


    pub async fn check_account_balance(&self, account_address: &str) -> Result<u128, ServiceError> {
        use subxt::utils::AccountId32;

        // Parse the account address
        let account_id = if account_address.starts_with("0x") {
            // Handle hex-encoded account ID
            let hex_bytes = hex::decode(&account_address[2..]).map_err(|e| {
                ServiceError::SubstrateError(format!("Error decoding hex account id: {:?}", e))
            })?;
            let account_array: [u8; 32] = hex_bytes.try_into().map_err(|_| {
                ServiceError::SubstrateError(
                    "Invalid hex account id length, expected 32 bytes".to_string(),
                )
            })?;
            AccountId32::from(account_array)
        } else {
            // Handle SS58 address
            account_address.parse::<AccountId32>().map_err(|e| {
                ServiceError::SubstrateError(format!(
                    "Error parsing SS58 address '{}': {:?}",
                    account_address, e
                ))
            })?
        };

        let account_info = self
            .client
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting latest block: {:?}", e))
            })?
            .fetch(&config::selendra::storage().system().account(account_id))
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting account info: {:?}", e))
            })?;

        match account_info {
            Some(info) => Ok(info.data.free + info.data.reserved),
            None => Ok(0), // Account doesn't exist, balance is 0
        }
    }

    pub async fn get_total_staking(&self) -> Result<u128, ServiceError> {
        let active_era = match self
            .client
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
            })?
            .fetch(&config::selendra::storage().staking().active_era())
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting active era: {:?}", e))
            })? {
            Some(era) => era.index,
            None => 0,
        };

        let total_stake = self
            .client
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
            })?
            .fetch(&config::selendra::storage().staking().eras_total_stake(active_era))
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting total stake: {:?}", e))
            })?;

        Ok(total_stake.unwrap_or(0))
    }
}