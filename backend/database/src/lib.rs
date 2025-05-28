pub mod evm;
pub mod substrate;

use custom_error::ServiceError;
use evm::EvmBlockService;
use surrealdb::{
    Surreal,
    engine::remote::ws::{Client, Ws},
    opt::auth::Root,
};

pub struct DatabaseService {
    pub db: Surreal<Client>,
}

impl DatabaseService {
    pub async fn new(
        url: &str,
        username: &str,
        password: &str,
        namespace: &str,
        database: &str,
    ) -> Result<Self, ServiceError> {
        let db = Surreal::new::<Ws>(url)
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
}
