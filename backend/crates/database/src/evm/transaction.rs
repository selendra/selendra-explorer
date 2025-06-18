use config::EVM_TXS_TABLE;
use custom_error::ServiceError;
use models::evm::EvmTransaction;

use super::TransactionService;

impl<'a> TransactionService<'a> {
    pub async fn save(&self, transaction: &EvmTransaction) -> Result<EvmTransaction, ServiceError> {
        let created: EvmTransaction = self
            .db
            .create(EVM_TXS_TABLE)
            .content(transaction.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block save failed: {}", e)))?
            .ok_or_else(|| {
                ServiceError::DatabaseError("Failed to create block record".to_string())
            })?;

        Ok(created)
    }

    /// Get paginated transactions
    pub async fn get_all(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<EvmTransaction>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} ORDER BY number DESC LIMIT $limit START $offset",
            EVM_TXS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("limit", limit))
            .bind(("offset", offset))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let transactions: Vec<EvmTransaction> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(transactions)
    }

    pub async fn get_latest(&self) -> Result<Option<EvmTransaction>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} ORDER BY number DESC LIMIT 1",
            EVM_TXS_TABLE
        );
        let mut result = self.db.query(query).await.map_err(|e| {
            ServiceError::DatabaseError(format!("Latest transaction query failed: {}", e))
        })?;

        let transaction: Option<EvmTransaction> = result.take(0).map_err(|e| {
            ServiceError::DatabaseError(format!("Latest transaction extraction failed: {}", e))
        })?;

        Ok(transaction)
    }

    /// Get all transactions with a specific block number
    pub async fn get_all_with_block_number(
        &self,
        block_number: u32,
    ) -> Result<Vec<EvmTransaction>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE block_number = $block_number",
            EVM_TXS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let transactions: Vec<EvmTransaction> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(transactions)
    }

    /// Get transaction by hash
    pub async fn get_by_hash(&self, hash: &str) -> Result<Option<EvmTransaction>, ServiceError> {
        let query = format!("SELECT * FROM {} WHERE hash = $hash LIMIT 1", EVM_TXS_TABLE);
        let mut result = self
            .db
            .query(query)
            .bind(("hash", hash.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let transactions: Vec<EvmTransaction> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(transactions.into_iter().next())
    }

    /// Check if a transaction exists by hash
    pub async fn is_exist_by_hash(&self, hash: &str) -> Result<bool, ServiceError> {
        let query = format!(
            "SELECT VALUE count() FROM {} WHERE hash = $hash",
            EVM_TXS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("hash", hash.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let count: Option<i64> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(count.unwrap_or(0) > 0)
    }
}
