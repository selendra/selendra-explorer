mod evm;
mod substrate;

use config::selendra;
use custom_error::ServiceError;
pub use evm::BlockStateQuery;
pub use substrate::SubstrtaeBlockQuery;

pub use ethers;
use subxt::{OnlineClient, SubstrateConfig};

pub struct SubstrtaeGeneralQuery {
    pub api: OnlineClient<SubstrateConfig>
}

impl SubstrtaeGeneralQuery {
    pub async fn new(url: &str) -> Result<Self, subxt::Error> {
        let api = OnlineClient::<SubstrateConfig>::from_url(url).await?;
        Ok(Self { api })
    }

    pub async fn get_lastest_block(&self) -> Result<u32, ServiceError> {
        let latest_block = self.api
        .blocks()
        .at_latest()
        .await
        .map_err(|e| ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e)))?;
        Ok(latest_block.number())
    }

    pub async fn get_current_era(&self) -> Result<u32, ServiceError> {
        let storage = selendra::storage();
        let active_era = self.api
            .storage()
            .at_latest()
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e)))?
            .fetch(&storage.staking().active_era())
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting active era: {:?}", e)))?;

        match active_era {
            Some(era) => {
                Ok(era.index)
            },
            None => Err(ServiceError::SubstrateError("No active era found".to_string())),
        }
    }

    pub async fn get_current_session(&self) -> Result<u32, ServiceError> {
        let storage = selendra::storage();

        let session = self.api
            .storage()
            .at_latest()
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e)))?
            .fetch(&storage.session().current_index())
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting active era: {:?}", e)))?;

        Ok(session.unwrap_or(0))
    }

    pub async fn get_total_staking(&self) -> Result<u128, ServiceError> {
        let storage = selendra::storage();

        let active_era = 
        match self.api
            .storage()
            .at_latest()
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e)))?
            .fetch(&storage.staking().active_era())
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting active era: {:?}", e)))? {
                Some(era) => era.index,
                None => 0,
        };

        let total_stake = self.api
            .storage()
            .at_latest()
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e)))?
            .fetch(&storage.staking().eras_total_stake(active_era))
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting total stake: {:?}", e)))?;

        Ok(total_stake.unwrap_or(0))
    }

    pub async fn get_total_issuance(&self) -> Result<u128, ServiceError> {
        let storage = selendra::storage();
        let total_issuance = self.api
            .storage()
            .at_latest()
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e)))?
            .fetch(&storage.balances().total_issuance())
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting total issuance: {:?}", e)))?;

        Ok(total_issuance.unwrap_or(0))
    }
}
