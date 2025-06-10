mod evm;
mod substrate;
pub use ethers;

pub use evm::BlockStateQuery;
pub use substrate::SubstrtaeBlockQuery;
pub use substrate::substrate_subxt::SubstrtaeGeneralQuery;
