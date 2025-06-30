use custom_error::ServiceError;
use subxt::{
    backend::rpc::RpcClient, book::setup::client, ext::subxt_rpcs::LegacyRpcMethods, OnlineClient, SubstrateConfig
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub struct ValidatorQuery {
    pub client: OnlineClient<SubstrateConfig>,
    pub rpc: LegacyRpcMethods<SubstrateConfig>,
}

impl ValidatorQuery {
    pub async fn new(rpc: LegacyRpcMethods<SubstrateConfig>, client: OnlineClient<SubstrateConfig>) -> Result<Self, ServiceError> {
        Ok(Self { client, rpc })
    }

    pub async fn get_validators_in_era(&self) -> Result<(), ServiceError> {
        let era_validators = self
            .client
            .storage()
            .at_latest()
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting lastest block: {:?}", e))
            })?
            .fetch(&config::selendra::storage().elections().current_era_validators())
            .await
            .map_err(|e| {
                ServiceError::SubstrateError(format!("Error getting active era: {:?}", e))
            })?;

        if let Some(validators) = era_validators {
            let mut validator_addresses = Vec::new();
            
            // Process reserved validators
            for validator in &validators.reserved {
                let address = Self::account_to_string(validator);
                validator_addresses.push(address);
                println!("Reserved validator: {}", validator_addresses.last().unwrap());
            }
            
            // Process non-reserved validators
            for validator in &validators.non_reserved {
                let address = Self::account_to_string(validator);
                validator_addresses.push(address);
                println!("Non-reserved validator: {}", validator_addresses.last().unwrap());
            }
            
            println!("Total validators found: {}", validator_addresses.len());
            println!("Reserved: {}, Non-reserved: {}", 
                validators.reserved.len(), 
                validators.non_reserved.len()
            );
            
        } else {
            println!("No era validators found");
        }
        Ok(())
    }

    fn account_to_string<T: std::fmt::Display>(account: &T) -> String {
        account.to_string()
    }

}