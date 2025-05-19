use actix_web::{get, post, web, HttpResponse, Responder};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use chrono::{Duration, NaiveDateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

use crate::db::{get_connection, DbPool};
use crate::models::staking_reward::{
    ClaimRewardRequest, ClaimRewardResponse, StakingReward, StakingRewardResponse,
    StakingRewardsResponse,
};
use crate::models::validator::{Validator, ValidatorResponse};
use crate::models::wallet_asset::{WalletAsset, WalletAssetResponse, WalletAssetsResponse};
use crate::models::wallet_session::{
    NewWalletSession, WalletConnectRequest, WalletConnectResponse, WalletSession,
};
use crate::models::wallet_staking::{
    NewWalletStaking, WalletStaking, WalletStakingResponse, WalletStakingsResponse,
};
use crate::schema::staking_rewards::dsl as rewards_dsl;
use crate::schema::tokens::dsl as tokens_dsl;
use crate::schema::validators::dsl as validators_dsl;
use crate::schema::wallet_assets::dsl as assets_dsl;
use crate::schema::wallet_sessions::dsl as sessions_dsl;
use crate::schema::wallet_staking::dsl as staking_dsl;

// Helper function to verify wallet signature
fn verify_signature(address: &str, message: &str, signature: &str, wallet_type: &str) -> bool {
    // In a real implementation, this would verify the signature against the message
    // using the appropriate cryptographic method for the wallet type
    // For now, we'll just return true for testing purposes
    true
}

#[post("/wallet/connect")]
async fn connect_wallet(
    pool: web::Data<DbPool>,
    wallet_data: web::Json<WalletConnectRequest>,
) -> impl Responder {
    let wallet_data = wallet_data.into_inner();

    // Verify the signature
    if !verify_signature(
        &wallet_data.address,
        &wallet_data.message,
        &wallet_data.signature,
        &wallet_data.wallet_type,
    ) {
        return HttpResponse::Unauthorized().json("Invalid signature");
    }

    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    // Generate a session token
    let session_token = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();
    let expires_at = now + Duration::days(7); // Session expires in 7 days

    let new_session = NewWalletSession {
        address: wallet_data.address.clone(),
        session_token: session_token.clone(),
        wallet_type: wallet_data.wallet_type.clone(),
        last_active: now,
        expires_at,
        metadata: wallet_data.metadata,
    };

    let result = web::block(move || {
        diesel::insert_into(sessions_dsl::wallet_sessions)
            .values(&new_session)
            .execute(&conn)
    })
    .await;

    match result {
        Ok(_) => {
            let response = WalletConnectResponse {
                session_token,
                address: wallet_data.address,
                wallet_type: wallet_data.wallet_type,
                expires_at,
            };
            HttpResponse::Ok().json(response)
        }
        Err(_) => HttpResponse::InternalServerError().json("Failed to create wallet session"),
    }
}

#[post("/wallet/disconnect")]
async fn disconnect_wallet(pool: web::Data<DbPool>, auth_header: BearerAuth) -> impl Responder {
    let session_token = auth_header.token();

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let result = web::block(move || {
        diesel::delete(
            sessions_dsl::wallet_sessions.filter(sessions_dsl::session_token.eq(session_token)),
        )
        .execute(&mut conn)
    })
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json("Wallet disconnected successfully"),
        Err(_) => HttpResponse::InternalServerError().json("Failed to disconnect wallet"),
    }
}

