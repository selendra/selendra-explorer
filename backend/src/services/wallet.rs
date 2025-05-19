use anyhow::Result;
use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use crate::db::{get_connection, DbPool};
use crate::models::wallet_asset::{NewWalletAsset, WalletAsset};
use crate::models::wallet_session::{NewWalletSession, WalletSession};
use crate::models::wallet_staking::{NewWalletStaking, WalletStaking};
use crate::schema::wallet_assets::dsl as assets_dsl;
use crate::schema::wallet_sessions::dsl as sessions_dsl;
use crate::schema::wallet_staking::dsl as staking_dsl;

/// Connect a wallet and create a session
pub async fn connect_wallet(
    pool: &DbPool,
    address: &str,
    wallet_type: &str,
    _signature: &str,
    _message: &str,
) -> Result<WalletSession> {
    let mut conn = get_connection(pool)?;
    let address = address.to_lowercase();
    let now = Utc::now().naive_utc();
    let session_token = Uuid::new_v4().to_string();
    let expires_at = now + chrono::Duration::days(7);

    let new_session = NewWalletSession {
        address: address.clone(),
        wallet_type: wallet_type.to_string(),
        session_token: session_token.clone(),
        expires_at,
        last_active: now,
        metadata: None,
    };

    tokio::task::spawn_blocking(move || {
        diesel::insert_into(sessions_dsl::wallet_sessions)
            .values(&new_session)
            .execute(&mut conn)
    })
    .await??;

    Ok(WalletSession {
        id: 0,
        address,
        wallet_type: wallet_type.to_string(),
        session_token,
        expires_at,
        last_active: now,
        metadata: None,
    })
}

/// Validate a session token
pub async fn validate_session(pool: &DbPool, session_token: &str) -> Result<Option<WalletSession>> {
    let mut conn = get_connection(pool)?;
    let now = Utc::now().naive_utc();

    let session = tokio::task::spawn_blocking(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token))
            .filter(sessions_dsl::expires_at.gt(now))
            .first::<WalletSession>(&mut conn)
            .optional()
    })
    .await??;

    Ok(session)
}

/// Disconnect a wallet (delete session)
pub async fn disconnect_wallet(pool: &DbPool, session_token: &str) -> Result<bool> {
    let mut conn = get_connection(pool)?;

    let result = tokio::task::spawn_blocking(move || {
        diesel::delete(
            sessions_dsl::wallet_sessions.filter(sessions_dsl::session_token.eq(session_token)),
        )
        .execute(&mut conn)
    })
    .await??;

    Ok(result > 0)
}

/// Get wallet assets
pub async fn get_wallet_assets(pool: &DbPool, address: &str) -> Result<Vec<WalletAsset>> {
    let mut conn = get_connection(pool)?;
    let address = address.to_lowercase();

    let assets = tokio::task::spawn_blocking(move || {
        assets_dsl::wallet_assets
            .filter(assets_dsl::address.eq(address))
            .load::<WalletAsset>(&mut conn)
    })
    .await??;

    Ok(assets)
}

/// Add or update a wallet asset
pub async fn add_wallet_asset(
    pool: &DbPool,
    user_address: &str,
    asset_address_str: &str,
    asset_type: &str,
    _network: &str,
) -> Result<WalletAsset> {
    let mut conn = get_connection(pool)?;
    let user_address = user_address.to_lowercase();
    let asset_address_val = asset_address_str.to_lowercase();
    let now = Utc::now().naive_utc();

    let new_asset = NewWalletAsset {
        address: user_address.clone(),
        asset_address: Some(asset_address_val.clone()),
        asset_type: asset_type.to_string(),
        balance: String::from("0"),
        metadata: None,
    };

    tokio::task::spawn_blocking(move || {
        diesel::insert_into(assets_dsl::wallet_assets)
            .values(&new_asset)
            .on_conflict((assets_dsl::address, assets_dsl::asset_address))
            .do_update()
            .set(assets_dsl::last_updated.eq(now))
            .execute(&mut conn)
    })
    .await??;

    Ok(WalletAsset {
        id: 0,
        address: user_address,
        asset_address: Some(asset_address_val),
        asset_type: asset_type.to_string(),
        balance: String::from("0"),
        metadata: None,
    })
}

/// Remove a wallet asset
pub async fn remove_wallet_asset(
    pool: &DbPool,
    user_address: &str,
    asset_address_str: &str,
) -> Result<bool> {
    let mut conn = get_connection(pool)?;
    let user_address = user_address.to_lowercase();
    let asset_address_val = asset_address_str.to_lowercase();

    let result = tokio::task::spawn_blocking(move || {
        diesel::delete(
            assets_dsl::wallet_assets
                .filter(assets_dsl::address.eq(user_address))
                .filter(assets_dsl::asset_address.eq(Some(asset_address_val))),
        )
        .execute(&mut conn)
    })
    .await??;

    Ok(result > 0)
}

/// Get wallet staking positions
pub async fn get_wallet_staking(pool: &DbPool, address: &str) -> Result<Vec<WalletStaking>> {
    let mut conn = get_connection(pool)?;
    let address = address.to_lowercase();

    let staking_positions = tokio::task::spawn_blocking(move || {
        staking_dsl::wallet_staking
            .filter(staking_dsl::address.eq(address))
            .load::<WalletStaking>(&mut conn)
    })
    .await??;

    Ok(staking_positions)
}

/// Add or update a wallet staking position
pub async fn add_wallet_staking(
    pool: &DbPool,
    user_address: &str,
    validator_address: &str,
    amount: &str,
    _reward_rate: f64,
) -> Result<WalletStaking> {
    let mut conn = get_connection(pool)?;
    let user_address = user_address.to_lowercase();
    let validator_address_val = validator_address.to_lowercase();
    let now = Utc::now().naive_utc();

    let new_staking = NewWalletStaking {
        address: user_address.clone(),
        validator_address: validator_address_val.clone(),
        amount: amount.to_string(),
        reward_address: None,
        status: String::from("active"),
    };

    let amount_str = amount.to_string();
    tokio::task::spawn_blocking(move || {
        diesel::insert_into(staking_dsl::wallet_staking)
            .values(&new_staking)
            .on_conflict((staking_dsl::address, staking_dsl::validator_address))
            .do_update()
            .set((
                staking_dsl::amount.eq(amount_str),
                staking_dsl::updated_at.eq(now),
            ))
            .execute(&mut conn)
    })
    .await??;

    Ok(WalletStaking {
        id: 0,
        address: user_address,
        validator_address: validator_address_val,
        amount: amount.to_string(),
        reward_address: None,
        status: String::from("active"),
        updated_at: now,
    })
}
