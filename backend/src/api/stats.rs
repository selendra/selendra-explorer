use actix_web::{get, web, HttpResponse, Responder};
use serde::Deserialize;

use crate::db::DbPool;
use crate::services::stats::{get_blockchain_stats, get_daily_transaction_stats};

#[get("/stats")]
async fn get_stats(pool: web::Data<DbPool>) -> impl Responder {
    match get_blockchain_stats(&pool).await {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Error in get_stats: {:?}", e);
            HttpResponse::InternalServerError().json(format!("Error fetching stats: {:?}", e))
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct TransactionStatsQueryParams {
    pub days: Option<i64>,
}

#[get("/stats/transactions")]
async fn get_transaction_stats(
    pool: web::Data<DbPool>,
    query: web::Query<TransactionStatsQueryParams>,
) -> impl Responder {
    let days = query.days.unwrap_or(30);

    if days <= 0 || days > 365 {
        return HttpResponse::BadRequest().json("Days parameter must be between 1 and 365");
    }

    match get_daily_transaction_stats(&pool, days).await {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Error in get_transaction_stats: {:?}", e);
            HttpResponse::InternalServerError()
                .json(format!("Error fetching transaction stats: {:?}", e))
        }
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_stats).service(get_transaction_stats);
}
