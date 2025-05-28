use config::EVM_BLOCK_TABLE;
use custom_error::ServiceError;
use models::evm::EvmBlock;
use surrealdb::sql::Thing;

use super::EvmBlockService;

impl<'a> EvmBlockService<'a> {
    pub async fn save(&self, block_info: &EvmBlock) -> Result<EvmBlock, ServiceError> {
        let created: EvmBlock = self.db
            .create(EVM_BLOCK_TABLE)
            .content(block_info.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block save failed: {}", e)))?
            .ok_or_else(|| ServiceError::DatabaseError("Failed to create block record".to_string()))?;
        
        Ok(created)
    }

    /// Retrieves an EVM block by ID string
    pub async fn get_by_id(&self, block_id: &str) -> Result<Option<EvmBlock>, ServiceError> {
        let thing_id = Thing::from((EVM_BLOCK_TABLE, block_id));
        self.get_by_thing_id(&thing_id).await
    }

    pub async fn get_by_thing_id(&self, block_id: &Thing) -> Result<Option<EvmBlock>, ServiceError> {
        let block: Option<EvmBlock> = self.db
            .select((EVM_BLOCK_TABLE, block_id.id.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block retrieval failed: {}", e)))?;
        
        Ok(block)
    }

    /// Retrieves an EVM block by block number
    pub async fn get_by_number(&self, block_number: u32) -> Result<Option<EvmBlock>, ServiceError> {
        let mut result = self.db
            .query("SELECT * FROM evm_blocks WHERE number = $block_number LIMIT 1")
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block number query failed: {}", e)))?;

        let block: Option<EvmBlock> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Block number extraction failed: {}", e)))?;
        
        Ok(block)
    }

    /// Retrieves an EVM block by hash
    pub async fn get_by_hash(&self, block_hash: &str) -> Result<Option<EvmBlock>, ServiceError> {
        let mut result = self.db
            .query("SELECT * FROM evm_blocks WHERE hash = $block_hash LIMIT 1")
            .bind(("block_hash", block_hash.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block hash query failed: {}", e)))?;

        let block: Option<EvmBlock> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Block hash extraction failed: {}", e)))?;
        
        Ok(block)
    }

    /// Retrieves all EVM blocks with optional pagination
    pub async fn get_all(&self, limit: Option<usize>, offset: Option<usize>) -> Result<Vec<EvmBlock>, ServiceError> {
        let query = match (limit, offset) {
            (Some(l), Some(o)) => format!("SELECT * FROM {} ORDER BY number DESC LIMIT {} START {}", EVM_BLOCK_TABLE, l, o),
            (Some(l), None) => format!("SELECT * FROM {} ORDER BY number DESC LIMIT {}", EVM_BLOCK_TABLE, l),
            (None, Some(o)) => format!("SELECT * FROM {} ORDER BY number DESC START {}", EVM_BLOCK_TABLE, o),
            (None, None) => format!("SELECT * FROM {} ORDER BY number DESC", EVM_BLOCK_TABLE),
        };

        let mut result = self.db
            .query(&query)
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Blocks retrieval failed: {}", e)))?;

        let blocks: Vec<EvmBlock> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Blocks extraction failed: {}", e)))?;
        
        Ok(blocks)
    }

    /// Updates an existing EVM block
    pub async fn update(&self, block_id: &str, block_info: &EvmBlock) -> Result<Option<EvmBlock>, ServiceError> {
        let updated: Option<EvmBlock> = self.db
            .update((EVM_BLOCK_TABLE, block_id))
            .content(block_info.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block update failed: {}", e)))?;
        
        Ok(updated)
    }

    /// Deletes an EVM block by ID
    pub async fn delete(&self, block_id: &str) -> Result<Option<EvmBlock>, ServiceError> {
        let deleted: Option<EvmBlock> = self.db
            .delete((EVM_BLOCK_TABLE, block_id))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block deletion failed: {}", e)))?;
        
        Ok(deleted)
    }

    /// Counts total number of EVM blocks
    pub async fn count(&self) -> Result<usize, ServiceError> {
        let mut result = self.db
            .query("SELECT count() FROM evm_blocks GROUP ALL")
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block count query failed: {}", e)))?;

        let count: Option<usize> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Block count extraction failed: {}", e)))?;
        
        Ok(count.unwrap_or(0))
    }

    /// Gets the latest block by block number
    pub async fn get_latest(&self) -> Result<Option<EvmBlock>, ServiceError> {
        let mut result = self.db
            .query("SELECT * FROM evm_blocks ORDER BY number DESC LIMIT 1")
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Latest block query failed: {}", e)))?;

        let block: Option<EvmBlock> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Latest block extraction failed: {}", e)))?;
        
        Ok(block)
    }

    /// Checks if a block exists by hash
    pub async fn exists_by_hash(&self, block_hash: &str) -> Result<bool, ServiceError> {
        let mut result = self.db
            .query("SELECT count() FROM evm_blocks WHERE hash = $block_hash GROUP ALL")
            .bind(("block_hash", block_hash.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block existence check failed: {}", e)))?;

        let count: Option<usize> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Block existence extraction failed: {}", e)))?;
        
        Ok(count.unwrap_or(0) > 0)
    }

    pub async fn exists_by_number(&self, block_number: u32) -> Result<bool, ServiceError> {
        let mut result = self.db
            .query("SELECT count() FROM evm_blocks WHERE number = $block_number GROUP ALL")
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block existence check failed: {}", e)))?;

        let count: Option<usize> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Block existence extraction failed: {}", e)))?;
        
        Ok(count.unwrap_or(0) > 0)
    }
}