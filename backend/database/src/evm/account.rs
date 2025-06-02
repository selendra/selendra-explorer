use config::EVM_ACCOUNTS_TABLE;
use custom_error::ServiceError;
use models::evm::EvmAccountInfo;

use super::AccountService;

// Account service implementation
impl<'a> AccountService<'a> {
    pub async fn save(&self, account: &EvmAccountInfo) -> Result<EvmAccountInfo, ServiceError> {
        let created: EvmAccountInfo = self.db
            .create(EVM_ACCOUNTS_TABLE)
            .content(account.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Account save failed: {}", e)))?
            .ok_or_else(|| ServiceError::DatabaseError("Failed to create account record".to_string()))?;
        
        Ok(created)
    }

    pub async fn get_all(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<EvmAccountInfo>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} ORDER BY created_at DESC LIMIT $limit START $offset", 
            EVM_ACCOUNTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("limit", limit))
            .bind(("offset", offset))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let accounts: Vec<EvmAccountInfo> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(accounts)
    }

    pub async fn get_accounts_by_balance_range(
        &self,
        min_balance: u128,
        max_balance: u128,
        limit: u32,
    ) -> Result<Vec<EvmAccountInfo>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE balance_token >= $min_balance AND balance_token <= $max_balance ORDER BY balance_token DESC LIMIT $limit", 
            EVM_ACCOUNTS_TABLE
        );
        let mut result = self.db
            .query(query)
            .bind(("min_balance", min_balance))
            .bind(("max_balance", max_balance))
            .bind(("limit", limit))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Balance range query failed: {}", e)))?;

        let accounts: Vec<EvmAccountInfo> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Balance range extraction failed: {}", e)))?;
        
        Ok(accounts)
    }

    pub async fn get_by_address(&self, address: &str) -> Result<Option<EvmAccountInfo>, ServiceError> {
        let query = format!("SELECT * FROM {} WHERE address = $address LIMIT 1", EVM_ACCOUNTS_TABLE);
        let mut result = self.db
            .query(query)
            .bind(("address", address.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let accounts: Vec<EvmAccountInfo> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(accounts.into_iter().next())
    }

    pub async fn update_last_activity(&self, address: &str, timestamp: u128) -> Result<(), ServiceError> {
        let query = format!("UPDATE {} SET last_activity = $timestamp WHERE address = $address", EVM_ACCOUNTS_TABLE);
        self.db
            .query(query)
            .bind(("address", address.to_string()))
            .bind(("timestamp", timestamp))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Failed to update last activity: {}", e)))?;

        Ok(())
    }

    pub async fn update_balance(&self, address: &str, balance: f64) -> Result<Option<EvmAccountInfo>, ServiceError> {
        let query = format!("UPDATE {} SET balance_token = $balance WHERE address = $address", EVM_ACCOUNTS_TABLE);
        let mut result = self.db
            .query(query)
            .bind(("address", address.to_string()))
            .bind(("balance", balance))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Account balance update failed: {}", e)))?;

        let account: Option<EvmAccountInfo> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Account balance update extraction failed: {}", e)))?;
        
        Ok(account)
    }

    pub async fn is_exist_by_address(&self, address: &str) -> Result<bool, ServiceError> {
        let query = format!("SELECT VALUE count() FROM {} WHERE address = $address", EVM_ACCOUNTS_TABLE);
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