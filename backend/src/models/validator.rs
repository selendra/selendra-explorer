use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::schema::validators;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = validators)]
pub struct Validator {
    pub id: i32,
    pub address: String,
    pub name: Option<String>,
    pub identity: Option<String>,
    pub total_stake: String,
    pub self_stake: String,
    pub commission_rate: f64,
    pub active: bool,
    pub blocks_produced: i32,
    pub uptime_percentage: f64,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub metadata: Option<Value>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = validators)]
pub struct NewValidator {
    pub address: String,
    pub name: Option<String>,
    pub identity: Option<String>,
    pub total_stake: String,
    pub self_stake: String,
    pub commission_rate: f64,
    pub active: bool,
    pub blocks_produced: i32,
    pub uptime_percentage: f64,
    pub metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorResponse {
    pub address: String,
    pub name: Option<String>,
    pub identity: Option<String>,
    pub total_stake: String,
    pub self_stake: String,
    pub commission_rate: f64,
    pub active: bool,
    pub blocks_produced: i32,
    pub uptime_percentage: f64,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub delegator_count: i32,
    pub apy: Option<f64>,
    pub metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorsResponse {
    pub validators: Vec<ValidatorResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorStatsResponse {
    pub total_validators: i64,
    pub active_validators: i64,
    pub total_staked: String,
    pub average_commission: f64,
    pub average_apy: Option<f64>,
}
