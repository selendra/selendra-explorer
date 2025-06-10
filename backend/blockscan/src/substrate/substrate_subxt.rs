use sp_core::{H160, crypto::{AccountId32, Ss58Codec}};
use sp_runtime::traits::{BlakeTwo256, Hash};

use config::selendra;
use custom_error::ServiceError;
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

    pub async fn check_account_balance(&self, account_address: &str) -> Result<u128, ServiceError> {
        use subxt::utils::AccountId32;
        
        // Parse the account address
        let account_id = if account_address.starts_with("0x") {
            // Handle hex-encoded account ID
            let hex_bytes = hex::decode(&account_address[2..])
                .map_err(|e| ServiceError::SubstrateError(format!("Error decoding hex account id: {:?}", e)))?;
            let account_array: [u8; 32] = hex_bytes.try_into()
                .map_err(|_| ServiceError::SubstrateError("Invalid hex account id length, expected 32 bytes".to_string()))?;
            AccountId32::from(account_array)
        } else {
            // Handle SS58 address
            account_address.parse::<AccountId32>()
                .map_err(|e| ServiceError::SubstrateError(format!("Error parsing SS58 address '{}': {:?}", account_address, e)))?
        };
    
        let account_info = self.api
            .storage()
            .at_latest()
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting latest block: {:?}", e)))?
            .fetch(&selendra::storage().system().account(account_id))
            .await
            .map_err(|e| ServiceError::SubstrateError(format!("Error getting account info: {:?}", e)))?;
    
        match account_info {
            Some(info) => Ok(info.data.free + info.data.reserved),
            None => Ok(0) // Account doesn't exist, balance is 0
        }
    }
    
    pub fn ss58_to_evm_address(&self, ss58_address: &str) -> Result<String, ServiceError> {
        // Parse SS58 string to AccountId32
        let account_id = AccountId32::from_ss58check(ss58_address)
            .map_err(|e| ServiceError::SubstrateError(format!("Failed to parse SS58: {:?}", e)))?;
        
        // Convert AccountId32 to EVM address (first 20 bytes)
        let account_bytes: &[u8; 32] = account_id.as_ref();
        let mut evm_bytes = [0u8; 20];
        evm_bytes.copy_from_slice(&account_bytes[0..20]);
        let address = H160(evm_bytes);
        
        Ok(format!("0x{:x}", address))
    }

    /// Convert EVM address (string) to SS58 address (string)
    pub fn evm_to_ss58(&self, evm_address: &str) -> Result<String, ServiceError> {
        let evm_address = self.parse_evm_address(evm_address)?;

        let mut data = [0u8; 24];
        data[0..4].copy_from_slice(b"evm:");  // 4-byte prefix
        data[4..24].copy_from_slice(&evm_address[..]);  // 20-byte EVM address
        let hash = BlakeTwo256::hash(&data);

        let substrate_account = AccountId32::from(hash.0);

        let ss58_address = substrate_account.to_ss58check_with_version(
            sp_core::crypto::Ss58AddressFormat::custom(42)
        );
        Ok(ss58_address)
    }
    
    /// Helper function to parse EVM address string
    fn parse_evm_address(&self, address_str: &str) -> Result<H160, ServiceError> {
        // Remove "0x" prefix if present
        let clean_address = if address_str.starts_with("0x") || address_str.starts_with("0X") {
            &address_str[2..]
        } else {
            address_str
        };
        
        // Check length (40 hex characters = 20 bytes)
        if clean_address.len() != 40 {
            return Err(ServiceError::SubstrateError(
                format!("EVM address must be 40 hex characters, got {}", clean_address.len())
            ));
        }
        
        // Parse hex string to bytes
        let bytes = hex::decode(clean_address)
            .map_err(|e| ServiceError::SubstrateError(format!("Invalid hex: {:?}", e)))?;
        
        if bytes.len() != 20 {
            return Err(ServiceError::SubstrateError(
                format!("EVM address must be 20 bytes, got {}", bytes.len())
            ));
        }
        
        let mut address_bytes = [0u8; 20];
        address_bytes.copy_from_slice(&bytes);
        Ok(H160(address_bytes))
    }
}
