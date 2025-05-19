use actix_web::{get, web, HttpResponse, Responder};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::db::{get_connection, DbPool};
use crate::models::block::{Block, BlockResponse};
use crate::schema::blocks::dsl::*;
use crate::schema::transactions::dsl as tx_dsl;
use crate::schema::extrinsics::dsl as ext_dsl;

#[derive(Debug, Deserialize)]
pub struct BlocksQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct BlocksResponse {
    pub blocks: Vec<BlockResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[get("/blocks")]
async fn get_blocks(
    pool: web::Data<DbPool>,
    query: web::Query<BlocksQueryParams>,
) -> impl Responder {
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let blocks_result = web::block(move || {
        // Get total count
        let total: i64 = blocks.count().get_result(&mut conn)?;

        // Get blocks with pagination
        let blocks_data: Vec<Block> = blocks
            .order(number.desc())
            .limit(page_size)
            .offset(offset)
            .load(&mut conn)?;

        // Get transaction and extrinsic count for each block
        let mut block_responses = Vec::new();
        for block_model in blocks_data {
            let tx_count: i64 = tx_dsl::transactions
                .filter(tx_dsl::block_hash.eq(&block_model.hash))
                .count()
                .get_result(&mut conn)?;
            
            let ext_count: i64 = ext_dsl::extrinsics
                .filter(ext_dsl::block_hash.eq(&block_model.hash))
                .count()
                .get_result(&mut conn)?;

            block_responses.push(BlockResponse {
                hash: block_model.hash,
                number: block_model.number,
                timestamp: block_model.timestamp,
                parent_hash: block_model.parent_hash,
                author: block_model.author,
                state_root: block_model.state_root,
                transactions_root: block_model.transactions_root,
                receipts_root: block_model.receipts_root,
                gas_used: block_model.gas_used,
                gas_limit: block_model.gas_limit,
                extra_data: block_model.extra_data,
                logs_bloom: block_model.logs_bloom,
                size: block_model.size,
                difficulty: block_model.difficulty,
                total_difficulty: block_model.total_difficulty,
                transaction_count: tx_count,
                consensus_engine: block_model.consensus_engine,
                finalized: block_model.finalized,
                extrinsics_root: block_model.extrinsics_root,
                validator_set: block_model.validator_set,
                extrinsic_count: Some(ext_count),
            });
        }

        Ok::<_, diesel::result::Error>((block_responses, total))
    })
    .await;

    match blocks_result {
        Ok(Ok((block_responses, total))) => {
            HttpResponse::Ok().json(BlocksResponse {
                blocks: block_responses,
                total,
                page,
                page_size,
            })
        }
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_blocks: {:?}", db_err);
            HttpResponse::InternalServerError().json(format!("Error fetching blocks: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_blocks: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[get("/blocks/{block_id}")]
async fn get_block_by_id(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
) -> impl Responder {
    let block_id = path.into_inner();
    
    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let block_result = web::block(move || {
        let block_data: Block = if block_id.starts_with("0x") {
            // Search by hash
            blocks.filter(hash.eq(&block_id)).first(&mut conn)
        } else {
            // Search by number
            match block_id.parse::<i64>() {
                Ok(num) => blocks.filter(number.eq(num)).first(&mut conn),
                Err(_) => return Err(diesel::result::Error::NotFound),
            }
        }?;

        let tx_count: i64 = tx_dsl::transactions
            .filter(tx_dsl::block_hash.eq(&block_data.hash))
            .count()
            .get_result(&mut conn)?;

        let ext_count: i64 = ext_dsl::extrinsics
            .filter(ext_dsl::block_hash.eq(&block_data.hash))
            .count()
            .get_result(&mut conn)?;

        Ok::<BlockResponse, diesel::result::Error>(BlockResponse {
            hash: block_data.hash,
            number: block_data.number,
            timestamp: block_data.timestamp,
            parent_hash: block_data.parent_hash,
            author: block_data.author,
            state_root: block_data.state_root,
            transactions_root: block_data.transactions_root,
            receipts_root: block_data.receipts_root,
            gas_used: block_data.gas_used,
            gas_limit: block_data.gas_limit,
            extra_data: block_data.extra_data,
            logs_bloom: block_data.logs_bloom,
            size: block_data.size,
            difficulty: block_data.difficulty,
            total_difficulty: block_data.total_difficulty,
            transaction_count: tx_count,
            consensus_engine: block_data.consensus_engine,
            finalized: block_data.finalized,
            extrinsics_root: block_data.extrinsics_root,
            validator_set: block_data.validator_set,
            extrinsic_count: Some(ext_count),
        })
    })
    .await;

    match block_result {
        Ok(Ok(block_response)) => HttpResponse::Ok().json(block_response),
        Ok(Err(diesel::result::Error::NotFound)) => HttpResponse::NotFound().json("Block not found"),
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_block_by_id: {:?}", db_err);
            HttpResponse::InternalServerError().json(format!("Error fetching block details: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_block_by_id: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_blocks).service(get_block_by_id);
}
