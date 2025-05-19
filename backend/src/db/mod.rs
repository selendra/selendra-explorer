use diesel::pg::PgConnection;
use diesel::r2d2::{self, ConnectionManager};
use dotenv::dotenv;
use std::env;

pub mod migrations;

// Type alias for the connection pool
pub type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

/// Establishes a connection pool to the database
pub fn establish_connection_pool() -> DbPool {
    dotenv().ok();
    
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");
    
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create database connection pool")
}

/// Gets a connection from the pool
pub fn get_connection(pool: &DbPool) -> Result<DbConnection, diesel::r2d2::Error> {
    pool.get().map_err(diesel::r2d2::Error::PoolError)
}
