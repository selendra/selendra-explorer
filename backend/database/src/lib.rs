pub mod evm;
pub mod substrate;

use custom_error::ServiceError;
use evm::{EvmBlockService, TransactionService};
use surrealdb::{
    Surreal,
    engine::any,
    opt::auth::Root,
};

#[derive(Clone)]
pub struct DatabaseService {
    pub db: Surreal<any::Any>,
}

impl DatabaseService {
    pub async fn new(
        url: &str,
        username: &str,
        password: &str,
        namespace: &str,
        database: &str,
    ) -> Result<Self, ServiceError> {
        let db = any::connect(url)
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        db.signin(Root { username, password })
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        // Select a specific namespace / database
        db.use_ns(namespace)
            .use_db(database)
            .await
            .map_err(|e| ServiceError::DatabaseError(e.to_string()))?;

        Ok(Self { db })
    }

    pub fn evm_blocks(&self) -> EvmBlockService {
        EvmBlockService { db: &self.db }
    }

    pub fn transactions(&self) -> TransactionService {
        TransactionService { db: &self.db }
    }
}
