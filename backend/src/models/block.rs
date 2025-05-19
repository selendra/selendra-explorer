use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::blocks;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = blocks)]
pub struct Block {
    pub hash: String,
    pub number: i64,
    pub timestamp: NaiveDateTime,
    pub parent_hash: String,
    pub author: Option<String>,
    pub state_root: String,
    pub transactions_root: String,
    pub receipts_root: String,
    pub gas_used: i64,
    pub gas_limit: i64,
    pub extra_data: Option<String>,
    pub logs_bloom: Option<String>,
    pub size: Option<i32>,
    pub difficulty: Option<String>,
    pub total_difficulty: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub consensus_engine: Option<String>,
    pub finalized: Option<bool>,
    pub extrinsics_root: Option<String>,
    pub validator_set: Option<String>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = blocks)]
pub struct NewBlock {
    pub hash: String,
    pub number: i64,
    pub timestamp: NaiveDateTime,
    pub parent_hash: String,
    pub author: Option<String>,
    pub state_root: String,
    pub transactions_root: String,
    pub receipts_root: String,
    pub gas_used: i64,
    pub gas_limit: i64,
    pub extra_data: Option<String>,
    pub logs_bloom: Option<String>,
    pub size: Option<i32>,
    pub difficulty: Option<String>,
    pub total_difficulty: Option<String>,
    pub consensus_engine: Option<String>,
    pub finalized: Option<bool>,
    pub extrinsics_root: Option<String>,
    pub validator_set: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlockResponse {
    pub hash: String,
    pub number: i64,
    pub timestamp: NaiveDateTime,
    pub parent_hash: String,
    pub author: Option<String>,
    pub state_root: String,
    pub transactions_root: String,
    pub receipts_root: String,
    pub gas_used: i64,
    pub gas_limit: i64,
    pub extra_data: Option<String>,
    pub logs_bloom: Option<String>,
    pub size: Option<i32>,
    pub difficulty: Option<String>,
    pub total_difficulty: Option<String>,
    pub consensus_engine: Option<String>,
    pub finalized: Option<bool>,
    pub extrinsics_root: Option<String>,
    pub validator_set: Option<String>,
    pub transaction_count: i64,
    pub extrinsic_count: Option<i64>,
}
