use config::EVM_ACCOUNTS_TABLE;
use custom_error::ServiceError;
use models::AccountInfo;

use super::AccountService;

// Account service implementation
impl<'a> AccountService<'a> {
    pub async fn save(&self, account: &AccountInfo) -> Result<AccountInfo, ServiceError> {
        let created: AccountInfo = self
            .db
            .create(EVM_ACCOUNTS_TABLE)
            .content(account.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Account save failed: {}", e)))?
            .ok_or_else(|| {
                ServiceError::DatabaseError("Failed to create account record".to_string())
            })?;

        Ok(created)
    }

    pub async fn get_all(&self, limit: u32, offset: u32) -> Result<Vec<AccountInfo>, ServiceError> {
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

        let accounts: Vec<AccountInfo> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(accounts)
    }

    pub async fn get_accounts_by_balance_range(
        &self,
        min_balance: f64,
        max_balance: f64,
        limit: u32,
    ) -> Result<Vec<AccountInfo>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE balance_token >= $min_balance AND balance_token <= $max_balance ORDER BY balance_token DESC LIMIT $limit",
            EVM_ACCOUNTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("min_balance", min_balance))
            .bind(("max_balance", max_balance))
            .bind(("limit", limit))
            .await
            .map_err(|e| {
                ServiceError::DatabaseError(format!("Balance range query failed: {}", e))
            })?;

        let accounts: Vec<AccountInfo> = result.take(0).map_err(|e| {
            ServiceError::DatabaseError(format!("Balance range extraction failed: {}", e))
        })?;

        Ok(accounts)
    }

    pub async fn get_by_address(&self, address: &str) -> Result<Option<AccountInfo>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE address = $address LIMIT 1",
            EVM_ACCOUNTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("address", address.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let accounts: Vec<AccountInfo> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(accounts.into_iter().next())
    }

    pub async fn update_account(
        &self,
        address: &str,
        last_activity: Option<u128>,
        balance_token: Option<f64>,
        free_balance: Option<f64>,
    ) -> Result<Option<AccountInfo>, ServiceError> {
        let mut set_clauses = Vec::new();
        let mut bindings = vec![("address", address.to_string())];

        if let Some(timestamp) = last_activity {
            set_clauses.push("last_activity = $timestamp");
            bindings.push(("timestamp", timestamp.to_string()));
        }

        if let Some(balance) = balance_token {
            set_clauses.push("balance_token = $balance_token");
            bindings.push(("balance_token", balance.to_string()));
        }

        if let Some(balance) = free_balance {
            set_clauses.push("free_balance = $free_balance");
            bindings.push(("free_balance", balance.to_string()));
        }

        if set_clauses.is_empty() {
            return Err(ServiceError::DatabaseError(
                "No fields to update".to_string(),
            ));
        }

        let query = format!(
            "UPDATE {} SET {} WHERE address = $address RETURN *",
            EVM_ACCOUNTS_TABLE,
            set_clauses.join(", ")
        );

        let mut query_builder = self.db.query(query);
        for (key, value) in bindings {
            query_builder = query_builder.bind((key, value));
        }

        let mut result = query_builder
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Account update failed: {}", e)))?;

        let account: Option<AccountInfo> = result.take(0).map_err(|e| {
            ServiceError::DatabaseError(format!("Account update extraction failed: {}", e))
        })?;

        Ok(account)
    }

    pub async fn is_exist_by_address(&self, address: &str) -> Result<bool, ServiceError> {
        let query = format!(
            "SELECT VALUE count() FROM {} WHERE address = $address",
            EVM_ACCOUNTS_TABLE
        );
        let mut result = self
            .db
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
