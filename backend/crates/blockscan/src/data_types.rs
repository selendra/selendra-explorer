#[derive(Debug, Clone)]
pub struct DataExtrinsic {
    pub index: u32,
    pub hash: String,
    pub is_signed: bool,
    pub signature_info: Option<SignatureInfo>,
    pub call_info: CallInfo,
    pub raw_length: usize,
}

#[derive(Debug, Clone)]
pub struct SignatureInfo {
    pub signer: String,
    pub signature: String,
    pub era: Era,
    pub nonce: u64,
    pub tip: u128,
}

#[derive(Debug, Clone)]
pub enum Era {
    Immortal,
    Mortal(u8),
}

impl std::fmt::Display for Era {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Era::Immortal => write!(f, "Immortal"),
            Era::Mortal(period) => write!(f, "Mortal(0x{:02x})", period),
        }
    }
}

#[derive(Debug, Clone)]
pub struct CallInfo {
    pub pallet: String,
    pub call: String,
    pub args: Vec<(String, String)>,
}

impl CallInfo {
    pub fn invalid() -> Self {
        Self {
            pallet: "Unknown".to_string(),
            call: "Unknown".to_string(),
            args: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct DataEvent {
    pub extrinsic_index: u32,
    pub event_index: u32,
    pub pallet: String,
    pub event: String,
    pub phase: EventPhase,
    pub topics: Vec<String>,
    pub decoded_data: Vec<(String, String)>,
}

#[derive(Debug, Clone)]
pub enum EventPhase {
    ApplyExtrinsic(u32),
    Finalization,
    Initialization,
}

impl std::fmt::Display for EventPhase {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EventPhase::ApplyExtrinsic(idx) => write!(f, "ApplyExtrinsic({})", idx),
            EventPhase::Finalization => write!(f, "Finalization"),
            EventPhase::Initialization => write!(f, "Initialization"),
        }
    }
}
