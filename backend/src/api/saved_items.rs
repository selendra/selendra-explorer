use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use chrono::Utc;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use actix_web_httpauth::extractors::bearer::BearerAuth;

use crate::db::{get_connection, DbPool};
use crate::models::saved_contract::{NewSavedContract, SavedContract, SavedContractResponse, SavedContractsResponse};
use crate::models::saved_code::{NewSavedCode, SavedCode, SavedCodeResponse, SavedCodesResponse};
use crate::models::wallet_session::WalletSession;
use crate::schema::saved_contracts::dsl as contracts_dsl;
use crate::schema::saved_code::dsl as code_dsl;
use crate::schema::wallet_sessions::dsl as sessions_dsl;

// Helper function to validate session token
async fn validate_session(pool: &web::Data<DbPool>, session_token: &str) -> Result<WalletSession, actix_web::Error> {
    let conn = get_connection(pool)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Database connection error"))?;
    
    let session_token = session_token.to_string();
    let session = web::block(move || {
        sessions_dsl::wallet_sessions
            .filter(sessions_dsl::session_token.eq(session_token))
            .filter(sessions_dsl::expires_at.gt(Utc::now().naive_utc()))
            .first::<WalletSession>(&conn)
    })
    .await
    .map_err(|_| actix_web::error::ErrorUnauthorized("Invalid or expired session"))?;
    
    Ok(session)
}

#[derive(Debug, Deserialize)]
pub struct SaveContractRequest {
    pub contract_address: String,
    pub contract_name: Option<String>,
    pub contract_type: String,
    pub list_name: Option<String>,
    pub notes: Option<String>,
}

#[get("/saved/contracts")]
async fn get_saved_contracts(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
) -> impl Responder {
    let session_token = auth_header.token();
    
    // Validate session
    let session = match validate_session(&pool, session_token).await {
        Ok(session) => session,
        Err(e) => return e.error_response(),
    };
    
    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let contracts_result = web::block(move || {
        let contracts = contracts_dsl::saved_contracts
            .filter(contracts_dsl::user_address.eq(&session.address))
            .load::<SavedContract>(&conn)?;
        
        // Get unique list names
        let lists: Vec<String> = contracts_dsl::saved_contracts
            .filter(contracts_dsl::user_address.eq(&session.address))
            .select(contracts_dsl::list_name)
            .distinct()
            .load::<String>(&conn)?;
        
        let contract_responses: Vec<SavedContractResponse> = contracts
            .into_iter()
            .map(|contract| SavedContractResponse {
                id: contract.id,
                contract_address: contract.contract_address,
                contract_name: contract.contract_name,
                contract_type: contract.contract_type,
                list_name: contract.list_name,
                notes: contract.notes,
                created_at: contract.created_at,
            })
            .collect();
        
        Ok::<_, diesel::result::Error>(SavedContractsResponse {
            user_address: session.address,
            contracts: contract_responses,
            lists,
        })
    })
    .await;
    
    match contracts_result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch saved contracts"),
    }
}

#[post("/saved/contracts")]
async fn save_contract(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    contract_data: web::Json<SaveContractRequest>,
) -> impl Responder {
    let session_token = auth_header.token();
    let contract_data = contract_data.into_inner();
    
    // Validate session
    let session = match validate_session(&pool, session_token).await {
        Ok(session) => session,
        Err(e) => return e.error_response(),
    };
    
    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let new_contract = NewSavedContract {
        user_address: session.address.clone(),
        contract_address: contract_data.contract_address,
        contract_name: contract_data.contract_name,
        contract_type: contract_data.contract_type,
        list_name: contract_data.list_name.unwrap_or_else(|| "Default".to_string()),
        notes: contract_data.notes,
    };
    
    let result = web::block(move || {
        diesel::insert_into(contracts_dsl::saved_contracts)
            .values(&new_contract)
            .on_conflict((contracts_dsl::user_address, contracts_dsl::contract_address))
            .do_update()
            .set((
                contracts_dsl::contract_name.eq(&new_contract.contract_name),
                contracts_dsl::list_name.eq(&new_contract.list_name),
                contracts_dsl::notes.eq(&new_contract.notes),
            ))
            .get_result::<SavedContract>(&conn)
    })
    .await;
    
    match result {
        Ok(contract) => {
            let response = SavedContractResponse {
                id: contract.id,
                contract_address: contract.contract_address,
                contract_name: contract.contract_name,
                contract_type: contract.contract_type,
                list_name: contract.list_name,
                notes: contract.notes,
                created_at: contract.created_at,
            };
            HttpResponse::Ok().json(response)
        },
        Err(_) => HttpResponse::InternalServerError().json("Failed to save contract"),
    }
}

#[delete("/saved/contracts/{id}")]
async fn delete_saved_contract(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    path: web::Path<i32>,
) -> impl Responder {
    let session_token = auth_header.token();
    let contract_id = path.into_inner();
    
    // Validate session
    let session = match validate_session(&pool, session_token).await {
        Ok(session) => session,
        Err(e) => return e.error_response(),
    };
    
    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let result = web::block(move || {
        diesel::delete(
            contracts_dsl::saved_contracts
                .filter(contracts_dsl::id.eq(contract_id))
                .filter(contracts_dsl::user_address.eq(session.address))
        )
        .execute(&conn)
    })
    .await;
    
    match result {
        Ok(_) => HttpResponse::Ok().json("Contract removed from saved list"),
        Err(_) => HttpResponse::InternalServerError().json("Failed to delete saved contract"),
    }
}

