use crate::AppState;
use axum::{Router, routing::get};
use std::sync::Arc;

use crate::handlers::{evm::*, substrate::*};

pub fn create_api_routes() -> Router<Arc<AppState>> {
    Router::new()
        // ===== NETWORK ENDPOINTS =====
        .route("/api/network", get(get_all_network_info))
        .route("/api/latest_block", get(get_substrate_latest_block))
        .route("/api/get_total_issuance", get(get_total_issuance))
        .route("/api/session_era", get(get_era_session))
        .route("/api/get_total_staking", get(get_total_staking))
        // ===== ADDRESS CONVERSION ENDPOINTS =====
        .route(
            "/api/convert/ss58_to_evm_address/{address}",
            get(get_evm_from_ss58),
        )
        .route(
            "/api/convert/evm_to_ss58_address/{address}",
            get(get_ss58_from_evm),
        )
        // ===== EVM BLOCK ENDPOINTS =====
        .route("/api/evm/blocks", get(get_all_blocks))
        .route(
            "/api/evm/blocks/number/{block_number}",
            get(get_block_by_number),
        )
        .route("/api/evm/blocks/hash/{block_hash}", get(get_block_by_hash))
        .route("/api/evm/blocks/latest", get(get_latest_block))
        // ===== EVM TRANSACTION ENDPOINTS =====
        .route("/api/evm/transactions", get(get_all_transactions))
        .route("/api/evm/transactions/latest", get(get_latest_transaction))
        .route(
            "/api/evm/transactions/block/{block_number}",
            get(get_transactions_by_block_number),
        )
        .route(
            "/api/evm/transactions/hash/{tx_hash}",
            get(get_transaction_by_hash),
        )
        // ===== EVM ACCOUNT ENDPOINTS =====
        .route("/api/evm/accounts", get(get_all_accounts))
        .route(
            "/api/evm/accounts/address/{address}",
            get(get_account_by_address),
        )
        .route(
            "/api/evm/accounts/balance",
            get(get_accounts_by_balance_range),
        )
        // ===== EVM CONTRACT ENDPOINTS =====
        .route("/api/evm/contracts", get(get_all_contracts))
        .route(
            "/api/evm/contracts/address/{address}",
            get(get_contract_by_address),
        )
        .route(
            "/api/evm/contracts/type/{contract_type}",
            get(get_contracts_by_type),
        )
        .route("/api/evm/contracts/verified", get(get_verified_contracts))
        // ===== SUBSTRATE BLOCK ENDPOINTS =====
        .route("/api/substrate/blocks", get(get_all_substrate_blocks))
        .route(
            "/api/substrate/blocks/number/{block_number}",
            get(get_substrate_block_by_number),
        )
        .route(
            "/api/substrate/blocks/hash/{block_hash}",
            get(get_substrate_block_by_hash),
        )
        .route(
            "/api/substrate/blocks/latest",
            get(get_latest_substrate_block),
        )
        // ===== SUBSTRATE EXTRINSIC ENDPOINTS =====
        .route(
            "/api/substrate/extrinsics",
            get(get_all_substrate_extrinsics),
        )
        .route(
            "/api/substrate/extrinsics/block/{block_number}",
            get(get_substrate_extrinsics_by_block_number),
        )
        .route(
            "/api/substrate/extrinsics/signer/{signer}",
            get(get_substrate_extrinsics_by_signer),
        )
        .route(
            "/api/substrate/extrinsics/module",
            get(get_substrate_extrinsics_by_module),
        )
        // ===== SUBSTRATE EVENT ENDPOINTS =====
        .route("/api/substrate/events", get(get_all_substrate_events))
        .route(
            "/api/substrate/events/block/{block_number}",
            get(get_substrate_events_by_block_number),
        )
        .route(
            "/api/substrate/events/module",
            get(get_substrate_events_by_module),
        )
        .route(
            "/api/substrate/events/name/{event_name}",
            get(get_substrate_events_by_event_name),
        )
        .route(
            "/api/substrate/events/recent",
            get(get_recent_substrate_events),
        )
}
