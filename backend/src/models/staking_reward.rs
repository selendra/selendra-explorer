use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::schema::staking_rewards;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = staking_rewards)]
pub struct StakingReward {
    pub id: i32,
    pub address: String,
    pub validator_address: String,
    pub amount: String,
    pub era: i32,
    pub timestamp: NaiveDateTime,
    pub claimed: bool,
    pub claimed_at: Option<NaiveDateTime>,
    pub transaction_hash: Option<String>,
    pub metadata: Option<Value>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = staking_rewards)]
pub struct NewStakingReward {
    pub address: String,
    pub validator_address: String,
    pub amount: String,
    pub era: i32,
    pub timestamp: NaiveDateTime,
    pub claimed: bool,
    pub claimed_at: Option<NaiveDateTime>,
    pub transaction_hash: Option<String>,
    pub metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StakingRewardResponse {
    pub id: i32,
    pub address: String,
    pub validator_address: String,
    pub validator_name: Option<String>,
    pub amount: String,
    pub era: i32,
    pub timestamp: NaiveDateTime,
    pub claimed: bool,
    pub claimed_at: Option<NaiveDateTime>,
    pub transaction_hash: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StakingRewardsResponse {
    pub rewards: Vec<StakingRewardResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_rewards: String,
    pub total_claimed: String,
    pub total_unclaimed: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaimRewardRequest {
    pub reward_ids: Vec<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaimRewardResponse {
    pub success: bool,
    pub transaction_hash: Option<String>,
    pub claimed_rewards: Vec<i32>,
    pub total_claimed: String,
}
