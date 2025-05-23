use std::sync::Arc;

use ethers::{providers::{Http, Provider}, types::BlockId};
use utils::BlockStateQuery;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let provider = Provider::<Http>::try_from("https://mainnet.infura.io/v3/24a3e0a1e6474ff183c2e832a7e1a6a0")?;
    let provider = Arc::new(provider);

    let block_number: u64 = 22534498;
    let block_id = BlockId::Number(block_number.into());

    let query = BlockStateQuery::new(Arc::clone(&provider), block_id);

    // // Example 1: Get network information
    // println!("\n=== Network Information ===");
    // match query.network_info().await {
    //     Ok(network_info) => {
    //         println!("Network info: {:?}", network_info.chain_id);
    //     }
    //     Err(e) => {
    //         println!("Error getting network info: {}", e);
    //     }
    // }

    // // Example 2: Get block information
    // match query.block_info().await {
    //     Ok(block_info) => {
    //         println!("Block {}: {:?}", block_number, block_info.hash);
    //     }
    //     Err(e) => {
    //         println!("Error getting block info: {}", e);
    //     }
    // }

    // // Example 3: Get transaction by hash
    // println!("\n=== Transaction by Hash ===");
    // let tx_hash = "0x0a614e77e9941508da970444c135f1c6bb999bcd63432e3cf8c1da0ee8b04f21";
    // match query.transaction_by_hash(&tx_hash).await {
    //     Ok(tx_info) => {
    //         println!("Transaction: {:?}", tx_info.hash);
    //         let method = query.analyze_transaction_method(&tx_info).await;
    //         println!("Transaction: Method{:?}", method);
    //     }
    //     Err(e) => {
    //         println!("Error getting transaction: {}", e);
    //     }
    // }


    // let transations_hash = query.transactions_hash_in_block().await?;
    // for hash in transations_hash.iter() {
    //     let tx_hash = format!("{:#x}", hash);
    //     match query.transaction_by_hash(&tx_hash).await {
    //         Ok(tx_info) => {
    //             let method = query.get_transaction_method(&tx_info).await;
    //             println!("Transaction: Method{:?}", method);
    //         }
    //         Err(e) => {
    //             println!("Error getting transaction: {}", e);
    //         }
    //     }
    // }

    // / Test contracts with known types
    let test_contracts = vec![
        ("USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "ERC20"),
        ("WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "ERC20"),
        ("DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", "ERC20"),
        ("BAYC", "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", "ERC721"),
        ("CryptoPunks", "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB", "ERC721"),
        ("Uniswap V3 Router", "0xE592427A0AEce92De3Edee1F18E0157C05861564", "DEX"),
        ("Uniswap V2 Router", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", "DEX"),
        ("SushiSwap Router", "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", "DEX"),
        ("Aave V2 Lending Pool", "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", "Proxy/Lending"),
        ("Compound Comptroller", "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B", "Lending"),
        ("OpenSea Seaport", "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC", "NFT Marketplace"),
        ("USDT (Proxy)", "0xdAC17F958D2ee523a2206206994597C13D831ec7", "ERC20/Proxy"),
    ];

    println!("=== Contract Type Detection Test ===\n");

    for (name, address, expected_type) in test_contracts {
        println!("Testing: {} ({})", name, address);
        println!("Expected: {}", expected_type);
        
        match query.query_account(address).await {
            Ok(account_info) => {
                if let Some(contract_info) = account_info.contract_type {
                    println!("Detected: {:?}", contract_info.contract_type);
                    
                    // Print additional info
                    if let Some(n) = contract_info.name {
                        println!("  Name: {}", n);
                    }
                    if let Some(s) = contract_info.symbol {
                        println!("  Symbol: {}", s);
                    }
                    if let Some(d) = contract_info.decimals {
                        println!("  Decimals: {}", d);
                    }
                } else {
                    println!("Failed to detect contract type!");
                }
            }
            Err(e) => println!("Error: {}", e),
        }
        
        println!("---\n");
    }


    Ok(())
}