#[get("/wallet/assets")]
async fn get_wallet_assets(pool: web::Data<DbPool>, auth_header: BearerAuth) -> impl Responder {
    let session_token = auth_header.token();

    let mut conn_session = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    // First, validate the session token
    let session_token_clone_for_validation = session_token.to_string();
    let session_result = web::block(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token_clone_for_validation))
            .filter(sessions_dsl::expires_at.gt(Utc::now().naive_utc()))
            .first::<WalletSession>(&mut conn_session)
    })
    .await;

    let session = match session_result {
        Ok(session) => session,
        Err(_) => return HttpResponse::Unauthorized().json("Invalid or expired session"),
    };

    // Now get the assets for this wallet
    let mut conn_assets = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let assets_result = web::block(move || {
        let assets = assets_dsl::wallet_assets
            .filter(assets_dsl::address.eq(&session.address))
            .load::<WalletAsset>(&mut conn_assets)?;

        let mut asset_responses = Vec::new();
        let mut total_value_usd = 0.0;

        for asset in assets {
            let mut symbol = None;
            let mut name = None;
            let mut decimals = None;

            // If this is a token, get additional info
            if asset.asset_type == "token" && asset.asset_address.is_some() {
                if let Some(asset_addr) = &asset.asset_address {
                    if let Ok(token) = tokens_dsl::tokens
                        .filter(tokens_dsl::address.eq(asset_addr))
                        .select((tokens_dsl::symbol, tokens_dsl::name, tokens_dsl::decimals))
                        .first::<(Option<String>, Option<String>, Option<i32>)>(&mut conn_assets)
                    {
                        symbol = token.0;
                        name = token.1;
                        decimals = token.2;
                    }
                }
            }

            // Extract value_usd from metadata if available
            let value_usd = if let Some(metadata) = &asset.metadata {
                metadata.get("value_usd").and_then(|v| v.as_f64())
            } else {
                None
            };

            if let Some(value) = value_usd {
                total_value_usd += value;
            }

            asset_responses.push(WalletAssetResponse {
                asset_type: asset.asset_type,
                asset_address: asset.asset_address,
                balance: asset.balance,
                last_updated: asset.last_updated,
                metadata: asset.metadata,
                symbol,
                name,
                decimals,
                value_usd,
            });
        }

        Ok::<_, diesel::result::Error>(WalletAssetsResponse {
            address: session.address,
            assets: asset_responses,
            total_value_usd: Some(total_value_usd),
        })
    })
    .await;

    match assets_result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch wallet assets"),
    }
}

#[get("/wallet/staking")]
async fn get_wallet_staking(pool: web::Data<DbPool>, auth_header: BearerAuth) -> impl Responder {
    let session_token = auth_header.token();

    let mut conn_session_staking = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    // First, validate the session token
    let session_token_clone_for_staking_validation = session_token.to_string();
    let session_result = web::block(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token_clone_for_staking_validation))
            .filter(sessions_dsl::expires_at.gt(Utc::now().naive_utc()))
            .first::<WalletSession>(&mut conn_session_staking)
    })
    .await;

    let session = match session_result {
        Ok(session) => session,
        Err(_) => return HttpResponse::Unauthorized().json("Invalid or expired session"),
    };

    // Now get the staking info for this wallet
    let mut conn_staking_info = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let staking_result = web::block(move || {
        let stakings = staking_dsl::wallet_staking
            .filter(staking_dsl::address.eq(&session.address))
            .load::<WalletStaking>(&mut conn_staking_info)?;

        let mut staking_responses = Vec::new();
        let mut total_staked = 0.0;
        let mut total_rewards = 0.0;

        for staking in stakings {
            // In a real implementation, we would fetch validator info from the blockchain
            let validator_name = Some(format!(
                "Validator {}",
                staking
                    .validator_address
                    .chars()
                    .take(8)
                    .collect::<String>()
            ));

            // Parse amount to calculate totals
            if let Ok(amount) = staking.amount.parse::<f64>() {
                total_staked += amount;
            }

            // In a real implementation, we would calculate estimated rewards based on validator performance
            let estimated_rewards = Some(format!("{}", total_staked * 0.05)); // Assume 5% APY for example

            if let Ok(rewards) = estimated_rewards.as_ref().unwrap().parse::<f64>() {
                total_rewards += rewards;
            }

            staking_responses.push(WalletStakingResponse {
                validator_address: staking.validator_address,
                validator_name,
                amount: staking.amount,
                reward_address: staking.reward_address,
                status: staking.status,
                created_at: staking.created_at,
                updated_at: staking.updated_at,
                estimated_rewards,
                commission_rate: Some(0.05), // Example commission rate
            });
        }

        Ok::<_, diesel::result::Error>(WalletStakingsResponse {
            address: session.address,
            stakings: staking_responses,
            total_staked: total_staked.to_string(),
            total_rewards: Some(total_rewards.to_string()),
        })
    })
    .await;

    match staking_result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch wallet staking info"),
    }
}

#[derive(Debug, Deserialize)]
pub struct StakeRequest {
    pub validator_address: String,
    pub amount: String,
    pub reward_address: Option<String>,
}

