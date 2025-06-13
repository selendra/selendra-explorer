use std::time::Duration;
use tokio::time::sleep;

use crate::block_process::BlockProcessingService;

#[derive(Debug, Clone)]
pub struct ProcessingConfig {
    pub start_block: Option<u32>,
    pub end_block: Option<u32>, // None means process to latest
    pub batch_size: u32,
    pub delay_between_batches: Duration,
    pub max_retries: u32,
}

impl Default for ProcessingConfig {
    fn default() -> Self {
        Self {
            start_block: Some(0),
            end_block: None, // Process to latest
            batch_size: 10,
            delay_between_batches: Duration::from_millis(100),
            max_retries: 3,
        }
    }
}

pub struct ContinuousProcessor {
    block_processor: BlockProcessingService,
    config: ProcessingConfig,
}

impl ContinuousProcessor {
    pub fn new(block_processor: BlockProcessingService, config: ProcessingConfig) -> Self {
        Self {
            block_processor,
            config,
        }
    }

    pub async fn start_processing(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let latest_block = self.block_processor.lastest_block().await?;
        let start_block = self.config.start_block.unwrap_or_default();
        let end_block = self.config.end_block.unwrap_or(latest_block);

        println!("📊 Processing Configuration:");
        println!("   Start Block: {}", start_block);
        println!("   End Block: {}", end_block);
        println!("   Latest Block: {}", latest_block);
        println!("   Batch Size: {}", self.config.batch_size);
        println!(
            "   Total Blocks to Process: {}",
            end_block - start_block + 1
        );

        let mut current_block = start_block;
        let mut processed_count = 0;
        let total_blocks = end_block - start_block + 1;

        while current_block <= end_block {
            let batch_end = std::cmp::min(current_block + self.config.batch_size - 1, end_block);

            println!(
                "\n🔄 Processing batch: blocks {} to {}",
                current_block, batch_end
            );

            match self.process_block_batch(current_block, batch_end).await {
                Ok(batch_processed) => {
                    processed_count += batch_processed;
                    let progress = (processed_count as f64 / total_blocks as f64) * 100.0;
                    println!(
                        "✅ Batch completed. Progress: {:.2}% ({}/{})",
                        progress, processed_count, total_blocks
                    );
                }
                Err(e) => {
                    println!("❌ Batch failed: {}. Retrying...", e);
                    // Don't increment current_block to retry the same batch
                    sleep(Duration::from_secs(1)).await;
                    continue;
                }
            }

            current_block = batch_end + 1;

            // Add delay between batches to avoid overwhelming the RPC
            if current_block <= end_block {
                sleep(self.config.delay_between_batches).await;
            }
        }

        Ok(())
    }

    async fn process_block_batch(
        &self,
        start: u32,
        end: u32,
    ) -> Result<u32, Box<dyn std::error::Error + Send + Sync>> {
        let mut processed = 0;

        // Process blocks sequentially instead of spawning tasks
        // This avoids the Send trait issues with the underlying API client
        for block_num in start..=end {
            match Self::process_single_block_with_retry(self.block_processor.clone(), block_num, 3).await {
                Ok(_) => {
                    processed += 1;
                    println!("✅ Block {} processed successfully", block_num);
                }
                Err(e) => {
                    println!("❌ Failed to process block {}: {}", block_num, e);
                    // Continue processing other blocks in the batch
                }
            }
        }

        Ok(processed)
    }

    async fn process_single_block_with_retry(
        block_processor: BlockProcessingService,
        block_number: u32,
        max_retries: u32,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut retries = 0;

        loop {
            match Self::process_chain_info(block_processor.clone(), block_number).await {
                Ok(_) => {
                    return Ok(());
                }
                Err(e) => {
                    retries += 1;
                    if retries >= max_retries {
                        return Err(format!(
                            "Failed to process block {} after {} retries: {}",
                            block_number, max_retries, e
                        )
                        .into());
                    }

                    println!(
                        "⚠️  Retry {}/{} for block {}: {}",
                        retries, max_retries, block_number, e
                    );
                    sleep(Duration::from_millis(500 * retries as u64)).await;
                }
            }
        }
    }

    pub async fn start_continuous_sync(
        &self,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        println!("🔄 Starting continuous sync mode...");

        loop {
            let latest_block = self.block_processor.lastest_block().await?;
            let start_block = self.config.start_block.unwrap_or(latest_block);

            if start_block <= latest_block {
                let mut temp_config = self.config.clone();
                temp_config.start_block = Some(start_block);
                temp_config.end_block = Some(latest_block);

                let temp_processor =
                    ContinuousProcessor::new(self.block_processor.clone(), temp_config);

                match temp_processor.start_processing().await {
                    Ok(_) => {
                        println!("✅ Sync batch completed up to block {}", latest_block);
                    }
                    Err(e) => {
                        println!("❌ Sync batch failed: {}", e);
                    }
                }
            }

            println!("💤 Waiting for new blocks...");
            sleep(Duration::from_secs(1)).await; // Wait ~1 block time for Selendra
        }
    }

    async fn process_chain_info(
        block_processor: BlockProcessingService,
        block_number: u32,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Process each operation sequentially to avoid Send issues
        // This is safer and still reasonably performant for block processing
        
        // Process block first
        block_processor.process_block(block_number).await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;
        
        // Then process extrinsics
        block_processor.process_extrinsic(block_number).await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;
        
        // Finally process events
        block_processor.process_event(block_number).await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;

        Ok(())
    }
}