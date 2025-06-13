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