pub mod block;
pub mod event;
pub mod extrinsic;

use surrealdb::{Surreal, engine::any::Any};

pub struct SubstrateBlockService<'a> {
    pub db: &'a Surreal<Any>,
}

pub struct SubstrateExtrinsicService<'a> {
    pub db: &'a Surreal<Any>,
}

pub struct SubstrateEventService<'a> {
    pub db: &'a Surreal<Any>,
}
