use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::accounts;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = accounts)]
pub struct Account {
    pub address: String,
    pub balance: String,
    pub nonce: i32,
    pub code: Option<String>,
    pub is_contract: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = accounts)]
pub struct NewAccount {
    pub address: String,
    pub balance: String,
    pub nonce: i32,
    pub code: Option<String>,
    pub is_contract: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountResponse {
    pub address: String,
    pub balance: String,
    pub nonce: i32,
    pub is_contract: bool,
    pub transaction_count: i64,
}
