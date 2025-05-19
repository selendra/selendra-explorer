use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::schema::events;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = events)]
pub struct Event {
    pub id: i32,
    pub block_hash: String,
    pub block_number: i64,
    pub extrinsic_hash: Option<String>,
    pub extrinsic_index: Option<i32>,
    pub event_index: i32,
    pub section: String,
    pub method: String,
    pub data: JsonValue,
    pub phase: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = events)]
pub struct NewEvent {
    pub block_hash: String,
    pub block_number: i64,
    pub extrinsic_hash: Option<String>,
    pub extrinsic_index: Option<i32>,
    pub event_index: i32,
    pub section: String,
    pub method: String,
    pub data: JsonValue,
    pub phase: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventResponse {
    pub id: i32,
    pub block_hash: String,
    pub block_number: i64,
    pub extrinsic_hash: Option<String>,
    pub extrinsic_index: Option<i32>,
    pub event_index: i32,
    pub section: String,
    pub method: String,
    pub data: JsonValue,
    pub phase: String,
    pub timestamp: NaiveDateTime,
}
