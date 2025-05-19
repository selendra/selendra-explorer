use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::schema::extrinsics;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = extrinsics)]
pub struct Extrinsic {
    pub hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub index: i32,
    pub signer: Option<String>,
    pub section: String,
    pub method: String,
    pub args: Option<JsonValue>,
    pub success: bool,
    pub is_signed: bool,
    pub signature: Option<String>,
    pub nonce: Option<i32>,
    pub tip: Option<i64>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = extrinsics)]
pub struct NewExtrinsic {
    pub hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub index: i32,
    pub signer: Option<String>,
    pub section: String,
    pub method: String,
    pub args: Option<JsonValue>,
    pub success: bool,
    pub is_signed: bool,
    pub signature: Option<String>,
    pub nonce: Option<i32>,
    pub tip: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtrinsicResponse {
    pub hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub index: i32,
    pub signer: Option<String>,
    pub section: String,
    pub method: String,
    pub args: Option<JsonValue>,
    pub success: bool,
    pub is_signed: bool,
    pub signature: Option<String>,
    pub nonce: Option<i32>,
    pub tip: Option<i64>,
    pub timestamp: NaiveDateTime,
    pub event_count: i64,
}
