use config::SUBSTRATE_EXTRINSICS_TABLE;
use custom_error::ServiceError;
use models::substrate::SubstrateExtrinsic;

use super::SubstrateExtrinsicService;

impl<'a> SubstrateExtrinsicService<'a> {
    pub async fn save(&self, extrinsic: &SubstrateExtrinsic) -> Result<SubstrateExtrinsic, ServiceError> {
        let created: SubstrateExtrinsic = self
            .db
            .create(SUBSTRATE_EXTRINSICS_TABLE)
            .content(extrinsic.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Substrate extrinsic save failed: {}", e)))?
            .ok_or_else(|| {
                ServiceError::DatabaseError("Failed to create substrate extrinsic record".to_string())
            })?;

        Ok(created)
    }

    pub async fn save_batch(&self, extrinsics: &[SubstrateExtrinsic]) -> Result<Vec<SubstrateExtrinsic>, ServiceError> {
        let mut saved_extrinsics = Vec::new();
        
        for extrinsic in extrinsics {
            match self.save(extrinsic).await {
                Ok(saved) => saved_extrinsics.push(saved),
                Err(e) => {
                    println!("❌ Failed to save extrinsic {} in block {}: {}", 
                        extrinsic.extrinsic_index, extrinsic.block_number, e);
                    // Continue with other extrinsics
                }
            }
        }
        
        Ok(saved_extrinsics)
    }

    pub async fn get_by_block_number(&self, block_number: u32) -> Result<Vec<SubstrateExtrinsic>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE block_number = $block_number ORDER BY extrinsic_index ASC",
            SUBSTRATE_EXTRINSICS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics by block query failed: {}", e)))?;

        let extrinsics: Vec<SubstrateExtrinsic> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics by block extraction failed: {}", e)))?;

        Ok(extrinsics)
    }

    pub async fn get_by_signer(&self, signer: &str, limit: u32) -> Result<Vec<SubstrateExtrinsic>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE signer = $signer ORDER BY timestamp DESC LIMIT $limit",
            SUBSTRATE_EXTRINSICS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("signer", signer.to_string()))
            .bind(("limit", limit))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics by signer query failed: {}", e)))?;

        let extrinsics: Vec<SubstrateExtrinsic> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics by signer extraction failed: {}", e)))?;

        Ok(extrinsics)
    }

    pub async fn get_by_module_and_function(
        &self, 
        module: &str, 
        function: &str,
        limit: u32
    ) -> Result<Vec<SubstrateExtrinsic>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE call_module = $module AND call_function = $function ORDER BY timestamp DESC LIMIT $limit",
            SUBSTRATE_EXTRINSICS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("module", module.to_string()))
            .bind(("function", function.to_string()))
            .bind(("limit", limit))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics by module/function query failed: {}", e)))?;

        let extrinsics: Vec<SubstrateExtrinsic> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics by module/function extraction failed: {}", e)))?;

        Ok(extrinsics)
    }

    pub async fn get_all(&self, limit: u32, offset: u32) -> Result<Vec<SubstrateExtrinsic>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} ORDER BY timestamp DESC LIMIT $limit START $offset",
            SUBSTRATE_EXTRINSICS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("limit", limit))
            .bind(("offset", offset))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("All extrinsics query failed: {}", e)))?;

        let extrinsics: Vec<SubstrateExtrinsic> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("All extrinsics extraction failed: {}", e)))?;

        Ok(extrinsics)
    }

    pub async fn count_by_block_number(&self, block_number: u32) -> Result<i64, ServiceError> {
        let query = format!(
            "SELECT VALUE count() FROM {} WHERE block_number = $block_number",
            SUBSTRATE_EXTRINSICS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics count query failed: {}", e)))?;

        let count: Option<i64> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Extrinsics count extraction failed: {}", e)))?;

        Ok(count.unwrap_or(0))
    }
}