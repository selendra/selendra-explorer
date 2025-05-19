use actix_web::{get, web, HttpResponse, Responder};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::db::{get_connection, DbPool};
use crate::models::account::{Account, AccountResponse};
use crate::models::transaction::{Transaction, TransactionResponse};
use crate::schema::accounts::dsl::*;
use crate::schema::transactions::dsl as tx_dsl;
use crate::services::account as account_service;

#[derive(Debug, Deserialize)]
pub struct AccountsQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub is_contract: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct AccountsResponse {
    pub accounts: Vec<AccountResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[get("/accounts")]
async fn get_accounts(
    pool: web::Data<DbPool>,
    query: web::Query<AccountsQueryParams>,
) -> impl Responder {
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;
    let is_contract_filter = query.is_contract;

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let accounts_result = web::block(move || {
        let mut base_query = accounts.into_boxed();

        if let Some(is_contract_val) = is_contract_filter {
            base_query = base_query.filter(is_contract.eq(is_contract_val));
        }

        let mut count_query = crate::schema::accounts::table.into_boxed();
        if let Some(is_contract_val) = is_contract_filter {
            count_query = count_query.filter(is_contract.eq(is_contract_val));
        }
        let total: i64 = count_query.count().get_result(&mut conn)?;

        let accounts_data: Vec<Account> = base_query
            .order(balance.desc())
            .limit(page_size)
            .offset(offset)
            .load(&mut conn)?;

        let account_responses = accounts_data
            .into_iter()
            .map(|account_model| AccountResponse {
                address: account_model.address,
                balance: account_model.balance,
                nonce: account_model.nonce,
                is_contract: account_model.is_contract,
                transaction_count: 0,
            })
            .collect::<Vec<_>>();

        Ok::<_, diesel::result::Error>((account_responses, total))
    })
    .await;

    match accounts_result {
        Ok(Ok((account_responses, total))) => HttpResponse::Ok().json(AccountsResponse {
            accounts: account_responses,
            total,
            page,
            page_size,
        }),
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_accounts: {:?}", db_err);
            HttpResponse::InternalServerError()
                .json(format!("Error fetching accounts: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_accounts: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[get("/accounts/{address}")]
async fn get_account_by_address(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
) -> impl Responder {
    let account_address = path.into_inner().to_lowercase();

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let account_result = web::block(move || {
        let account_data: Account = accounts
            .filter(address.eq(&account_address))
            .first(&mut conn)?;

        let tx_count: i64 = tx_dsl::transactions
            .filter(
                tx_dsl::from_address
                    .eq(&account_address)
                    .or(tx_dsl::to_address.eq(&account_address.clone())),
            )
            .count()
            .get_result(&mut conn)?;

        Ok::<AccountResponse, diesel::result::Error>(AccountResponse {
            address: account_data.address,
            balance: account_data.balance,
            nonce: account_data.nonce,
            is_contract: account_data.is_contract,
            transaction_count: tx_count,
        })
    })
    .await;

    match account_result {
        Ok(Ok(account_response)) => HttpResponse::Ok().json(account_response),
        Ok(Err(diesel::result::Error::NotFound)) => {
            HttpResponse::NotFound().json("Account not found")
        }
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_account_by_address: {:?}", db_err);
            HttpResponse::InternalServerError()
                .json(format!("Error fetching account details: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!(
                "Blocking error in get_account_by_address: {:?}",
                blocking_err
            );
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[get("/accounts/{address}/transactions")]
async fn get_account_transactions(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
    query: web::Query<TransactionsQueryParams>,
) -> impl Responder {
    let account_addr = path.into_inner().to_lowercase();
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let txs_result = web::block(move || {
        let base_query = tx_dsl::transactions.filter(
            tx_dsl::from_address
                .eq(&account_addr)
                .or(tx_dsl::to_address.eq(&account_addr.clone())),
        );

        let total: i64 = base_query.clone().count().get_result(&mut conn)?;

        let txs_data: Vec<Transaction> = base_query
            .order(tx_dsl::block_number.desc())
            .limit(page_size)
            .offset(offset)
            .load(&mut conn)?;

        let tx_responses = txs_data
            .into_iter()
            .map(|tx_model| TransactionResponse {
                hash: tx_model.hash,
                block_hash: tx_model.block_hash,
                block_number: tx_model.block_number,
                from_address: tx_model.from_address,
                to_address: tx_model.to_address,
                value: tx_model.value,
                gas: tx_model.gas,
                gas_price: tx_model.gas_price,
                input: tx_model.input,
                nonce: tx_model.nonce,
                transaction_index: tx_model.transaction_index,
                status: tx_model.status,
                transaction_type: tx_model.transaction_type,
                max_fee_per_gas: tx_model.max_fee_per_gas,
                max_priority_fee_per_gas: tx_model.max_priority_fee_per_gas,
                execution_type: tx_model.execution_type,
                logs: vec![],
            })
            .collect::<Vec<_>>();

        Ok::<_, diesel::result::Error>((tx_responses, total))
    })
    .await;

    match txs_result {
        Ok(Ok((tx_responses, total))) => HttpResponse::Ok().json(TransactionsResponse {
            transactions: tx_responses,
            total,
            page,
            page_size,
        }),
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_account_transactions: {:?}", db_err);
            HttpResponse::InternalServerError()
                .json(format!("Error fetching account transactions: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!(
                "Blocking error in get_account_transactions: {:?}",
                blocking_err
            );
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct TransactionsQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct TransactionsResponse {
    pub transactions: Vec<TransactionResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_accounts)
        .service(get_account_by_address)
        .service(get_account_transactions);
}
