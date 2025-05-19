use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::schema::wasm_contract_calls;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = wasm_contract_calls)]
pub struct WasmContractCall {
    pub id: i32,
    pub extrinsic_hash: String,
    pub contract_address: String,
    pub method: String,
    pub args: Option<JsonValue>,
    pub value: Option<String>,
    pub gas_limit: Option<i64>,
    pub gas_used: Option<i64>,
    pub success: bool,
    pub return_data: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = wasm_contract_calls)]
pub struct NewWasmContractCall {
    pub extrinsic_hash: String,
    pub contract_address: String,
    pub method: String,
    pub args: Option<JsonValue>,
    pub value: Option<String>,
    pub gas_limit: Option<i64>,
    pub gas_used: Option<i64>,
    pub success: bool,
    pub return_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WasmContractCallResponse {
    pub id: i32,
    pub extrinsic_hash: String,
    pub contract_address: String,
    pub method: String,
    pub args: Option<JsonValue>,
    pub value: Option<String>,
    pub gas_limit: Option<i64>,
    pub gas_used: Option<i64>,
    pub success: bool,
    pub return_data: Option<String>,
    pub timestamp: NaiveDateTime,
    pub block_number: i64,
}
