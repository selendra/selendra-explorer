#[derive(Debug)]
pub struct ExtrinsicDetails {
    pub index: usize,
    pub hash: String,
    pub is_signed: bool,
    pub signature_info: Option<SignatureInfo>,
    pub call_info: CallInfo,
    pub raw_length: usize,
}

#[derive(Debug)]
pub struct SignatureInfo {
    pub signer: String,
    pub signature: String,
    pub era: String,
    pub nonce: u64,
    pub tip: u128,
}

#[derive(Debug)]
pub struct CallInfo {
    pub pallet: String,
    pub call: String,
    pub args: Vec<(String, String)>,
}
