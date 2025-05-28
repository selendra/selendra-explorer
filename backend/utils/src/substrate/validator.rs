use codec::{Decode, Encode};
use custom_error::ServiceError;
use futures::future::try_join_all; // For concurrent processing
use model::validator::{ActiveEra, ActiveValidator, StakingInfo, ValidatorPrefs, ValidatorType};
use sp_core::crypto::Ss58Codec;
use sp_runtime::AccountId32;
use substrate_api_client::{
    ac_primitives::{DefaultRuntimeConfig, H256}, rpc::JsonrpseeClient, Api, GetStorage
};

#[derive(Encode, Decode, Clone, Debug)]
pub struct ActiveEraInfo {
    pub index: u32,
    pub start: Option<u64>,
}

#[derive(Encode, Decode, Clone, Debug)]
pub struct PagedExposureMetadata {
    #[codec(compact)]
	pub total: u128,
    #[codec(compact)]
	pub own: u128,
	pub nominator_count: u32,
}

pub struct ValidatorInfo {
    pub api: Api<DefaultRuntimeConfig, JsonrpseeClient>,
    pub block_hash: Option<H256>,
}

#[derive(Eq, Clone, PartialEq, Decode, Encode, Debug)]
pub struct EraValidators<AccountId> {
    /// Validators that are chosen to be in committee every single session.
    pub reserved: Vec<AccountId>,
    /// Validators that can be banned out from the committee, under the circumstances
    pub non_reserved: Vec<AccountId>,
}

impl ValidatorInfo {
    pub fn new(api: Api<DefaultRuntimeConfig, JsonrpseeClient>, block_hash: Option<H256>) -> Self {
        Self { api, block_hash }
    }

    pub async fn get_all_validators(&self) -> Result<Vec<ActiveValidator>, ServiceError> {
        let era_validators = self
            .api
            .get_storage::<EraValidators<AccountId32>>(
                "Elections",
                "CurrentEraValidators",
                self.block_hash,
            )
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get CurrentEraValidators: {:?}", e))
            })?
            .ok_or_else(|| {
                ServiceError::SubstrateError(
                    "No validators found in CurrentEraValidators".to_string(),
                )
            })?;

        let mut futures = Vec::new();

        // Prepare futures for reserved validators
        for account_id in era_validators.reserved {
            futures.push(self.get_validator_prefs(account_id, ValidatorType::Reserved));
        }

        // Prepare futures for non-reserved validators
        for account_id in era_validators.non_reserved {
            futures.push(self.get_validator_prefs(account_id, ValidatorType::NonReserved));
        }

        try_join_all(futures).await
    }

    async fn get_validator_prefs(
        &self,
        account_id: AccountId32,
        validator_type: ValidatorType,
    ) -> Result<ActiveValidator, ServiceError> {
        let current_era = self.current_era().await?;
        
         // Get the session index when a specific era started
         let staking_info = self.api.get_storage_double_map::<u32, AccountId32, PagedExposureMetadata>("Staking", "ErasStakersOverview", current_era, account_id.clone(), self.block_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get era start staking_info for era {}: {:?}", current_era, e))
            })?
            .ok_or_else(|| {
                ServiceError::SubstrateError(format!("No staking_info found for era {}", current_era))
            })?;
        match self
            .api
            .get_storage_map::<AccountId32, pallet_staking::ValidatorPrefs>(
                "Staking",
                "Validators",
                account_id.clone(),
                self.block_hash,
            )
            .await
        {
            Ok(Some(prefs)) => {
                let commission = prefs.commission.deconstruct() as f64 / 10_000_000.0;
                let res_prefs = ValidatorPrefs {
                    commission,
                    blocked: prefs.blocked,
                };
                Ok(ActiveValidator {
                    account_id: account_id.to_ss58check(),
                    prefs: res_prefs,
                    validator_type,
                    staking_info: StakingInfo {
                        total: staking_info.total,
                        own: staking_info.own,
                        nominator_count: staking_info.nominator_count,
                    },
                })
            }
            Ok(None) => {
                Ok(ActiveValidator {
                    account_id: account_id.to_ss58check(),
                    prefs: ValidatorPrefs {
                        commission: 0.0,
                        blocked: false,
                    },
                    validator_type,
                    staking_info: StakingInfo {
                        total: 0,
                        own: 0,
                        nominator_count: 0,
                    },
                })
            }
            Err(e) => {
                Err(ServiceError::SubstrateError(format!(
                    "Failed to get prefs for {}: {:?}",
                    account_id.to_string(),
                    e
                )))
            }
        }
    }

    pub async fn current_era_info(&self)-> Result<ActiveEra, ServiceError> {
        let era = self.api.get_storage::<ActiveEraInfo>("Staking", "ActiveEra", self.block_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get current active era {:?}", e))
            })?
            .ok_or_else(|| {
                ServiceError::SubstrateError(format!("No era in have found"))
            })?;

        let start_session = self.era_start_session(era.index).await?;
        let total_stake = self.era_total_stake(era.index).await?;
        let current_session = self.current_session().await?;

       Ok(ActiveEra {
            era: era.index,
            start_time: era.start.unwrap_or(0),
            start_session,
            current_session,
            total_stake,
            end_session: start_session + 96, // Selendra have 96 sessions per era
        })
    }

    async fn era_start_session(&self, era_index: u32) -> Result<u32, ServiceError> {
        // Get the session index when a specific era started
        let start_session = self.api.get_storage_map::<u32, u32>("Staking", "ErasStartSessionIndex", era_index, self.block_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get era start session for era {}: {:?}", era_index, e))
            })?
            .ok_or_else(|| {
                ServiceError::SubstrateError(format!("No start session found for era {}", era_index))
            })?;
        Ok(start_session)
    }

    async fn era_total_stake(&self, era_index: u32) -> Result<u128, ServiceError> {
        // Get the session index when a specific era started
        let total_stake = self.api.get_storage_map::<u32, u128>("Staking", "ErasTotalStake", era_index, self.block_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get total stake for current era {}: {:?}", era_index, e))
            })?
            .ok_or_else(|| {
                ServiceError::SubstrateError(format!("No start staking found in current era {}", era_index))
            })?;
        Ok(total_stake)
    }

    async fn current_session(&self) -> Result<u32, ServiceError> {
        // Get the session index when a specific era started
        let current_session = self.api.get_storage::<u32>("Session", "CurrentIndex", self.block_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get current session {:?}", e))
            })?
            .ok_or_else(|| {
                ServiceError::SubstrateError(format!("No session in have found"))
            })?;

        Ok(current_session)
    }

    async fn current_era(&self) -> Result<u32, ServiceError> {
        // Get the session index when a specific era started
        let current_session = self.api.get_storage::<u32>("Staking", "CurrentEra", self.block_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get current active era {:?}", e))
            })?
            .ok_or_else(|| {
                ServiceError::SubstrateError(format!("No era in have found"))
            })?;

        Ok(current_session)
    }
}
