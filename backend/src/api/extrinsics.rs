use actix_web::{get, web, HttpResponse, Responder};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::db::{get_connection, DbPool};
use crate::models::extrinsic::{Extrinsic, ExtrinsicResponse};
use crate::schema::extrinsics::dsl::*;
use crate::schema::events::dsl as events_dsl;

// Type alias for the boxed query
type BoxedExtrinsicsQuery<'a> = diesel::dsl::IntoBoxed<'a, crate::schema::extrinsics::table, diesel::pg::Pg>;

#[derive(Debug, Deserialize, Clone)]
pub struct ExtrinsicsQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub section: Option<String>,
    pub method: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ExtrinsicsResponse {
    pub extrinsics: Vec<ExtrinsicResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[get("/extrinsics")]
async fn get_extrinsics(
    pool: web::Data<DbPool>,
    query_params: web::Query<ExtrinsicsQueryParams>,
) -> impl Responder {
    let page = query_params.page.unwrap_or(1);
    let page_size = query_params.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let query_params_clone = query_params.into_inner();

    let extrinsics_result = web::block(move || {
        
        // Helper closure to apply filters
        let apply_filters = |mut query: BoxedExtrinsicsQuery<'_>| {
            if let Some(section_filter) = &query_params_clone.section {
                query = query.filter(section.eq(section_filter.clone()));
            }
            if let Some(method_filter) = &query_params_clone.method {
                query = query.filter(method.eq(method_filter.clone()));
            }
            query
        };

        // Apply filters and get total count
        let count_query = apply_filters(extrinsics.into_boxed());
        let total: i64 = count_query.count().get_result(&mut conn)?;
        
        // Apply filters again for data query, then apply pagination and ordering
        let data_query = apply_filters(extrinsics.into_boxed());
        let extrinsics_data: Vec<Extrinsic> = data_query
            .order(block_number.desc())
            .limit(page_size)
            .offset(offset)
            .load(&mut conn)?;

        let mut extrinsic_responses = Vec::new();
        for extrinsic_item in extrinsics_data {
            let event_count: i64 = events_dsl::events
                .filter(events_dsl::extrinsic_hash.eq(&extrinsic_item.hash))
                .count()
                .get_result(&mut conn)?;

            extrinsic_responses.push(ExtrinsicResponse {
                hash: extrinsic_item.hash,
                block_hash: extrinsic_item.block_hash,
                block_number: extrinsic_item.block_number,
                index: extrinsic_item.index,
                signer: extrinsic_item.signer,
                section: extrinsic_item.section,
                method: extrinsic_item.method,
                args: extrinsic_item.args,
                success: extrinsic_item.success,
                is_signed: extrinsic_item.is_signed,
                signature: extrinsic_item.signature,
                nonce: extrinsic_item.nonce,
                tip: extrinsic_item.tip,
                timestamp: extrinsic_item.created_at,
                event_count,
            });
        }

        Ok::<_, diesel::result::Error>((extrinsic_responses, total))
    })
    .await;

    match extrinsics_result {
        Ok(Ok((extrinsic_responses, total))) => {
            HttpResponse::Ok().json(ExtrinsicsResponse {
                extrinsics: extrinsic_responses,
                total,
                page,
                page_size,
            })
        }
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_extrinsics: {:?}", db_err);
            HttpResponse::InternalServerError().json(format!("Error fetching extrinsics: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_extrinsics: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[get("/extrinsics/{hash_path}")]
async fn get_extrinsic_by_hash(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
) -> impl Responder {
    let extrinsic_hash_param = path.into_inner();
    
    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let extrinsic_result = web::block(move || {
        let extrinsic_data: Extrinsic = extrinsics
            .filter(hash.eq(extrinsic_hash_param))
            .first(&mut conn)?;

        let event_count: i64 = events_dsl::events
            .filter(events_dsl::extrinsic_hash.eq(&extrinsic_data.hash))
            .count()
            .get_result(&mut conn)?;

        Ok::<ExtrinsicResponse, diesel::result::Error>(ExtrinsicResponse {
            hash: extrinsic_data.hash,
            block_hash: extrinsic_data.block_hash,
            block_number: extrinsic_data.block_number,
            index: extrinsic_data.index,
            signer: extrinsic_data.signer,
            section: extrinsic_data.section,
            method: extrinsic_data.method,
            args: extrinsic_data.args,
            success: extrinsic_data.success,
            is_signed: extrinsic_data.is_signed,
            signature: extrinsic_data.signature,
            nonce: extrinsic_data.nonce,
            tip: extrinsic_data.tip,
            timestamp: extrinsic_data.created_at,
            event_count,
        })
    })
    .await;

    match extrinsic_result {
        Ok(Ok(extrinsic_response)) => HttpResponse::Ok().json(extrinsic_response),
        Ok(Err(diesel::result::Error::NotFound)) => HttpResponse::NotFound().json("Extrinsic not found"),
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_extrinsic_by_hash: {:?}", db_err);
            HttpResponse::InternalServerError().json(format!("Error fetching extrinsic details: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_extrinsic_by_hash: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_extrinsics).service(get_extrinsic_by_hash);
}
