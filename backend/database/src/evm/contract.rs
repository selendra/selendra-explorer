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

    pub async fn get_all(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<EvmContract>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} ORDER BY created_at DESC LIMIT $limit START $offset", 
            EVM_CONTRACTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("limit", limit))
            .bind(("offset", offset))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let contracts: Vec<EvmContract> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(contracts)
    }

    pub async fn get_verified_contracts(&self) -> Result<Vec<EvmContract>, ServiceError> {
        let query = format!("SELECT * FROM {} WHERE is_verified = true ORDER BY created_at DESC", EVM_CONTRACTS_TABLE);
        let mut result = self.db
            .query(query)
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Verified contracts query failed: {}", e)))?;

        let contracts: Vec<EvmContract> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Verified contracts extraction failed: {}", e)))?;
        
        Ok(contracts)
    }

    pub async fn update_verification_status(&self, address: &str, is_verified: bool) -> Result<Option<EvmContract>, ServiceError> {
        let query = format!("UPDATE {} SET is_verified = $is_verified WHERE address = $address", EVM_CONTRACTS_TABLE);
        let mut result = self.db
            .query(query)
            .bind(("address", address.to_string()))
            .bind(("is_verified", is_verified))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Contract verification update failed: {}", e)))?;

        let contract: Option<EvmContract> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Contract verification update extraction failed: {}", e)))?;
        
        Ok(contract)
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
