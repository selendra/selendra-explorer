pub mod block;

use surrealdb::{engine::remote::ws::Client, Surreal};

pub struct EvmBlockService<'a> {
    pub db: &'a Surreal<Client>,
}
