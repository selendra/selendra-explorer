use actix_web::{get, web, HttpResponse, Responder};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::db::{get_connection, DbPool};
use crate::models::validator::{Validator, ValidatorResponse, ValidatorsResponse, ValidatorStatsResponse};
use crate::schema::validators::dsl as validators_dsl;
use crate::schema::wallet_staking::dsl as staking_dsl;

#[derive(Debug, Deserialize)]
pub struct ValidatorsQueryParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub active: Option<bool>,
}

#[get("/validators")]
async fn get_validators(
    pool: web::Data<DbPool>,
    query: web::Query<ValidatorsQueryParams>,
) -> impl Responder {
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(10);
    let offset = (page - 1) * page_size;
    
    let sort_by = query.sort_by.as_deref().unwrap_or("total_stake");
    let sort_order = query.sort_order.as_deref().unwrap_or("desc");
    
    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let mut query = validators_dsl::validators.into_boxed();
    
    // Apply active filter if provided
    if let Some(active) = query.active {
        query = query.filter(validators_dsl::active.eq(active));
    }
    
    // Apply sorting
    query = match (sort_by, sort_order) {
        ("total_stake", "asc") => query.order(validators_dsl::total_stake.asc()),
        ("total_stake", _) => query.order(validators_dsl::total_stake.desc()),
        ("commission_rate", "asc") => query.order(validators_dsl::commission_rate.asc()),
        ("commission_rate", _) => query.order(validators_dsl::commission_rate.desc()),
        ("blocks_produced", "asc") => query.order(validators_dsl::blocks_produced.asc()),
        ("blocks_produced", _) => query.order(validators_dsl::blocks_produced.desc()),
        ("uptime_percentage", "asc") => query.order(validators_dsl::uptime_percentage.asc()),
        ("uptime_percentage", _) => query.order(validators_dsl::uptime_percentage.desc()),
        _ => query.order(validators_dsl::total_stake.desc()),
    };
    
    let result = web::block(move || {
        // Get total count
        let total = validators_dsl::validators.count().get_result::<i64>(&mut conn)?;
        
        // Get validators with pagination
        let validators = query
            .limit(page_size)
            .offset(offset)
            .load::<Validator>(&mut conn)?;
        
        // For each validator, get the delegator count
        let mut validator_responses = Vec::new();
        for validator in validators {
            let delegator_count = staking_dsl::wallet_staking
                .filter(staking_dsl::validator_address.eq(&validator.address))
                .filter(staking_dsl::status.eq("active"))
                .count()
                .get_result::<i64>(&mut conn)
                .unwrap_or(0) as i32;
            
            // Calculate APY (in a real implementation, this would be based on historical data)
            let apy = Some(5.0 + (100.0 - validator.commission_rate) / 20.0); // Example calculation
            
            validator_responses.push(ValidatorResponse {
                address: validator.address,
                name: validator.name,
                identity: validator.identity,
                total_stake: validator.total_stake,
                self_stake: validator.self_stake,
                commission_rate: validator.commission_rate,
                active: validator.active,
                blocks_produced: validator.blocks_produced,
                uptime_percentage: validator.uptime_percentage,
                created_at: validator.created_at,
                updated_at: validator.updated_at,
                delegator_count,
                apy,
                metadata: validator.metadata,
            });
        }
        
        Ok::<_, diesel::result::Error>(ValidatorsResponse {
            validators: validator_responses,
            total,
            page,
            page_size,
        })
    })
    .await;
    
    match result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch validators"),
    }
}

#[get("/validators/{address}")]
async fn get_validator(
    pool: web::Data<DbPool>,
    path: web::Path<String>,
) -> impl Responder {
    let address = path.into_inner();
    
    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let result = web::block(move || {
        let validator = validators_dsl::validators
            .filter(validators_dsl::address.eq(&address))
            .first::<Validator>(&mut conn)?;
        
        let delegator_count = staking_dsl::wallet_staking
            .filter(staking_dsl::validator_address.eq(&validator.address))
            .filter(staking_dsl::status.eq("active"))
            .count()
            .get_result::<i64>(&mut conn)
            .unwrap_or(0) as i32;
        
        // Calculate APY (in a real implementation, this would be based on historical data)
        let apy = Some(5.0 + (100.0 - validator.commission_rate) / 20.0); // Example calculation
        
        Ok::<_, diesel::result::Error>(ValidatorResponse {
            address: validator.address,
            name: validator.name,
            identity: validator.identity,
            total_stake: validator.total_stake,
            self_stake: validator.self_stake,
            commission_rate: validator.commission_rate,
            active: validator.active,
            blocks_produced: validator.blocks_produced,
            uptime_percentage: validator.uptime_percentage,
            created_at: validator.created_at,
            updated_at: validator.updated_at,
            delegator_count,
            apy,
            metadata: validator.metadata,
        })
    })
    .await;
    
    match result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::NotFound().json("Validator not found"),
    }
}

#[get("/validators/stats")]
async fn get_validator_stats(
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let result = web::block(move || {
        let total_validators = validators_dsl::validators.count().get_result::<i64>(&mut conn)?;
        
        let active_validators = validators_dsl::validators
            .filter(validators_dsl::active.eq(true))
            .count()
            .get_result::<i64>(&mut conn)?;
        
        // Calculate total staked (in a real implementation, this would be more accurate)
        let validators = validators_dsl::validators.load::<Validator>(&mut conn)?;
        let mut total_staked = 0.0;
        for validator in &validators {
            if let Ok(stake) = validator.total_stake.parse::<f64>() {
                total_staked += stake;
            }
        }
        
        // Calculate average commission
        let mut total_commission = 0.0;
        for validator in &validators {
            total_commission += validator.commission_rate;
        }
        let average_commission = if total_validators > 0 {
            total_commission / total_validators as f64
        } else {
            0.0
        };
        
        // Calculate average APY (in a real implementation, this would be based on historical data)
        let average_apy = Some(5.0 + (100.0 - average_commission) / 20.0); // Example calculation
        
        Ok::<_, diesel::result::Error>(ValidatorStatsResponse {
            total_validators,
            active_validators,
            total_staked: total_staked.to_string(),
            average_commission,
            average_apy,
        })
    })
    .await;
    
    match result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch validator stats"),
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_validators)
       .service(get_validator)
       .service(get_validator_stats);
}
