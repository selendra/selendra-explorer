use config::EVM_TXS_TABLE;
use custom_error::ServiceError;
use models::evm::EvmTransaction;

use super::TransactionService;

impl<'a> TransactionService<'a> {
    pub async fn save(&self, transaction: &EvmTransaction) -> Result<EvmTransaction, ServiceError> {
        let created: EvmTransaction = self.db
            .create(EVM_TXS_TABLE)
            .content(transaction.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block save failed: {}", e)))?
            .ok_or_else(|| ServiceError::DatabaseError("Failed to create block record".to_string()))?;
        
        Ok(created)
    }

    pub async fn get_latest(&self) -> Result<Option<EvmTransaction>, ServiceError> {
        let mut result = self.db
            .query("SELECT * FROM $transactions ORDER BY number DESC LIMIT 1")
            .bind(("transactions", EVM_TXS_TABLE.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Latest transactions query failed: {}", e)))?;

        let transactions: Option<EvmTransaction> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Latest transactions extraction failed: {}", e)))?;
        
        Ok(transactions)
    }

    /// Get paginated transactions
    pub async fn get_all(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<EvmTransaction>, ServiceError> {
        let mut result = self
            .db
            .query("SELECT * FROM $transactions ORDER BY timestamp DESC LIMIT $limit START $offset")
            .bind(("transactions", EVM_TXS_TABLE.to_string()))
            .bind(("limit", limit))
            .bind(("offset", offset))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let transactions: Vec<EvmTransaction> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(transactions)
    }

    /// Check if a transaction exists by hash
    pub async fn is_exist_by_hash(&self, hash: &str) -> Result<bool, ServiceError> {
        let mut result = self
            .db
            .query("SELECT COUNT() FROM $transactions WHERE hash = $hash GROUP ALL")
            .bind(("transactions", EVM_TXS_TABLE.to_string()))
            .bind(("hash", hash.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let count: Option<i64> = result
            .take((0, "count"))
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(count.unwrap_or(0) > 0)
    }

    /// Get all transactions with a specific block number
    pub async fn get_all_with_block_number(
        &self,
        block_number: u32,
    ) -> Result<Vec<EvmTransaction>, ServiceError> {
        let mut result = self
            .db
            .query("SELECT * FROM $transactions WHERE block_number = $block_number")
            .bind(("transactions", EVM_TXS_TABLE.to_string()))
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
        let mut result = self
            .db
            .query("SELECT * FROM $transactions WHERE hash = $hash LIMIT 1")
            .bind(("transactions", EVM_TXS_TABLE.to_string()))
            .bind(("hash", hash.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let transactions: Vec<EvmTransaction> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(transactions.into_iter().next())
    }
}
