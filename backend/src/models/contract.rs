use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::contracts;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = contracts)]
pub struct Contract {
    pub address: String,
    pub creator_address: String,
    pub creator_transaction_hash: String,
    pub bytecode: String,
    pub abi: Option<String>,
    pub name: Option<String>,
    pub compiler_version: Option<String>,
    pub optimization_used: Option<bool>,
    pub runs: Option<i32>,
    pub verified: bool,
    pub verification_date: Option<NaiveDateTime>,
    pub license_type: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub contract_type: String,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = contracts)]
pub struct NewContract {
    pub address: String,
    pub creator_address: String,
    pub creator_transaction_hash: String,
    pub bytecode: String,
    pub abi: Option<String>,
    pub name: Option<String>,
    pub compiler_version: Option<String>,
    pub optimization_used: Option<bool>,
    pub runs: Option<i32>,
    pub verified: bool,
    pub verification_date: Option<NaiveDateTime>,
    pub license_type: Option<String>,
    pub contract_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContractResponse {
    pub address: String,
    pub creator_address: String,
    pub creator_transaction_hash: String,
    pub bytecode: String,
    pub abi: Option<String>,
    pub name: Option<String>,
    pub compiler_version: Option<String>,
    pub optimization_used: Option<bool>,
    pub runs: Option<i32>,
    pub verified: bool,
    pub verification_date: Option<NaiveDateTime>,
    pub license_type: Option<String>,
    pub balance: String,
    pub contract_type: String,
}
