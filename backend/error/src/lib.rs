#[derive(Debug, thiserror::Error)]
pub enum ServiceError {
    #[error("Provider error: {0}")]
    ProviderError(#[from] ethers::providers::ProviderError),
    #[error("Block not found")]
    BlockNotFound,
    #[error("Invalid block data: {0}")]
    InvalidBlockData(String),
    #[error("Transaction not found: {0}")]
    TransactionNotFound(String),
    #[error("Invalid transaction data: {0}")]
    InvalidTransactionData(String),
    #[error("Transaction receipt not found: {0}")]
    TransactionReceiptNotFound(String),
    #[error("Invalid transaction hash: {0}")]
    InvalidTransactionHash(String),
}