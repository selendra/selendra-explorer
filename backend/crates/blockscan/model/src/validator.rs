use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveValidator {
    pub account_id: String,
    pub prefs: ValidatorPrefs,
    pub validator_type: ValidatorType,
    pub staking_info: StakingInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorPrefs {
    pub commission: f64,
    pub blocked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidatorType {
    Reserved,
    NonReserved,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveEra {
    pub era: u32,
    pub start_time: u64,
    pub start_session: u32,
    pub current_session: u32,
    pub end_session: u32,
    pub total_stake: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakingInfo {
    pub total: u128,
    pub own: u128,
    pub nominator_count: u32,
}