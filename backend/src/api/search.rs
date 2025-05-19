use actix_web::{get, web, HttpResponse, Responder};
use serde::Deserialize;

use crate::db::DbPool;
use crate::services::search::search;

#[derive(Debug, Deserialize)]
pub struct SearchQueryParams {
    pub q: String,
}

#[get("/search")]
async fn search_endpoint(
    pool: web::Data<DbPool>,
    query: web::Query<SearchQueryParams>,
) -> impl Responder {
    let search_query = query.q.clone();

    if search_query.is_empty() {
        return HttpResponse::BadRequest().json("Search query cannot be empty");
    }

    match search(&pool, &search_query).await {
        Ok(results) => HttpResponse::Ok().json(results),
        Err(e) => {
            eprintln!("Error in search: {:?}", e);
            HttpResponse::InternalServerError().json(format!("Error performing search: {:?}", e))
        }
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(search_endpoint);
}
