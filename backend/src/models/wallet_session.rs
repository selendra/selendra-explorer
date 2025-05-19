use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::schema::wallet_sessions;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = wallet_sessions)]
pub struct WalletSession {
    pub id: i32,
    pub address: String,
    pub session_token: String,
    pub wallet_type: String,
    pub last_active: NaiveDateTime,
    pub created_at: NaiveDateTime,
    pub expires_at: NaiveDateTime,
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = wallet_sessions)]
pub struct NewWalletSession {
    pub address: String,
    pub session_token: String,
    pub wallet_type: String,
    pub last_active: NaiveDateTime,
    pub expires_at: NaiveDateTime,
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletSessionResponse {
    pub address: String,
    pub wallet_type: String,
    pub created_at: NaiveDateTime,
    pub expires_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletConnectRequest {
    pub address: String,
    pub wallet_type: String,
    pub signature: String,
    pub message: String,
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletConnectResponse {
    pub session_token: String,
    pub address: String,
    pub wallet_type: String,
    pub expires_at: NaiveDateTime,
}