#[derive(Debug, Deserialize)]
pub struct SaveCodeRequest {
    pub code_name: String,
    pub code_content: String,
    pub language: String,
}

#[get("/saved/code")]
async fn get_saved_code(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
) -> impl Responder {
    let session_token = auth_header.token();
    
    // Validate session
    let session = match validate_session(&pool, session_token).await {
        Ok(session) => session,
        Err(e) => return e.error_response(),
    };
    
    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let code_result = web::block(move || {
        let codes = code_dsl::saved_code
            .filter(code_dsl::user_address.eq(&session.address))
            .order(code_dsl::updated_at.desc())
            .load::<SavedCode>(&conn)?;
        
        let code_responses: Vec<SavedCodeResponse> = codes
            .into_iter()
            .map(|code| SavedCodeResponse {
                id: code.id,
                code_name: code.code_name,
                code_content: code.code_content,
                language: code.language,
                created_at: code.created_at,
                updated_at: code.updated_at,
            })
            .collect();
        
        Ok::<_, diesel::result::Error>(SavedCodesResponse {
            user_address: session.address,
            codes: code_responses,
        })
    })
    .await;
    
    match code_result {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch saved code"),
    }
}

#[post("/saved/code")]
async fn save_new_code(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    code_data: web::Json<SaveCodeRequest>,
) -> impl Responder {
    let session_token = auth_header.token();
    let code_data = code_data.into_inner();
    
    // Validate session
    let session = match validate_session(&pool, session_token).await {
        Ok(session) => session,
        Err(e) => return e.error_response(),
    };
    
    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let new_code = NewSavedCode {
        user_address: session.address.clone(),
        code_name: code_data.code_name,
        code_content: code_data.code_content,
        language: code_data.language,
    };
    
    let result = web::block(move || {
        diesel::insert_into(code_dsl::saved_code)
            .values(&new_code)
            .get_result::<SavedCode>(&conn)
    })
    .await;
    
    match result {
        Ok(code) => {
            let response = SavedCodeResponse {
                id: code.id,
                code_name: code.code_name,
                code_content: code.code_content,
                language: code.language,
                created_at: code.created_at,
                updated_at: code.updated_at,
            };
            HttpResponse::Ok().json(response)
        },
        Err(_) => HttpResponse::InternalServerError().json("Failed to save code"),
    }
}

#[put("/saved/code/{id}")]
async fn update_saved_code(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    path: web::Path<i32>,
    code_data: web::Json<SaveCodeRequest>,
) -> impl Responder {
    let session_token = auth_header.token();
    let code_id = path.into_inner();
    let code_data = code_data.into_inner();
    
    // Validate session
    let session = match validate_session(&pool, session_token).await {
        Ok(session) => session,
        Err(e) => return e.error_response(),
    };
    
    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let result = web::block(move || {
        diesel::update(
            code_dsl::saved_code
                .filter(code_dsl::id.eq(code_id))
                .filter(code_dsl::user_address.eq(session.address))
        )
        .set((
            code_dsl::code_name.eq(&code_data.code_name),
            code_dsl::code_content.eq(&code_data.code_content),
            code_dsl::language.eq(&code_data.language),
            code_dsl::updated_at.eq(Utc::now().naive_utc()),
        ))
        .get_result::<SavedCode>(&conn)
    })
    .await;
    
    match result {
        Ok(code) => {
            let response = SavedCodeResponse {
                id: code.id,
                code_name: code.code_name,
                code_content: code.code_content,
                language: code.language,
                created_at: code.created_at,
                updated_at: code.updated_at,
            };
            HttpResponse::Ok().json(response)
        },
        Err(_) => HttpResponse::InternalServerError().json("Failed to update code"),
    }
}

#[delete("/saved/code/{id}")]
async fn delete_saved_code(
    pool: web::Data<DbPool>,
    auth_header: BearerAuth,
    path: web::Path<i32>,
) -> impl Responder {
    let session_token = auth_header.token();
    let code_id = path.into_inner();
    
    // Validate session
    let session = match validate_session(&pool, session_token).await {
        Ok(session) => session,
        Err(e) => return e.error_response(),
    };
    
    let conn = match get_connection(&pool) {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Database connection error"),
    };
    
    let result = web::block(move || {
        diesel::delete(
            code_dsl::saved_code
                .filter(code_dsl::id.eq(code_id))
                .filter(code_dsl::user_address.eq(session.address))
        )
        .execute(&conn)
    })
    .await;
    
    match result {
        Ok(_) => HttpResponse::Ok().json("Code deleted successfully"),
        Err(_) => HttpResponse::InternalServerError().json("Failed to delete saved code"),
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_saved_contracts)
       .service(save_contract)
       .service(delete_saved_contract)
       .service(get_saved_code)
       .service(save_new_code)
       .service(update_saved_code)
       .service(delete_saved_code);
}
