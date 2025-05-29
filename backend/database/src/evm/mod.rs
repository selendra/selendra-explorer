pub mod block;
pub mod transaction;

use surrealdb::{engine::any::Any, Surreal};

pub struct EvmBlockService<'a> {
    pub db: &'a Surreal<Any>,
}

pub struct TransactionService<'a> {
    pub db: &'a Surreal<Any>,
}