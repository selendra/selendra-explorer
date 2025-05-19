use actix_web::web;

mod accounts;
mod blocks;
mod contracts;
mod events;
mod extrinsics;
mod saved_items;
mod search;
mod stats;
mod tokens;
mod transactions;
mod validators;
mod wallet;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(blocks::configure_routes)
            .configure(transactions::configure_routes)
            .configure(accounts::configure_routes)
            .configure(contracts::configure_routes)
            .configure(tokens::configure_routes)
            .configure(search::configure_routes)
            .configure(stats::configure_routes)
            .configure(extrinsics::configure_routes)
            .configure(events::configure_routes)
            .configure(validators::configure_routes)
            .configure(wallet::configure_routes)
            .configure(saved_items::configure_routes),
    );
}
