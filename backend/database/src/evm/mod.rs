mod block;
mod transaction;
mod account;
mod contract;

use surrealdb::{engine::any::Any, Surreal};

pub struct EvmBlockService<'a> {
    pub db: &'a Surreal<Any>,
}

pub struct TransactionService<'a> {
    pub db: &'a Surreal<Any>,
}

pub struct AccountService<'a> {
    pub db: &'a Surreal<Any>,
}

pub struct ContractService<'a> {
    pub db: &'a Surreal<Any>,
}