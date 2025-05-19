use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::transactions;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = transactions)]
pub struct Transaction {
    pub hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub from_address: String,
    pub to_address: Option<String>,
    pub value: String,
    pub gas: i64,
    pub gas_price: i64,
    pub input: Option<String>,
    pub nonce: i32,
    pub transaction_index: i32,
    pub status: Option<bool>,
    pub transaction_type: Option<i32>,
    pub max_fee_per_gas: Option<i64>,
    pub max_priority_fee_per_gas: Option<i64>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub execution_type: String,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = transactions)]
pub struct NewTransaction {
    pub hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub from_address: String,
    pub to_address: Option<String>,
    pub value: String,
    pub gas: i64,
    pub gas_price: i64,
    pub input: Option<String>,
    pub nonce: i32,
    pub transaction_index: i32,
    pub status: Option<bool>,
    pub transaction_type: Option<i32>,
    pub max_fee_per_gas: Option<i64>,
    pub max_priority_fee_per_gas: Option<i64>,
    pub execution_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionResponse {
    pub hash: String,
    pub block_hash: String,
    pub block_number: i64,
    pub from_address: String,
    pub to_address: Option<String>,
    pub value: String,
    pub gas: i64,
    pub gas_price: i64,
    pub input: Option<String>,
    pub nonce: i32,
    pub transaction_index: i32,
    pub status: Option<bool>,
    pub transaction_type: Option<i32>,
    pub max_fee_per_gas: Option<i64>,
    pub max_priority_fee_per_gas: Option<i64>,
    pub execution_type: String,
    pub logs: Vec<crate::models::log::Log>,
}
