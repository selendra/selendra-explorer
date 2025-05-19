use actix_web::{get, web, HttpResponse, Responder};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::db::{get_connection, DbPool};
use crate::models::event::{Event, EventResponse};
use crate::schema::events::dsl::*;
use crate::schema::blocks::dsl as blocks_dsl;

// Type alias for the boxed query
type BoxedEventsQuery<'a> = diesel::dsl::IntoBoxed<'a, crate::schema::events::table, diesel::pg::Pg>;

#[derive(Debug, Deserialize, Clone)]
pub struct EventsQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub section: Option<String>,
    pub method: Option<String>,
    pub block_number: Option<i64>,
    pub extrinsic_hash: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct EventsResponse {
    pub events: Vec<EventResponse>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[get("/events")]
async fn get_events(
    pool: web::Data<DbPool>,
    query_params: web::Query<EventsQueryParams>,
) -> impl Responder {
    let page = query_params.page.unwrap_or(1);
    let page_size = query_params.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;

    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let query_params_clone = query_params.into_inner();

    let events_result = web::block(move || {
        
        // Helper closure to apply filters
        let apply_filters = |mut query: BoxedEventsQuery<'_>| { // Use type alias
            if let Some(section_filter) = &query_params_clone.section {
                query = query.filter(section.eq(section_filter.clone()));
            }
            if let Some(method_filter) = &query_params_clone.method {
                query = query.filter(method.eq(method_filter.clone()));
            }
            if let Some(block_num_filter) = query_params_clone.block_number {
                query = query.filter(block_number.eq(block_num_filter));
            }
            if let Some(ext_hash_filter) = &query_params_clone.extrinsic_hash {
                query = query.filter(extrinsic_hash.eq(ext_hash_filter.clone()));
            }
            query
        };

        // Apply filters and get total count
        let count_query = apply_filters(events.into_boxed());
        let total: i64 = count_query.count().get_result(&mut conn)?;
        
        // Apply filters again for data query, then apply pagination and ordering
        let data_query = apply_filters(events.into_boxed());
        let events_data: Vec<Event> = data_query
            .order((block_number.desc(), event_index.asc()))
            .limit(page_size)
            .offset(offset)
            .load(&mut conn)?;

        let mut event_responses = Vec::new();
        for event_item in events_data {
            let block_timestamp = blocks_dsl::blocks
                .filter(blocks_dsl::number.eq(event_item.block_number))
                .select(blocks_dsl::timestamp)
                .first::<chrono::NaiveDateTime>(&mut conn)?;

            event_responses.push(EventResponse {
                id: event_item.id,
                block_hash: event_item.block_hash,
                block_number: event_item.block_number,
                extrinsic_hash: event_item.extrinsic_hash,
                extrinsic_index: event_item.extrinsic_index,
                event_index: event_item.event_index,
                section: event_item.section,
                method: event_item.method,
                data: event_item.data,
                phase: event_item.phase,
                timestamp: block_timestamp,
            });
        }

        Ok::<_, diesel::result::Error>((event_responses, total))
    })
    .await;

    match events_result {
        Ok(Ok((event_responses, total))) => {
            HttpResponse::Ok().json(EventsResponse {
                events: event_responses,
                total,
                page,
                page_size,
            })
        }
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_events: {:?}", db_err);
            HttpResponse::InternalServerError().json(format!("Error fetching events: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_events: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

#[get("/events/{id}")]
async fn get_event_by_id(
    pool: web::Data<DbPool>,
    path: web::Path<i32>,
) -> impl Responder {
    let event_id_path = path.into_inner();
    
    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };

    let event_result = web::block(move || {
        let event_data: Event = events
            .filter(id.eq(event_id_path))
            .first(&mut conn)?;

        let block_timestamp = blocks_dsl::blocks
            .filter(blocks_dsl::number.eq(event_data.block_number))
            .select(blocks_dsl::timestamp)
            .first::<chrono::NaiveDateTime>(&mut conn)?;

        Ok::<EventResponse, diesel::result::Error>(EventResponse {
            id: event_data.id,
            block_hash: event_data.block_hash,
            block_number: event_data.block_number,
            extrinsic_hash: event_data.extrinsic_hash,
            extrinsic_index: event_data.extrinsic_index,
            event_index: event_data.event_index,
            section: event_data.section,
            method: event_data.method,
            data: event_data.data,
            phase: event_data.phase,
            timestamp: block_timestamp,
        })
    })
    .await;

    match event_result {
        Ok(Ok(event_response)) => HttpResponse::Ok().json(event_response),
        Ok(Err(diesel::result::Error::NotFound)) => HttpResponse::NotFound().json("Event not found"),
        Ok(Err(db_err)) => {
            eprintln!("Database error in get_event_by_id: {:?}", db_err);
            HttpResponse::InternalServerError().json(format!("Error fetching event details: {:?}", db_err))
        }
        Err(blocking_err) => {
            eprintln!("Blocking error in get_event_by_id: {:?}", blocking_err);
            HttpResponse::InternalServerError().json("Internal server error (blocking)")
        }
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_events).service(get_event_by_id);
}
