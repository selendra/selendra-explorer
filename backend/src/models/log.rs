use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::logs;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = logs)]
pub struct Log {
    pub id: i32,
    pub transaction_hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub address: String,
    pub data: String,
    pub log_index: i32,
    pub topic0: Option<String>,
    pub topic1: Option<String>,
    pub topic2: Option<String>,
    pub topic3: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = logs)]
pub struct NewLog {
    pub transaction_hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub address: String,
    pub data: String,
    pub log_index: i32,
    pub topic0: Option<String>,
    pub topic1: Option<String>,
    pub topic2: Option<String>,
    pub topic3: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogResponse {
    pub id: i32,
    pub transaction_hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub address: String,
    pub data: String,
    pub log_index: i32,
    pub topic0: Option<String>,
    pub topic1: Option<String>,
    pub topic2: Option<String>,
    pub topic3: Option<String>,
    pub timestamp: NaiveDateTime,
}
