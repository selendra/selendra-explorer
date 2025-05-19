use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use log::info;

use crate::db::DbConnection;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

/// Runs database migrations
pub fn run_migrations(conn: &mut DbConnection) {
    info!("Running database migrations");
    conn.run_pending_migrations(MIGRATIONS)
        .expect("Failed to run database migrations");
    info!("Database migrations completed successfully");
}
