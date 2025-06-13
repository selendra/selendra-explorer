use config::SUBSTRATE_EVENTS_TABLE;
use custom_error::ServiceError;
use models::substrate::SubstrateEvent;

use super::SubstrateEventService;

impl<'a> SubstrateEventService<'a> {
    pub async fn save(&self, event: &SubstrateEvent) -> Result<SubstrateEvent, ServiceError> {
        let created: SubstrateEvent = self
            .db
            .create(SUBSTRATE_EVENTS_TABLE)
            .content(event.clone())
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Substrate event save failed: {}", e)))?
            .ok_or_else(|| {
                ServiceError::DatabaseError("Failed to create substrate event record".to_string())
            })?;

        Ok(created)
    }

    pub async fn save_batch(&self, events: &[SubstrateEvent]) -> Result<Vec<SubstrateEvent>, ServiceError> {
        let mut saved_events = Vec::new();
        
        for event in events {
            match self.save(event).await {
                Ok(saved) => saved_events.push(saved),
                Err(e) => {
                    println!("❌ Failed to save event {} in block {}: {}", 
                        event.event_index, event.block_number, e);
                    // Continue with other events
                }
            }
        }
        
        Ok(saved_events)
    }

    pub async fn get_by_block_number(&self, block_number: u32) -> Result<Vec<SubstrateEvent>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE block_number = $block_number ORDER BY event_index ASC",
            SUBSTRATE_EVENTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Events by block query failed: {}", e)))?;

        let events: Vec<SubstrateEvent> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Events by block extraction failed: {}", e)))?;

        Ok(events)
    }

    pub async fn get_by_module(&self, module: &str, limit: u32) -> Result<Vec<SubstrateEvent>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE module = $module ORDER BY timestamp DESC LIMIT $limit",
            SUBSTRATE_EVENTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("module", module.to_string()))
            .bind(("limit", limit))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Events by module query failed: {}", e)))?;

        let events: Vec<SubstrateEvent> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Events by module extraction failed: {}", e)))?;

        Ok(events)
    }

    pub async fn get_by_event_name(&self, event_name: &str, limit: u32) -> Result<Vec<SubstrateEvent>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE event = $event ORDER BY timestamp DESC LIMIT $limit",
            SUBSTRATE_EVENTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("event", event_name.to_string()))
            .bind(("limit", limit))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Events by name query failed: {}", e)))?;

        let events: Vec<SubstrateEvent> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Events by name extraction failed: {}", e)))?;

        Ok(events)
    }

    pub async fn get_by_module_and_event(
        &self, 
        module: &str, 
        event_name: &str,
        limit: u32
    ) -> Result<Vec<SubstrateEvent>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} WHERE module = $module AND event = $event ORDER BY timestamp DESC LIMIT $limit",
            SUBSTRATE_EVENTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("module", module.to_string()))
            .bind(("event", event_name.to_string()))
            .bind(("limit", limit))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Events by module/event query failed: {}", e)))?;

        let events: Vec<SubstrateEvent> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Events by module/event extraction failed: {}", e)))?;

        Ok(events)
    }

    pub async fn get_all(&self, limit: u32, offset: u32) -> Result<Vec<SubstrateEvent>, ServiceError> {
        let query = format!(
            "SELECT * FROM {} ORDER BY timestamp DESC LIMIT $limit START $offset",
            SUBSTRATE_EVENTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("limit", limit))
            .bind(("offset", offset))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("All events query failed: {}", e)))?;

        let events: Vec<SubstrateEvent> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("All events extraction failed: {}", e)))?;

        Ok(events)
    }

    pub async fn count_by_block_number(&self, block_number: u32) -> Result<i64, ServiceError> {
        let query = format!(
            "SELECT VALUE count() FROM {} WHERE block_number = $block_number",
            SUBSTRATE_EVENTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("block_number", block_number))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Events count query failed: {}", e)))?;

        let count: Option<i64> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Events count extraction failed: {}", e)))?;

        Ok(count.unwrap_or(0))
    }

    pub async fn get_recent_events(&self, hours: u32, limit: u32) -> Result<Vec<SubstrateEvent>, ServiceError> {
        let current_timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let cutoff_timestamp = current_timestamp - (hours as u64 * 3600);

        let query = format!(
            "SELECT * FROM {} WHERE timestamp >= $cutoff ORDER BY timestamp DESC LIMIT $limit",
            SUBSTRATE_EVENTS_TABLE
        );
        let mut result = self
            .db
            .query(query)
            .bind(("cutoff", cutoff_timestamp))
            .bind(("limit", limit))
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Recent events query failed: {}", e)))?;

        let events: Vec<SubstrateEvent> = result
            .take(0)
            .map_err(|e| ServiceError::DatabaseError(format!("Recent events extraction failed: {}", e)))?;

        Ok(events)
    }
}