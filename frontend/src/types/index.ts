// Common Types
export type NetworkType = "evm" | "wasm"; // TODO: Consolidate with NetworkType enum in common.ts

// Block Types
export interface Block {
  id: string;
  number: number;
  hash: string;
  parentHash: string;
  timestamp: string;
  transactionCount: number;
  size: number;
  gasUsed: string;
  gasLimit: string;
  validator: string;
  networkType: NetworkType;
  extraData?: string;
  stateRoot: string;
  nonce?: string;
}

// Substrate Block Type (matches backend model)
export interface SubstrateBlock {
  number: number;
  timestamp: number; // seconds (not milliseconds like EVM)
  is_finalize: boolean;
  hash: string;
  parent_hash: string;
  state_root: string;
  extrinsics_root: string;
  extrinscs_len: number; // Note: typo exists in backend
  events_len: number;
}

// Transaction Types
export type TransactionStatus = "success" | "failed" | "pending";
export type TransactionType =
  | "transfer"
  | "contract_call"
  | "contract_creation"
  | "extrinsic";

export interface Transaction {
  id: string;
  hash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice?: string;
  gasLimit?: string;
  gasUsed?: string;
  nonce: number;
  status: TransactionStatus;
  transactionType: TransactionType;
  networkType: NetworkType;
  input?: string;
  decodedInput?: Record<string, unknown>;
  logs?: TransactionLog[];
  events?: TransactionEvent[];
  fee?: string;
}

export interface TransactionLog {
  id: string;
  transactionHash: string;
  logIndex: number;
  address: string;
  data: string;
  topics: string[];
  blockNumber: number;
  blockHash: string;
  removed: boolean;
}

export interface TransactionEvent {
  id: string;
  transactionHash: string;
  eventIndex: number;
  section: string;
  method: string;
  phase: string;
  data: Record<string, unknown>;
}

// Account Types
export type AccountType = "eoa" | "contract_evm" | "contract_wasm" | "system";

export interface Account {
  id: string;
  address: string;
  balance: string;
  nonce: number;
  type: AccountType;
  createdAt: string;
  transactionCount: number;
  networkType: NetworkType;
  code?: string;
  storage?: Record<string, string>;
  tokens?: TokenBalance[];
}

export interface TokenBalance {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  balance: string;
}

// Contract Types
export interface Contract {
  id: string;
  address: string;
  creator: string;
  creationTransaction: string;
  createdAt: string;
  networkType: NetworkType;
  name?: string;
  verified: boolean;
  verifiedAt?: string;
  sourceCode?: string;
  abi?: Array<Record<string, unknown>>;
  bytecode?: string;
  implementationAddress?: string;
  contractType?: string;
}

// Token Types
export type TokenType = "erc20" | "erc721" | "erc1155" | "substrate_asset";

export interface Token {
  id: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  type: TokenType;
  tokenType?: TokenType;
  networkType: NetworkType;
  creator: string;
  createdAt: string;
  holderCount?: number;
  transferCount?: number;
  logoUrl?: string;
  price?: string;
  priceChange24h?: number;
  marketCap?: string;
  holders?: number;
}

// Validator Types
export interface Validator {
  id: string;
  address: string;
  name?: string;
  totalStake: string;
  selfStake: string;
  commission: string;
  delegatorCount: number;
  uptime: number;
  status: "active" | "waiting" | "inactive";
  blocksProduced: number;
  rewardPoints: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchResult {
  type:
    | "block"
    | "transaction"
    | "account"
    | "contract"
    | "token"
    | "validator";
  id: string;
  title: string;
  subtitle: string;
  networkType: NetworkType;
}

// Network Stats
export interface NetworkStats {
  latestBlock: number;
  averageBlockTime: number;
  totalTransactions: number;
  activeAccounts: number;
  totalAccounts: number;
  gasPrice: string;
  totalValueLocked: string;
  validators: {
    total: number;
    active: number;
  };
}

// Re-export types from separate files
export { SubstrateExtrinsic, SubstrateEvent } from "./extrinsic";
