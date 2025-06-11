use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubstrateEra {
    pub era: u32,
    pub start_at: u32,
    pub end_at: u32,
    pub session: u32
}