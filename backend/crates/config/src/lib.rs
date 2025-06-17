use dotenv::dotenv;
use lazy_static::lazy_static;
use std::env;

pub const EVM_BLOCK_TABLE: &'static str = "evm_blocks";
pub const EVM_TXS_TABLE: &'static str = "evm_transaction";
pub const EVM_ACCOUNTS_TABLE: &'static str = "evm_accounts";
pub const EVM_CONTRACTS_TABLE: &'static str = "evm_contracts";

pub const SUBSTRATE_BLOCKS_TABLE: &str = "substrate_blocks";
pub const SUBSTRATE_EXTRINSICS_TABLE: &str = "substrate_extrinsics";
pub const SUBSTRATE_EVENTS_TABLE: &str = "substrate_events";

#[subxt::subxt(runtime_metadata_path = "selendra_metadata.scale")]
pub mod selendra {}

lazy_static! {
    pub static ref EVM_RPC_URL: String = {
        dotenv().ok();
        env::var("RPC_URL").expect("RPC_URL must be set")
    };
    pub static ref DATABASE_URL: String =
        env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    pub static ref DATABASE_USERNAME: String =
        env::var("DATABASE_USERNAME").expect("DATABASE_USERNAME must be set");
    pub static ref DATABASE_PASSWORD: String =
        env::var("DATABASE_PASSWORD").expect("DATABASE_PASSWORD must be set");
    pub static ref DATABASE_NAMESPACE: String =
        env::var("DATABASE_NAMESPACE").expect("DATABASE_NAMESPACE must be set");
    pub static ref DATABASE_TABLE: String =
        env::var("DATABASE_TABLE").expect("DATABASE_TABLE must be set");
    pub static ref SUBSTRATE_URL: String =
        env::var("SUBSTRATE_URL").expect("SUBSTRATE_URL must be set");
}

pub const SESSIONS_PER_ERA: u32 = 96;
pub const BLOCKS_PER_SESSION: u32 = 900;
pub const BLOCKS_PER_ERA: u32 = SESSIONS_PER_ERA * BLOCKS_PER_SESSION;
pub const COMMISSION_DENOMINATOR: f64 = 10_000_000.0;
pub const GENESIS_TIMESTAMP: u128 = 1_745_282_623_000;

// Constants for better maintainability
pub const DECIMALS: u128 = 1_000_000_000_000_000_000; // 10^18
pub const DECIMALS_F64: f64 = 1_000_000_000_000_000_000.0;
