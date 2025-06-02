use lazy_static::lazy_static;
use dotenv::dotenv;
use std::env;

pub const EVM_BLOCK_TABLE: &'static str = "evm_blocks";
pub const EVM_TXS_TABLE: &'static str = "evm_transaction";
pub const EVM_ACCOUNTS_TABLE: &'static str = "evm_accounts";
pub const EVM_CONTRACTS_TABLE: &'static str = "evm_contracts";

lazy_static! {
    pub static ref EVM_RPC_URL: String = {
        dotenv().ok();
        env::var("RPC_URL").expect("RPC_URL must be set")
    };
    
    pub static ref DATABASE_URL: String = {
        env::var("DATABASE_URL").expect("DATABASE_URL must be set")
    };
    
    pub static ref DATABASE_USERNAME: String = {
        env::var("DATABASE_USERNAME").expect("DATABASE_USERNAME must be set")
    };
    
    pub static ref DATABASE_PASSWORD: String = {
        env::var("DATABASE_PASSWORD").expect("DATABASE_PASSWORD must be set")
    };

    pub static ref DATABASE_NAMESPACE: String = {
        env::var("DATABASE_NAMESPACE").expect("DATABASE_NAMESPACE must be set")
    };
    
    pub static ref DATABASE_TABLE: String = {
        env::var("DATABASE_TABLE").expect("DATABASE_TABLE must be set")
    };
}

