mod account;
mod block;
mod contract;
mod transaction;

use surrealdb::{Surreal, engine::any::Any};

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
