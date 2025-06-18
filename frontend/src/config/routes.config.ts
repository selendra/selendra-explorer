import { Routes, ApiEndpoints } from '../types';

export const ROUTES: Routes = {
  // Main navigation
  home: '/',
  dashboard: '/dashboard',
  
  // EVM routes
  evmBlocks: '/evm/blocks',
  evmBlock: '/evm/block',
  evmTransactions: '/evm/transactions',
  evmTransaction: '/evm/transaction',
  evmAccounts: '/evm/accounts',
  evmAccount: '/evm/account',
  evmContracts: '/evm/contracts',
  evmContract: '/evm/contract',
  
  // Substrate routes
  substrateBlocks: '/substrate/blocks',
  substrateBlock: '/substrate/block',
  substrateExtrinsics: '/substrate/extrinsics',
  substrateExtrinsic: '/substrate/extrinsic',
  substrateEvents: '/substrate/events',
  substrateEvent: '/substrate/event',
  
  // Utility routes
  addressConverter: '/address-converter',
  search: '/search',
  network: '/network',
  analytics: '/analytics',
  
  // Static pages
  about: '/about',
  contact: '/contact',
  api: '/api-docs',
} as const;

export const API_ENDPOINTS: ApiEndpoints = {
  // Network endpoints
  network: '/network',
  latestBlock: '/latest_block',
  totalIssuance: '/get_total_issuance',
  sessionEra: '/session_era',
  totalStaking: '/get_total_staking',
  
  // Address conversion
  ss58ToEvm: '/convert/ss58_to_evm_address',
  evmToSs58: '/convert/evm_to_ss58_address',
  
  // EVM endpoints
  evm: {
    blocks: '/evm/blocks',
    blocksLatest: '/evm/blocks/latest',
    blocksByNumber: '/evm/blocks/number',
    blocksByHash: '/evm/blocks/hash',
    transactions: '/evm/transactions',
    transactionsLatest: '/evm/transactions/latest',
    transactionsByHash: '/evm/transactions/hash',
    transactionsByBlock: '/evm/transactions/block',
    accounts: '/evm/accounts',
    accountsByAddress: '/evm/accounts/address',
    accountsByBalance: '/evm/accounts/balance',
    contracts: '/evm/contracts',
    contractsByAddress: '/evm/contracts/address',
    contractsByType: '/evm/contracts/type',
    contractsVerified: '/evm/contracts/verified',
  },
  
  // Substrate endpoints
  substrate: {
    blocks: '/substrate/blocks',
    blocksLatest: '/substrate/blocks/latest',
    blocksByNumber: '/substrate/blocks/number',
    blocksByHash: '/substrate/blocks/hash',
    extrinsics: '/substrate/extrinsics',
    extrinsicsByBlock: '/substrate/extrinsics/block',
    extrinsicsBySigner: '/substrate/extrinsics/signer',
    extrinsicsByModule: '/substrate/extrinsics/module',
    events: '/substrate/events',
    eventsByBlock: '/substrate/events/block',
    eventsByModule: '/substrate/events/module',
    eventsByName: '/substrate/events/name',
    eventsRecent: '/substrate/events/recent',
  }
} as const;