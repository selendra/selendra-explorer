use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::tokens;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = tokens)]
pub struct Token {
    pub address: String,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub decimals: Option<i32>,
    pub total_supply: Option<String>,
    pub token_type: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = tokens)]
pub struct NewToken {
    pub address: String,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub decimals: Option<i32>,
    pub total_supply: Option<String>,
    pub token_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenResponse {
    pub address: String,
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub decimals: Option<i32>,
    pub total_supply: Option<String>,
    pub token_type: String,
    pub holder_count: i64,
    pub transfer_count: i64,
}
