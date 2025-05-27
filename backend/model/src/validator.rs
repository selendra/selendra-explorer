use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveValidator {
    pub account_id: String,
    pub prefs: ValidatorPrefs,
    pub validator_type: ValidatorType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorPrefs {
    pub commission: f64,
    pub blocked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidatorType {
    Reserved,
    NonReserved 
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveEra {
    pub era: u32,
    pub start_time: u64,
    pub start_session: u32,
    pub end_session: u32,
}