export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

export interface Routes {
  [key: string]: string;
}

// More specific interface for API endpoints
export interface ApiEndpoints {
  // Top-level string endpoints
  network: string;
  latestBlock: string;
  totalIssuance: string;
  sessionEra: string;
  totalStaking: string;
  ss58ToEvm: string;
  evmToSs58: string;
  
  // Nested endpoint objects
  evm: EvmEndpoints;
  substrate: SubstrateEndpoints;
}

export interface EvmEndpoints {
  blocks: string;
  blocksLatest: string;
  blocksByNumber: string;
  blocksByHash: string;
  transactions: string;
  transactionsLatest: string;
  transactionsByHash: string;
  transactionsByBlock: string;
  accounts: string;
  accountsByAddress: string;
  accountsByBalance: string;
  contracts: string;
  contractsByAddress: string;
  contractsByType: string;
  contractsVerified: string;
}

export interface SubstrateEndpoints {
  blocks: string;
  blocksLatest: string;
  blocksByNumber: string;
  blocksByHash: string;
  extrinsics: string;
  extrinsicsByBlock: string;
  extrinsicsBySigner: string;
  extrinsicsByModule: string;
  events: string;
  eventsByBlock: string;
  eventsByModule: string;
  eventsByName: string;
  eventsRecent: string;
}