use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::schema::wallet_assets;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = wallet_assets)]
pub struct WalletAsset {
    pub id: i32,
    pub address: String,
    pub asset_type: String,
    pub asset_address: Option<String>,
    pub balance: String,
    pub last_updated: NaiveDateTime,
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = wallet_assets)]
pub struct NewWalletAsset {
    pub address: String,
    pub asset_type: String,
    pub asset_address: Option<String>,
    pub balance: String,
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletAssetResponse {
    pub asset_type: String,
    pub asset_address: Option<String>,
    pub balance: String,
    pub last_updated: NaiveDateTime,
    pub metadata: Option<JsonValue>,
    pub symbol: Option<String>,
    pub name: Option<String>,
    pub decimals: Option<i32>,
    pub value_usd: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletAssetsResponse {
    pub address: String,
    pub assets: Vec<WalletAssetResponse>,
    pub total_value_usd: Option<f64>,
}
