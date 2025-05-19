use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::saved_contracts;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = saved_contracts)]
pub struct SavedContract {
    pub id: i32,
    pub user_address: String,
    pub contract_address: String,
    pub contract_name: Option<String>,
    pub contract_type: String,
    pub list_name: String,
    pub notes: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = saved_contracts)]
pub struct NewSavedContract {
    pub user_address: String,
    pub contract_address: String,
    pub contract_name: Option<String>,
    pub contract_type: String,
    pub list_name: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedContractResponse {
    pub id: i32,
    pub contract_address: String,
    pub contract_name: Option<String>,
    pub contract_type: String,
    pub list_name: String,
    pub notes: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedContractsResponse {
    pub user_address: String,
    pub contracts: Vec<SavedContractResponse>,
    pub lists: Vec<String>,
}
