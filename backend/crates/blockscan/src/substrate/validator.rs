use blockscan_model::validator::{ActiveValidator, StakingInfo, ValidatorPrefs, ValidatorType};
use codec::{Decode, Encode};
use config::COMMISSION_DENOMINATOR;
use custom_error::ServiceError;
use futures::future::try_join_all;
use sp_core::crypto::Ss58Codec;
use sp_runtime::AccountId32;
use substrate_api_client::{
    Api, GetStorage,
    ac_primitives::{DefaultRuntimeConfig, H256},
    rpc::JsonrpseeClient,
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

#[derive(Eq, Clone, PartialEq, Decode, Encode, Debug)]
pub struct EraValidators<AccountId> {
    pub reserved: Vec<AccountId>,
    pub non_reserved: Vec<AccountId>,
}

pub struct ValidatorInfo {
    pub api: Api<DefaultRuntimeConfig, JsonrpseeClient>,
    pub block_hash: Option<H256>,
}

impl ValidatorInfo {
    pub fn new(api: Api<DefaultRuntimeConfig, JsonrpseeClient>, block_hash: Option<H256>) -> Self {
        Self { api, block_hash }
    }

    pub async fn get_all_validators(&self) -> Result<Vec<ActiveValidator>, ServiceError> {
        let era_validators = self.get_era_validators().await?;
        let current_era = self.current_era().await?;

        // Pre-allocate vector with known size
        let total_validators = era_validators.reserved.len() + era_validators.non_reserved.len();
        let mut futures = Vec::with_capacity(total_validators);

        // Prepare futures for all validators
        for account_id in era_validators.reserved {
            futures.push(self.get_validator_info(account_id, ValidatorType::Reserved, current_era));
        }

        for account_id in era_validators.non_reserved {
            futures.push(self.get_validator_info(
                account_id,
                ValidatorType::NonReserved,
                current_era,
            ));
        }

        try_join_all(futures).await
    }

    async fn get_era_validators(&self) -> Result<EraValidators<AccountId32>, ServiceError> {
        self.api
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
            })
    }

    async fn get_validator_info(
        &self,
        account_id: AccountId32,
        validator_type: ValidatorType,
        current_era: u32,
    ) -> Result<ActiveValidator, ServiceError> {
        // Run staking info and validator prefs queries concurrently
        let (staking_info, validator_prefs) = futures::try_join!(
            self.get_staking_info(current_era, &account_id),
            self.get_validator_prefs_internal(&account_id)
        )?;

        let prefs = validator_prefs.map_or_else(
            || ValidatorPrefs {
                commission: 0.0,
                blocked: false,
            },
            |p| ValidatorPrefs {
                commission: p.commission.deconstruct() as f64 / COMMISSION_DENOMINATOR,
                blocked: p.blocked,
            },
        );

        let staking = staking_info.map_or_else(
            || StakingInfo {
                total: 0,
                own: 0,
                nominator_count: 0,
            },
            |s| StakingInfo {
                total: s.total,
                own: s.own,
                nominator_count: s.nominator_count,
            },
        );

        Ok(ActiveValidator {
            account_id: account_id.to_ss58check(),
            prefs,
            validator_type,
            staking_info: staking,
        })
    }

    async fn get_staking_info(
        &self,
        era: u32,
        account_id: &AccountId32,
    ) -> Result<Option<PagedExposureMetadata>, ServiceError> {
        self.api
            .get_storage_double_map::<u32, AccountId32, PagedExposureMetadata>(
                "Staking",
                "ErasStakersOverview",
                era,
                account_id.clone(),
                self.block_hash,
            )
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!(
                    "Failed to get staking info for era {} and account {}: {:?}",
                    era,
                    account_id.to_ss58check(),
                    e
                ))
            })
    }

    async fn get_validator_prefs_internal(
        &self,
        account_id: &AccountId32,
    ) -> Result<Option<pallet_staking::ValidatorPrefs>, ServiceError> {
        self.api
            .get_storage_map::<AccountId32, pallet_staking::ValidatorPrefs>(
                "Staking",
                "Validators",
                account_id.clone(),
                self.block_hash,
            )
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!(
                    "Failed to get validator prefs for {}: {:?}",
                    account_id.to_ss58check(),
                    e
                ))
            })
    }

    async fn current_era(&self) -> Result<u32, ServiceError> {
        self.api
            .get_storage::<u32>("Staking", "CurrentEra", self.block_hash)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Failed to get current era: {:?}", e))
            })?
            .ok_or_else(|| ServiceError::SubstrateError("No current era found".to_string()))
    }
}