#[post("/wallet/stake")]
async fn stake_tokens(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    stake_data: web::Json<StakeRequest>,
) -> impl Responder {
    let session_token = auth_header.token();

    let mut conn_session = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    // First, validate the session token
    let session_token_clone = session_token.to_string();
    let session_result = web::block(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token_clone))
            .filter(sessions_dsl::expires_at.gt(Utc::now().naive_utc()))
            .first::<WalletSession>(&mut conn_session)
    })
    .await;

    let session = match session_result {
        Ok(session) => session,
        Err(_) => return HttpResponse::Unauthorized().json("Invalid or expired session"),
    };

    // Validate the validator exists
    let mut conn_validator = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let validator_address = stake_data.validator_address.clone();
    let validator_result = web::block(move || {
        validators_dsl::validators
            .filter(validators_dsl::address.eq(validator_address))
            .filter(validators_dsl::active.eq(true))
            .first::<Validator>(&mut conn_validator)
    })
    .await;

    if validator_result.is_err() {
        return HttpResponse::BadRequest().json("Validator not found or not active");
    }

    // Create the staking record
    let mut conn_stake = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let new_staking = NewWalletStaking {
        address: session.address.clone(),
        validator_address: stake_data.validator_address.clone(),
        amount: stake_data.amount.clone(),
        reward_address: stake_data.reward_address.clone(),
        status: "active".to_string(),
    };

    let stake_result = web::block(move || {
        diesel::insert_into(staking_dsl::wallet_staking)
            .values(&new_staking)
            .execute(&mut conn_stake)
    })
    .await;

    match stake_result {
        Ok(_) => {
            // In a real implementation, we would also update the validator's total_stake
            // and the user's balance
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Tokens staked successfully",
                "validator_address": stake_data.validator_address,
                "amount": stake_data.amount,
                "status": "active"
            }))
        }
        Err(_) => HttpResponse::InternalServerError().json("Failed to stake tokens"),
    }
}

#[derive(Debug, Deserialize)]
pub struct UnstakeRequest {
    pub staking_id: i32,
}

#[post("/wallet/unstake")]
async fn unstake_tokens(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    unstake_data: web::Json<UnstakeRequest>,
) -> impl Responder {
    let session_token = auth_header.token();

    let mut conn_session = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    // First, validate the session token
    let session_token_clone = session_token.to_string();
    let session_result = web::block(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token_clone))
            .filter(sessions_dsl::expires_at.gt(Utc::now().naive_utc()))
            .first::<WalletSession>(&mut conn_session)
    })
    .await;

    let session = match session_result {
        Ok(session) => session,
        Err(_) => return HttpResponse::Unauthorized().json("Invalid or expired session"),
    };

    // Get the staking record and verify ownership
    let mut conn_staking = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let staking_id = unstake_data.staking_id;
    let address_clone = session.address.clone();
    let staking_result = web::block(move || {
        staking_dsl::wallet_staking
            .filter(staking_dsl::id.eq(staking_id))
            .filter(staking_dsl::address.eq(address_clone))
            .filter(staking_dsl::status.eq("active"))
            .first::<WalletStaking>(&mut conn_staking)
    })
    .await;

    let staking = match staking_result {
        Ok(staking) => staking,
        Err(_) => return HttpResponse::NotFound().json("Staking position not found or not active"),
    };

    // Update the staking status to "unbonding"
    let mut conn_update = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let staking_id = staking.id;
    let update_result = web::block(move || {
        diesel::update(staking_dsl::wallet_staking.filter(staking_dsl::id.eq(staking_id)))
            .set((
                staking_dsl::status.eq("unbonding"),
                staking_dsl::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn_update)
    })
    .await;

    match update_result {
        Ok(_) => {
            // In a real implementation, we would also update the validator's total_stake
            // and schedule the return of funds after the unbonding period
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Unbonding process started",
                "staking_id": staking_id,
                "status": "unbonding"
            }))
        }
        Err(_) => HttpResponse::InternalServerError().json("Failed to start unbonding process"),
    }
}

