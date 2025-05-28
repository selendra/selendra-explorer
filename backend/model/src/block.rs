// use ethers::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmBlockInfo {
    pub number: u32,
    pub hash: Option<String>,
    pub parent_hash: String,
    pub timestamp: String,
    pub gas_used: u32,
    pub gas_limit: u32,
    pub base_fee_per_gas: Option<u32>,
    pub validate: String,
    pub extra_data: String,
    pub transactions_count: usize,
    pub size: Option<usize>,
    pub nonce: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateBlockInfo {}

// Block detail: Block {
//     header:
//     Header {
//         parent_hash: 0x383bddc11a834e68006b10cb91fd3378067e6a6a1608ead71734abba1dd6f9da,
//         number: 1000,
//         state_root: 0x0ae1fd9f63640058921b4a562c007b53421f59d3806d9d7237e25cdc7e50657f,
//         xtrinsics_root: 0x068609a97ded456a0142bc9185b294369603c4203699e06076efccbe1b30d908,
//         digest:
//         Digest {
//             logs: [
//                 DigestItem::PreRuntime([], []),
//                 DigestItem::Consensus([]),
//                 DigestItem::Seal([1])
//             ]},
//         extrinsics: [0403000b9980f9d79601]
//         }
