use config::SUBSTRATE_BLOCKS_TABLE;
use custom_error::ServiceError;
use models::substrate::SubstrateBlock;

use super::SubstrateBlockService;

impl<'a> SubstrateBlockService<'a> {
    pub async fn save(&self, block: &SubstrateBlock) -> Result<SubstrateBlock, ServiceError> {
        let created: SubstrateBlock = self
            .db
            .create(SUBSTRATE_BLOCKS_TABLE)
            .content(block.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Substrate block save failed: {}", e)))?
            .ok_or_else(|| {
                ServiceError::DatabaseError("Failed to create substrate block record".to_string())
            })?;

        Ok(created)
    }

    pub async fn exists_by_number(&self, block_number: u32) -> Result<bool, ServiceError> {
        let query = format!(
            "SELECT VALUE count() FROM {} WHERE number = $block_number",
            SUBSTRATE_BLOCKS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("block_number", block_number))
            .await
            .map_err(|e| {
                ServiceError::DatabaseError(format!("Block existence check failed: {}", e))
            })?;

        let count: Option<i64> = result.take(0).map_err(|e| {
            ServiceError::DatabaseError(format!("Block existence extraction failed: {}", e))
        })?;

        Ok(count.unwrap_or(0) > 0)
    }

    pub async fn get_latest(&self) -> Result<Option<SubstrateBlock>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} ORDER BY number DESC LIMIT 1",
            SUBSTRATE_BLOCKS_TABLE
        );
        let mut result = self.db.query(query).await.map_err(|e| {
            ServiceError::DatabaseError(format!("Latest substrate block query failed: {}", e))
        })?;

        let block: Option<SubstrateBlock> = result.take(0).map_err(|e| {
            ServiceError::DatabaseError(format!("Latest substrate block extraction failed: {}", e))
        })?;

        Ok(block)
    }
}