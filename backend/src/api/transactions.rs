use actix_web::{get, web, HttpResponse, Responder};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::db::{get_connection, DbPool};
use crate::models::log::Log;
use crate::models::transaction::{Transaction, TransactionResponse};
use crate::schema::logs::dsl as logs_dsl;
use crate::schema::transactions::dsl::*;

#[derive(Debug, Deserialize)]
pub struct TransactionsQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub address: Option<String>,
    pub block_number: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct TransactionsResponse {
    pub transactions: Vec<TransactionResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[get("/transactions")]
async fn get_transactions(
    pool: web::Data<DbPool>,
    query: web::Query<TransactionsQueryParams>,
) -> impl Responder {
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;
    let address = query.address.clone();
    let block_number = query.block_number;

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let txs_result = web::block(move || {
        // Start with a base query
        let mut query = transactions.into_boxed();

        // Apply filters
        if let Some(addr) = address {
            let addr = addr.to_lowercase();
            query = query.filter(from_address.eq(&addr).or(to_address.eq(&addr)));
        }

        if let Some(block_num) = block_number {
            query = query.filter(block_number.eq(block_num));
        }

        // Get total count with filters applied
        let total: i64 = query.clone().count().get_result(&mut conn)?;

        // Get transactions with pagination
        let txs_data: Vec<Transaction> = query
            .order(block_number.desc())
            .limit(page_size)
            .offset(offset)
            .load(&mut conn)?;

        // Convert to response objects
        let mut tx_responses = Vec::new();
        for tx_model in txs_data {
            // Get logs for this transaction
            let logs: Vec<Log> = logs_dsl::logs
                .filter(logs_dsl::transaction_hash.eq(&tx_model.hash))
                .order_by(logs_dsl::log_index.asc())
                .load(&mut conn)?;

            tx_responses.push(TransactionResponse {
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
                created_at: tx_model.created_at,
                updated_at: tx_model.updated_at,
                execution_type: tx_model.execution_type,
                logs,
            });
        }

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
            eprintln!("Database error in get_transactions: {:?}", db_err);
            HttpResponse::InternalServerError()
                .json(format!("Error fetching transactions: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_transactions: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[get("/transactions/{hash}")]
async fn get_transaction_by_hash(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
) -> impl Responder {
    let tx_hash = path.into_inner().to_lowercase();

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let tx_result = web::block(move || {
        // Get the transaction
        let tx_data: Transaction = transactions.filter(hash.eq(&tx_hash)).first(&mut conn)?;

        // Get logs for this transaction
        let logs: Vec<Log> = logs_dsl::logs
            .filter(logs_dsl::transaction_hash.eq(&tx_hash))
            .order_by(logs_dsl::log_index.asc())
            .load(&mut conn)?;

        Ok::<TransactionResponse, diesel::result::Error>(TransactionResponse {
            hash: tx_data.hash,
            block_hash: tx_data.block_hash,
            block_number: tx_data.block_number,
            from_address: tx_data.from_address,
            to_address: tx_data.to_address,
            value: tx_data.value,
            gas: tx_data.gas,
            gas_price: tx_data.gas_price,
            input: tx_data.input,
            nonce: tx_data.nonce,
            transaction_index: tx_data.transaction_index,
            status: tx_data.status,
            transaction_type: tx_data.transaction_type,
            max_fee_per_gas: tx_data.max_fee_per_gas,
            max_priority_fee_per_gas: tx_data.max_priority_fee_per_gas,
            created_at: tx_data.created_at,
            updated_at: tx_data.updated_at,
            execution_type: tx_data.execution_type,
            logs,
        })
    })
    .await;

    match tx_result {
        Ok(Ok(tx_response)) => HttpResponse::Ok().json(tx_response),
        Ok(Err(diesel::result::Error::NotFound)) => {
            HttpResponse::NotFound().json("Transaction not found")
        }
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_transaction_by_hash: {:?}", db_err);
            HttpResponse::InternalServerError()
                .json(format!("Error fetching transaction details: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!(
                "Blocking error in get_transaction_by_hash: {:?}",
                blocking_err
            );
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_transactions)
        .service(get_transaction_by_hash);
}
