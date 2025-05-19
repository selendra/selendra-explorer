use anyhow::Result;
use log::{error, info};
use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinHandle;

use crate::db::DbPool;
use crate::services::blockchain::evm::EvmIndexer;
use crate::services::blockchain::substrate::SubstrateIndexer;

/// Blockchain synchronization service
pub struct BlockchainSyncService {
    pool: Arc<DbPool>,
    evm_poll_interval: Duration,
    substrate_poll_interval: Duration,
}

impl BlockchainSyncService {
    /// Create a new blockchain sync service
    pub fn new(
        pool: Arc<DbPool>,
        evm_poll_interval: Duration,
        substrate_poll_interval: Duration,
    ) -> Self {
        Self {
            pool,
            evm_poll_interval,
            substrate_poll_interval,
        }
    }
    
    /// Start the synchronization service
    pub async fn start(&self) -> Result<(JoinHandle<()>, JoinHandle<()>)> {
        info!("Starting blockchain synchronization service");
        
        // Start EVM indexer
        let evm_handle = self.start_evm_indexer().await?;
        
        // Start Substrate indexer
        let substrate_handle = self.start_substrate_indexer().await?;
        
        Ok((evm_handle, substrate_handle))
    }
    
    /// Start the EVM indexer
    async fn start_evm_indexer(&self) -> Result<JoinHandle<()>> {
        let pool = self.pool.clone();
        let poll_interval = self.evm_poll_interval;
        
        let handle = tokio::spawn(async move {
            match EvmIndexer::new(pool).await {
                Ok(indexer) => {
                    if let Err(e) = indexer.start_indexing(poll_interval).await {
                        error!("EVM indexer error: {}", e);
                    }
                }
                Err(e) => {
                    error!("Failed to create EVM indexer: {}", e);
                }
            }
        });
        
        Ok(handle)
    }
    
    /// Start the Substrate indexer
    async fn start_substrate_indexer(&self) -> Result<JoinHandle<()>> {
        let pool = self.pool.clone();
        let poll_interval = self.substrate_poll_interval;
        
        let handle = tokio::spawn(async move {
            match SubstrateIndexer::new(pool).await {
                Ok(indexer) => {
                    if let Err(e) = indexer.start_indexing(poll_interval).await {
                        error!("Substrate indexer error: {}", e);
                    }
                }
                Err(e) => {
                    error!("Failed to create Substrate indexer: {}", e);
                }
            }
        });
        
        Ok(handle)
    }
}
