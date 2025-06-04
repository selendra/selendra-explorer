use crate::AppState;
use crate::handlers::evm::network::get_all_network_info;
use axum::{Router, routing::get};
use std::sync::Arc;

use crate::handlers::evm::{
    account::{get_account_by_address, get_accounts_by_balance_range, get_all_accounts},
    block::{get_all_blocks, get_block_by_hash, get_block_by_number, get_latest_block},
    contract::{
        get_all_contracts, get_contract_by_address, get_contracts_by_type, get_verified_contracts,
    },
    transaction::{
        get_all_transactions, get_latest_transaction, get_transaction_by_hash,
        get_transactions_by_block_number,
    },
};

pub fn create_api_routes() -> Router<Arc<AppState>> {
    Router::new()
        // newtwork
        .route("/api/network", get(get_all_network_info))
        // block
        .route("/api/blocks", get(get_all_blocks))
        .route(
            "/api/blocks/number/{block_number}",
            get(get_block_by_number),
        )
        .route("/api/blocks/hash/{block_hash}", get(get_block_by_hash))
        .route("/api/blocks/latest", get(get_latest_block))
        // transaction
        .route("/api/transactions", get(get_all_transactions))
        .route("/api/transactions/latest", get(get_latest_transaction))
        .route(
            "/api/transactions/block/{block_number}",
            get(get_transactions_by_block_number),
        )
        .route(
            "/api/transactions/hash/{tx_hash}",
            get(get_transaction_by_hash),
        )
        // account routes
        .route("/api/accounts", get(get_all_accounts))
        .route(
            "/api/accounts/address/{address}",
            get(get_account_by_address),
        )
        .route("/api/accounts/balance", get(get_accounts_by_balance_range))
        // contract routes
        .route("/api/contracts", get(get_all_contracts))
        .route(
            "/api/contracts/address/{address}",
            get(get_contract_by_address),
        )
        .route(
            "/api/contracts/type/{contract_type}",
            get(get_contracts_by_type),
        )
        .route("/api/contracts/verified", get(get_verified_contracts))
}
