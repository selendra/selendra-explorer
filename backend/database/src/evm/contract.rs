use config::EVM_CONTRACTS_TABLE;
use custom_error::ServiceError;
use models::evm::{ContractType, EvmContract};

use super::ContractService;

// Contract service implementation
impl<'a> ContractService<'a> {
    pub async fn save(&self, contract: &EvmContract) -> Result<EvmContract, ServiceError> {
        let created: EvmContract = self.db
            .create(EVM_CONTRACTS_TABLE)
            .content(contract.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Contract save failed: {}", e)))?
            .ok_or_else(|| ServiceError::DatabaseError("Failed to create contract record".to_string()))?;
        
        Ok(created)
    }

    pub async fn get_by_address(&self, address: &str) -> Result<Option<EvmContract>, ServiceError> {
        let query = format!("SELECT * FROM {} WHERE address = $address LIMIT 1", EVM_CONTRACTS_TABLE);
        let mut result = self.db
            .query(query)
            .bind(("address", address.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let contracts: Vec<EvmContract> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(contracts.into_iter().next())
    }

    pub async fn get_by_type(&self, contract_type: &ContractType) -> Result<Vec<EvmContract>, ServiceError> {
        let query = format!("SELECT * FROM {} WHERE contract_type = $contract_type", EVM_CONTRACTS_TABLE);
        let mut result = self.db
            .query(query)
            .bind(("contract_type", contract_type.clone()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let contracts: Vec<EvmContract> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(contracts)
    }

    pub async fn is_exist_by_address(&self, address: &str) -> Result<bool, ServiceError> {
        let query = format!("SELECT VALUE count() FROM {} WHERE address = $address", EVM_CONTRACTS_TABLE);
        let mut result = self.db
            .query(query)
            .bind(("address", address.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let count: Option<i64> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(count.unwrap_or(0) > 0)
    }
}
