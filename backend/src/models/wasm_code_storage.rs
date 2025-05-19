use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::wasm_code_storage;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = wasm_code_storage)]
pub struct WasmCodeStorage {
    pub code_hash: String,
    pub code: Vec<u8>,
    pub uploaded_by: String,
    pub upload_extrinsic_hash: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = wasm_code_storage)]
pub struct NewWasmCodeStorage {
    pub code_hash: String,
    pub code: Vec<u8>,
    pub uploaded_by: String,
    pub upload_extrinsic_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WasmCodeStorageResponse {
    pub code_hash: String,
    pub size: usize,
    pub uploaded_by: String,
    pub upload_extrinsic_hash: String,
    pub created_at: NaiveDateTime,
    pub contract_count: i64,
}
