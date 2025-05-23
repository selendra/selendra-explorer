use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionStatus {
    Success,
    Failed,
    Pending,
}

// transaction_type
// `0`   | Legacy transaction               | Pre-EIP-2718
// `1`   | Access List transaction          | EIP-2930
// `2`   | EIP-1559 dynamic fee transaction | EIP-1559 (London upgrade)

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmTransactionInfo {
    pub hash: String,
    pub block_number: u64,
    pub transaction_index: Option<u16>, // position in the block
    pub status: TransactionStatus,
    pub timestamp: Option<String>,
    pub from: String,
    pub to: Option<String>,
    pub value: String, // In wei as string to avoid precision loss
    pub transaction_fee: TransactionFee,
    pub nonce: u64,
    pub input_data: String,
    pub transaction_type: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionFee {
    pub gas_used: u64,
    pub gas_limit: u64,
    pub gas_price: Option<u64>,
    pub max_fee_per_gas: Option<u64>,
    pub max_priority_fee_per_gas: Option<u64>,
    pub total_fee: u64,
    pub total_fee_eth: String,
}
