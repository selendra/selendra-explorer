use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateEra {
    pub era: u32,
    pub start_at: u32,
    pub end_at: u32,
    pub session: u32
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateBlock {
    pub number: u32,
    pub timestamp: u64,
    pub is_finalize: bool,
    pub hash: String,
    pub parent_hash: String,
    pub state_root: String,
    pub extrinsics_root: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateBlockRes {
    pub number: u32,
    pub timestamp: u64,
    pub is_finalize: bool,
    pub hash: String,
    pub parent_hash: String,
    pub state_root: String,
    pub extrinsics_root: String,
    pub extrinscs_len: usize,
    pub event_len: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateExtrinsic {
    pub block_number: u32,
    pub extrinsic_index: u32,
    pub is_signed: bool,
    pub signer: Option<String>,
    pub call_module: String,
    pub call_function: String,
    pub args: String, // JSON serialized arguments
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateEvent {
    pub block_number: u32,
    pub event_index: u32,
    pub phase: String,
    pub module: String,
    pub event: String,
    pub data: String, // JSON serialized event data
    pub timestamp: u64,
}