#[get("/wallet/rewards")]
async fn get_wallet_rewards(pool: web::Data<DbPool>, auth_header: BearerAuth) -> impl Responder {
    let session_token = auth_header.token();

    let mut conn_session = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    // First, validate the session token
    let session_token_clone = session_token.to_string();
    let session_result = web::block(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token_clone))
            .filter(sessions_dsl::expires_at.gt(Utc::now().naive_utc()))
            .first::<WalletSession>(&mut conn_session)
    })
    .await;

    let session = match session_result {
        Ok(session) => session,
        Err(_) => return HttpResponse::Unauthorized().json("Invalid or expired session"),
    };

    // Get the rewards for this wallet
    let mut conn_rewards = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let address_clone = session.address.clone();
    let rewards_result = web::block(move || {
        let rewards = rewards_dsl::staking_rewards
            .filter(rewards_dsl::address.eq(address_clone))
            .order(rewards_dsl::timestamp.desc())
            .load::<StakingReward>(&mut conn_rewards)?;

        let mut reward_responses = Vec::new();
        let mut total_rewards = 0.0;
        let mut total_claimed = 0.0;
        let mut total_unclaimed = 0.0;

        for reward in rewards {
            // Get validator name
            let validator_name = if let Ok(validator) = validators_dsl::validators
                .filter(validators_dsl::address.eq(&reward.validator_address))
                .select(validators_dsl::name)
                .first::<Option<String>>(&mut conn_rewards)
            {
                validator
            } else {
                None
            };

            // Parse amount to calculate totals
            if let Ok(amount) = reward.amount.parse::<f64>() {
                total_rewards += amount;
                if reward.claimed {
                    total_claimed += amount;
                } else {
                    total_unclaimed += amount;
                }
            }

            reward_responses.push(StakingRewardResponse {
                id: reward.id,
                address: reward.address,
                validator_address: reward.validator_address,
                validator_name,
                amount: reward.amount,
                era: reward.era,
                timestamp: reward.timestamp,
                claimed: reward.claimed,
                claimed_at: reward.claimed_at,
                transaction_hash: reward.transaction_hash,
            });
        }

        Ok::<_, diesel::result::Error>(StakingRewardsResponse {
            rewards: reward_responses,
            total: rewards.len() as i64,
            page: 1,
            page_size: rewards.len() as i64,
            total_rewards: total_rewards.to_string(),
            total_claimed: total_claimed.to_string(),
            total_unclaimed: total_unclaimed.to_string(),
        })
    })
    .await;

    match rewards_result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch staking rewards"),
    }
}

#[post("/wallet/claim-rewards")]
async fn claim_rewards(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    claim_data: web::Json<ClaimRewardRequest>,
) -> impl Responder {
    let session_token = auth_header.token();

    let mut conn_session = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    // First, validate the session token
    let session_token_clone = session_token.to_string();
    let session_result = web::block(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token_clone))
            .filter(sessions_dsl::expires_at.gt(Utc::now().naive_utc()))
            .first::<WalletSession>(&mut conn_session)
    })
    .await;

    let session = match session_result {
        Ok(session) => session,
        Err(_) => return HttpResponse::Unauthorized().json("Invalid or expired session"),
    };

    // Verify the rewards exist and belong to the user
    let mut conn_rewards = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let reward_ids = claim_data.reward_ids.clone();
    let address_clone = session.address.clone();
    let rewards_result = web::block(move || {
        rewards_dsl::staking_rewards
            .filter(rewards_dsl::id.eq_any(&reward_ids))
            .filter(rewards_dsl::address.eq(address_clone))
            .filter(rewards_dsl::claimed.eq(false))
            .load::<StakingReward>(&mut conn_rewards)
    })
    .await;

    let rewards = match rewards_result {
        Ok(rewards) => {
            if rewards.is_empty() {
                return HttpResponse::BadRequest().json("No valid unclaimed rewards found");
            }
            rewards
        }
        Err(_) => return HttpResponse::NotFound().json("Rewards not found"),
    };

    // Calculate total amount to claim
    let mut total_claimed = 0.0;
    for reward in &rewards {
        if let Ok(amount) = reward.amount.parse::<f64>() {
            total_claimed += amount;
        }
    }

    // Update the rewards to claimed status
    let mut conn_update = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let reward_ids: Vec<i32> = rewards.iter().map(|r| r.id).collect();
    let now = Utc::now().naive_utc();
    let transaction_hash = format!("tx_{}", Uuid::new_v4().to_string().replace("-", ""));

    let update_result = web::block(move || {
        diesel::update(rewards_dsl::staking_rewards.filter(rewards_dsl::id.eq_any(&reward_ids)))
            .set((
                rewards_dsl::claimed.eq(true),
                rewards_dsl::claimed_at.eq(now),
                rewards_dsl::transaction_hash.eq(&transaction_hash),
            ))
            .execute(&mut conn_update)
    })
    .await;

    match update_result {
        Ok(_) => {
            // In a real implementation, we would also update the user's balance
            HttpResponse::Ok().json(ClaimRewardResponse {
                success: true,
                transaction_hash: Some(transaction_hash),
                claimed_rewards: reward_ids,
                total_claimed: total_claimed.to_string(),
            })
        }
        Err(_) => HttpResponse::InternalServerError().json("Failed to claim rewards"),
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(connect_wallet)
        .service(disconnect_wallet)
        .service(get_wallet_assets)
        .service(get_wallet_staking)
        .service(stake_tokens)
        .service(unstake_tokens)
        .service(get_wallet_rewards)
        .service(claim_rewards);
}
