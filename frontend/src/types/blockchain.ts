export interface EvmBlock {
  number: number;
  hash: string;
  parent_hash: string;
  timestamp: number;
  transaction_count: number;
  size: number;
  gas_used: number;
  gas_limit: number;
  base_fee: number;
  burn_fee: number;
  validator: string;
  extra_data: string;
  nonce: number;
  session: number;
  era: number;
}

export interface EvmTransaction {
  hash: string;
  block_number: number;
  timestamp: number;
  from: string;
  to: string;
  value: number;
  gas_price: number;
  gas_limit: number;
  gas_used: number;
  nonce: number;
  status: TransactionStatus;
  transaction_type: TransactionType;
  fee: number;
  transaction_method: string | null;
}

export interface EvmAccount {
  address: string;
  balance_token: number;
  free_balance: number;
  nonce: number;
  is_contract: boolean;
  address_type: AddressType;
  created_at: number;
  last_activity: number;
}

export interface EvmContract {
  address: string;
  contract_type: ContractType;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
  is_verified: boolean;
  creator_info: ContractCreatorInfo;
}

export interface ContractCreatorInfo {
  contract_address: string;
  creator_address: string;
  transaction_hash: string;
  block_number: number;
  timestamp: number;
  creation_bytecode: string;
}

export interface SubstrateBlock {
  number: number;
  timestamp: number;
  is_finalize: boolean;
  hash: string;
  parent_hash: string;
  state_root: string;
  extrinsics_root: string;
  extrinscs_len: number;
  event_len: number;
}

export interface SubstrateExtrinsic {
  block_number: number;
  extrinsic_index: number;
  hash: string;
  is_signed: boolean;
  signer: string;
  call_module: string;
  call_function: string;
  args: string;
  timestamp: number;
}

export interface SubstrateEvent {
  block_number: number;
  event_index: number;
  phase: string;
  module: string;
  event: string;
  data: string;
  timestamp: number;
}

export interface NetworkInfo {
  chain_id: number;
  gas_price: number;
  max_priority_fee: number;
  max_fee: number;
  latest_block_number: number;
  syncing: boolean;
}

export interface SessionEra {
  era: number;
  start_at: number;
  end_at: number;
  session: number;
}

// Enums and Union Types
export type TransactionStatus = "Success" | "Failed" | "Pending";
export type TransactionType = "Legacy" | "AccessList" | "DynamicFee";
export type AddressType = "SS58" | "H160";
export type ContractType =
  | "ERC20"
  | "ERC721"
  | "ERC1155"
  | "DEX"
  | "LendingProtocol"
  | "Proxy"
  | "Oracle"
  | "Unknown";
