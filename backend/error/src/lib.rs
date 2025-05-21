#[derive(Debug, thiserror::Error)]
pub enum ServiceError {
    #[error("Provider error: {0}")]
    ProviderError(#[from] ethers::providers::ProviderError),
    #[error("Block not found")]
    BlockNotFound,
    #[error("Invalid block data: {0}")]
    InvalidBlockData(String),
}