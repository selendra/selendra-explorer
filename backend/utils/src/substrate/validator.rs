use codec::{Decode, Encode};
use custom_error::ServiceError;
use futures::future::try_join_all; // For concurrent processing
use model::validator::{ActiveValidator, ValidatorPrefs, ValidatorType};
use sp_core::crypto::Ss58Codec;
use sp_runtime::AccountId32;
use substrate_api_client::{
    ac_primitives::{DefaultRuntimeConfig, H256},
    rpc::JsonrpseeClient,
    Api, GetStorage,
};

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

    async fn get_validator_prefs(
        &self,
        account_id: AccountId32,
        validator_type: ValidatorType,
    ) -> Result<ActiveValidator, ServiceError> {
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
}