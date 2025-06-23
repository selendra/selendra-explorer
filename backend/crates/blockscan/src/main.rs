mod substrate;
use custom_error::ServiceError;
pub use substrate::substrate_subxt::SubstrtaeGeneralQuery;

use crate::substrate::SubstrateBlockQuery;

#[derive(Clone)]
pub struct BlockProcessingService {
    pub url: String,
    // pub db_service: DatabaseService,
}

impl BlockProcessingService {
    pub fn new(
        url: String,
        // db_service: DatabaseService
    ) -> Result<Self, ServiceError> {
        Ok(
            Self {
                url
                // db_service
            })
    }

    pub async fn lastest_block(&self) -> Result<u32, ServiceError> {
        let client = SubstrateBlockQuery::new(&self.url, None).await?;
        let latest_block = client.latest_block().await?;

        Ok(latest_block)
    }

    pub async fn process_block(&self, block_number: Option<u32>) -> Result<(), ServiceError> {
        let client = SubstrateBlockQuery::new(&self.url, block_number).await?;

        let block = client.block_info().await?;

        let extrinsics = block.extrinsics().await.map_err(|e| ServiceError::SubstrateError(e.to_string()))?;
        for ext in extrinsics.iter() {
            let idx = ext.index();
            let events = ext.events().await.map_err(|e| ServiceError::SubstrateError(e.to_string()))?;
            let bytes_hex = format!("0x{}", hex::encode(ext.bytes()));

            // See the API docs for more ways to decode extrinsics:
            let decoded_ext = ext.as_root_extrinsic::<config::selendra::Call>();

            println!("    Extrinsic #{idx}:");
            println!("      Bytes: {bytes_hex}");
            println!("      Decoded: {decoded_ext:?}");

            println!("      Events:");
            for evt in events.iter() {
                let evt = evt.map_err(|e| ServiceError::SubstrateError(e.to_string()))?;
                let pallet_name = evt.pallet_name();
                let event_name = evt.variant_name();
                let event_values = evt.field_values().map_err(|e| ServiceError::SubstrateError(e.to_string()))?;

                println!("        {pallet_name}_{event_name}");
                println!("          {}", event_values);
            }

            println!("      Transaction Extensions:");
            if let Some(transaction_extensions) = ext.transaction_extensions() {
                for transaction_extension in transaction_extensions.iter() {
                    let name = transaction_extension.name();
                    let value = transaction_extension.value().map_err(|e| ServiceError::SubstrateError(e.to_string()))?.to_string();
                    println!("        {name}: {value}");
                }
            }
        }
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let processor = BlockProcessingService::new("wss://rpc.selendra.org".to_string())?;
    processor.process_block(Some(100)).await?;
    Ok(())
}