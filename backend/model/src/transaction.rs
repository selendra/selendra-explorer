use serde::{Deserialize, Serialize};

use crate::method::TransactionMethod;

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
    pub block_number: u32,
    pub transaction_index: Option<u16>, // position in the block
    pub status: TransactionStatus,
    pub timestamp: Option<String>,
    pub from: String,
    pub to: Option<String>,
    pub value: String, // In wei as string to avoid precision loss
    pub transaction_fee: TransactionFee,
    pub nonce: u32,
    pub input_data: String,
    pub transaction_type: Option<u8>,
    pub trasation_method: Option<TransactionMethod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionFee {
    pub gas_used: u32,
    pub gas_limit: u32,
    pub gas_price: Option<u32>,
    pub max_fee_per_gas: Option<u32>,
    pub max_priority_fee_per_gas: Option<u32>,
    pub total_fee: u32,
    pub total_fee_eth: String,
}
