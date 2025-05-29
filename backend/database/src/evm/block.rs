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
            .query("SELECT * FROM $evm_blocks WHERE number = $block_number LIMIT 1")
            .bind(("evm_blocks", EVM_BLOCK_TABLE.to_string()))
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
            .query("SELECT * FROM $evm_blocks WHERE hash = $block_hash LIMIT 1")
            .bind(("evm_blocks", EVM_BLOCK_TABLE.to_string()))
            .bind(("block_hash", block_hash.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block hash query failed: {}", e)))?;

        let block: Option<EvmBlock> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Block hash extraction failed: {}", e)))?;
        
        Ok(block)
    }

    pub async fn get_all(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<EvmBlock>, ServiceError> {
        let mut result = self
            .db
            .query("SELECT * FROM $evm_blocks ORDER BY timestamp DESC LIMIT $limit START $offset")
            .bind(("evm_blocks", EVM_BLOCK_TABLE.to_string()))
            .bind(("limit", limit))
            .bind(("offset", offset))
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        let blocks: Vec<EvmBlock> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(blocks)
    }

    /// Gets the latest block by block number
    pub async fn get_latest(&self) -> Result<Option<EvmBlock>, ServiceError> {
        let mut result = self.db
            .query("SELECT * FROM $evm_blocks ORDER BY number DESC LIMIT 1")
            .bind(("evm_blocks", EVM_BLOCK_TABLE.to_string()))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Latest block query failed: {}", e)))?;

        let block: Option<EvmBlock> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Latest block extraction failed: {}", e)))?;
        
        Ok(block)
    }

    pub async fn exists_by_number(&self, block_number: u32) -> Result<bool, ServiceError> {
        let mut result = self.db
            .query("SELECT VALUE count() FROM $evm_blocks WHERE number = $block_number")
            .bind(("evm_blocks", EVM_BLOCK_TABLE.to_string()))
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Block existence check failed: {}", e)))?;

        let count: Option<i64> = result.take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Block existence extraction failed: {}", e)))?;
        
        Ok(count.unwrap_or(0) > 0)
    }
}