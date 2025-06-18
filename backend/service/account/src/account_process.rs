use config::{GENESIS_TIMESTAMP, selendra};
use custom_error::ServiceError;
use database::DatabaseService;
use models::{AccountInfo, AddressType};
use sp_core::crypto::{AccountId32, Ss58Codec};
use subxt::{OnlineClient, SubstrateConfig};

#[derive(Clone)]
pub struct AccountProcessingService {
    pub api: OnlineClient<SubstrateConfig>,
    pub db_service: DatabaseService,
}

impl AccountProcessingService {
    pub fn new(api: OnlineClient<SubstrateConfig>, db_service: DatabaseService) -> Self {
        Self { api, db_service }
    }

    pub async fn process_account(&self) -> Result<(), ServiceError> {
        let storage_query = selendra::storage().system().account_iter();

        let mut iter = self
            .api
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
            })?
            .iter(storage_query)
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting accounts: {:?}", e))
            })?;

        while let Some(Ok(kv)) = iter.next().await {
            let account_data = kv.value.data;

            // Skip accounts with zero balance early
            if account_data.free == 0 && account_data.reserved == 0 && account_data.frozen == 0 {
                continue;
            }

            if kv.key_bytes.len() >= 32 {
                let account_id_bytes = &kv.key_bytes[kv.key_bytes.len() - 32..];

                if let Ok(account_id) = <[u8; 32]>::try_from(account_id_bytes) {
                    let balance = account_data
                        .free
                        .saturating_add(account_data.reserved)
                        .saturating_add(account_data.frozen);

                    // Double-check balance is greater than zero
                    if balance == 0 {
                        continue;
                    }

                    let account_address = Self::account_id_to_ss58(&account_id);
                    let balance_token = Self::format_balance(balance);
                    let free_balance = Self::format_balance(account_data.free);

                    // Check if account already exists
                    if self
                        .db_service
                        .accounts()
                        .is_exist_by_address(&account_address)
                        .await?
                    {
                        // Update existing account with current timestamp and balances
                        self.db_service
                            .accounts()
                            .update_account(
                                &account_address,
                                None,
                                Some(balance_token),
                                Some(free_balance),
                            )
                            .await?;
                    } else {
                        // Create new account only if balance > 0
                        let account = AccountInfo {
                            address: account_address.clone(),
                            balance_token,
                            free_balance,
                            nonce: 0,
                            is_contract: false,
                            address_type: AddressType::SS58,
                            created_at: GENESIS_TIMESTAMP,
                            last_activity: GENESIS_TIMESTAMP,
                        };

                        self.db_service.accounts().save(&account).await?;
                    }
                }
            }
        }

        println!("✅ Saved all account success");

        Ok(())
    }

    fn account_id_to_ss58(account_id: &[u8; 32]) -> String {
        let account = AccountId32::from(*account_id);
        account.to_ss58check_with_version(sp_core::crypto::Ss58AddressFormat::custom(42))
    }

    fn format_balance(balance: u128) -> f64 {
        balance as f64 / 1e18
    }
}
