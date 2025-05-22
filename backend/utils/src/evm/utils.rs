use custom_error::ServiceError;
use ethers::types::{Transaction, TransactionReceipt};
use model::transaction::TransactionFee;

pub fn calculate_transaction_fee(
    tx_info: &Transaction,
    receipt: &TransactionReceipt,
) -> Result<TransactionFee, ServiceError> {
    let gas_used = if let Some(gas) = receipt.gas_used {
        gas.as_u64()
    } else {
        0
    };

    let effective_gas_price = receipt.effective_gas_price.as_ref()
            .and_then(|price| Some(price.as_u64()))
            .or_else(|| tx_info.gas_price.map(|price| price.as_u64()));
    

    let total_fee = if let Some(gas_price) = effective_gas_price {
        gas_used * gas_price
    } else {
        0
    };

    Ok(TransactionFee {
        gas_used,
        gas_limit: tx_info.gas.as_u64(),
        gas_price: effective_gas_price,
        max_fee_per_gas: tx_info.max_fee_per_gas.map(|fee| fee.as_u64()),
        max_priority_fee_per_gas: tx_info.max_priority_fee_per_gas.map(|fee| fee.as_u64()),
        total_fee,
        total_fee_eth: format!("{:.6}", total_fee as f64 / 1e18), // Convert wei to ETH
    })
}