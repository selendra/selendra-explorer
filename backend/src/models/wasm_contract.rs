use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::schema::wasm_contracts;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = wasm_contracts)]
pub struct WasmContract {
    pub address: String,
    pub creator_address: String,
    pub creator_extrinsic_hash: String,
    pub code_hash: String,
    pub init_args: Option<JsonValue>,
    pub contract_type: String,
    pub metadata: Option<JsonValue>,
    pub verified: bool,
    pub verification_date: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = wasm_contracts)]
pub struct NewWasmContract {
    pub address: String,
    pub creator_address: String,
    pub creator_extrinsic_hash: String,
    pub code_hash: String,
    pub init_args: Option<JsonValue>,
    pub contract_type: String,
    pub metadata: Option<JsonValue>,
    pub verified: bool,
    pub verification_date: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WasmContractResponse {
    pub address: String,
    pub creator_address: String,
    pub creator_extrinsic_hash: String,
    pub code_hash: String,
    pub init_args: Option<JsonValue>,
    pub contract_type: String,
    pub metadata: Option<JsonValue>,
    pub verified: bool,
    pub verification_date: Option<NaiveDateTime>,
    pub balance: Option<String>,
    pub call_count: i64,
}
