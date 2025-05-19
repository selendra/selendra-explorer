use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

use crate::schema::wallet_staking;

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = wallet_staking)]
pub struct WalletStaking {
    pub id: i32,
    pub address: String,
    pub validator_address: String,
    pub amount: String,
    pub reward_address: Option<String>,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = wallet_staking)]
pub struct NewWalletStaking {
    pub address: String,
    pub validator_address: String,
    pub amount: String,
    pub reward_address: Option<String>,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletStakingResponse {
    pub validator_address: String,
    pub validator_name: Option<String>,
    pub amount: String,
    pub reward_address: Option<String>,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub estimated_rewards: Option<String>,
    pub commission_rate: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletStakingsResponse {
    pub address: String,
    pub stakings: Vec<WalletStakingResponse>,
    pub total_staked: String,
    pub total_rewards: Option<String>,
}
