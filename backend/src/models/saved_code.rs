use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::saved_code;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = saved_code)]
pub struct SavedCode {
    pub id: i32,
    pub user_address: String,
    pub code_name: String,
    pub code_content: String,
    pub language: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = saved_code)]
pub struct NewSavedCode {
    pub user_address: String,
    pub code_name: String,
    pub code_content: String,
    pub language: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedCodeResponse {
    pub id: i32,
    pub code_name: String,
    pub code_content: String,
    pub language: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedCodesResponse {
    pub user_address: String,
    pub codes: Vec<SavedCodeResponse>,
}
