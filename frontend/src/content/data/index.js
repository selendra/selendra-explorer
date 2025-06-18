export const SAMPLE_DATA = {
  // Sample EVM data structures
  evmBlock: {
    number: 869242,
    hash: "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
    parent_hash: "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    timestamp: 1706610600000,
    transaction_count: 125,
    size: 45632,
    gas_used: 8450000,
    gas_limit: 15000000,
    base_fee: 20000000000,
    burn_fee: 0.125,
    validator: "0x742d35Cc6634C0532925a3b8D45C55321321321321",
    extra_data: "0x476574682f76312e302e302f6c696e75782f676f312e342e32",
    nonce: 12345678,
    session: 1024,
    era: 256
  },
  
  evmTransaction: {
    hash: "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
    block_number: 869242,
    timestamp: 1706610600000,
    from: "0x742d35Cc6634C0532925a3b8D453211321312131",
    to: "0x8ba1f109551bD432803012645Hac136c55321321",
    value: 1000000000000000000,
    gas_price: 20000000000,
    gas_limit: 21000,
    gas_used: 21000,
    nonce: 42,
    status: "Success",
    transaction_type: "DynamicFee",
    fee: 420000000000,
    transaction_method: null
  },
  
  evmAccount: {
    address: "0x742d35Cc6634C0532925a3b8D453211321312131",
    balance_token: 1.5,
    free_balance: 1.5,
    nonce: 42,
    is_contract: false,
    address_type: "H160",
    created_at: 1704067200000,
    last_activity: 1706610600000
  },
  
  evmContract: {
    address: "0x8ba1f109551bD432803012645Hac136c55321321",
    contract_type: "ERC20",
    name: "Example Token",
    symbol: "EXT",
    decimals: 18,
    total_supply: "1000000000000000000000000",
    is_verified: true,
    creator_info: {
      contract_address: "0x8ba1f109551bD432803012645Hac136c55321321",
      creator_address: "0x742d35Cc6634C0532925a3b8D453211321312131",
      transaction_hash: "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
      block_number: 869000,
      timestamp: 1706610600000,
      creation_bytecode: "0x608060405234801561001057600080fd5b5..."
    }
  },
  
  // Sample Substrate data structures
  substrateBlock: {
    number: 1962278,
    timestamp: 1706610600,
    is_finalize: true,
    hash: "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
    parent_hash: "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    state_root: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    extrinsics_root: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    extrinscs_len: 15,
    event_len: 42
  },
  
  substrateExtrinsic: {
    block_number: 1962278,
    extrinsic_index: 1,
    is_signed: true,
    signer: "5DM7PJEFPbcYViEzFXu5GjF96JgoSJ3rb6jfXLsmXqrPVG2o",
    call_module: "Balances",
    call_function: "transfer",
    args: '{"dest": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "value": 1000000000000}',
    timestamp: 1706610600
  },
  
  substrateEvent: {
    block_number: 1962278,
    event_index: 5,
    phase: "ApplyExtrinsic(1)",
    module: "Balances",
    event: "Transfer",
    data: '{"from": "5DM7PJEFPbcYViEzFXu5GjF96JgoSJ3rb6jfXLsmXqrPVG2o", "to": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "amount": 1000000000000}',
    timestamp: 1706610600
  },
  
  // Network information
  networkInfo: {
    chain_id: 1,
    gas_price: 20000000000,
    max_priority_fee: 2000000000,
    max_fee: 30000000000,
    latest_block_number: 869242,
    syncing: false
  },
  
  sessionEra: {
    era: 22,
    start_at: 1749280805000,
    end_at: 2000000000,
    session: 30000000000
  }
};
