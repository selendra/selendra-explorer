use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::token_transfers;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = token_transfers)]
pub struct TokenTransfer {
    pub id: i32,
    pub token_address: String,
    pub from_address: String,
    pub to_address: String,
    pub value: String,
    pub transaction_hash: String,
    pub log_index: i32,
    pub block_number: i64,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = token_transfers)]
pub struct NewTokenTransfer {
    pub token_address: String,
    pub from_address: String,
    pub to_address: String,
    pub value: String,
    pub transaction_hash: String,
    pub log_index: i32,
    pub block_number: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenTransferResponse {
    pub id: i32,
    pub token_address: String,
    pub token_name: Option<String>,
    pub token_symbol: Option<String>,
    pub token_decimals: Option<i32>,
    pub from_address: String,
    pub to_address: String,
    pub value: String,
    pub transaction_hash: String,
    pub log_index: i32,
    pub block_number: i64,
    pub timestamp: NaiveDateTime,
}
