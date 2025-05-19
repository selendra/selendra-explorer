import React, { createContext, useContext, ReactNode } from "react";
import axios from "axios";

// Define the base URL for API requests
const API_BASE_URL = "/api";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Define types for API responses
export interface Block {
  hash: string;
  number: number;
  timestamp: string;
  parent_hash: string;
  author?: string;
  state_root: string;
  transactions_root: string;
  receipts_root: string;
  gas_used: number;
  gas_limit: number;
  extra_data?: string;
  logs_bloom?: string;
  size?: number;
  difficulty?: string;
  total_difficulty?: string;
  consensus_engine?: string;
  finalized?: boolean;
  extrinsics_root?: string;
  validator_set?: string;
  transaction_count: number;
  extrinsic_count?: number;
}

export interface Transaction {
  hash: string;
  block_hash: string;
  block_number: number;
  from_address: string;
  to_address?: string;
  value: string;
  gas: number;
  gas_price: number;
  input?: string;
  nonce: number;
  transaction_index: number;
  status?: boolean;
  transaction_type?: number;
  max_fee_per_gas?: number;
  max_priority_fee_per_gas?: number;
  created_at: string;
  updated_at: string;
  execution_type: string;
  logs: any[];
}

export interface Account {
  address: string;
  balance: string;
  nonce: number;
  is_contract: boolean;
  transaction_count: number;
}

export interface Contract {
  address: string;
  creator_address: string;
  creator_transaction_hash: string;
  bytecode: string;
  abi?: string;
  name?: string;
  compiler_version?: string;
  optimization_used?: boolean;
  runs?: number;
  verified: boolean;
  verification_date?: string;
  license_type?: string;
  balance: string;
  contract_type: string;
}

export interface Extrinsic {
  hash: string;
  block_hash: string;
  block_number: number;
  index: number;
  signer?: string;
  section: string;
  method: string;
  args?: any;
  success: boolean;
  is_signed: boolean;
  signature?: string;
  nonce?: number;
  tip?: number;
  created_at: string;
  updated_at: string;
  event_count: number;
}

export interface Event {
  id: number;
  block_hash: string;
  block_number: number;
  extrinsic_hash?: string;
  extrinsic_index?: number;
  event_index: number;
  section: string;
  method: string;
  data: any;
  phase: string;
  timestamp: string;
}

export interface WasmContract {
  address: string;
  creator_address: string;
  creator_extrinsic_hash: string;
  code_hash: string;
  init_args?: any;
  contract_type: string;
  metadata?: any;
  verified: boolean;
  verification_date?: string;
  balance?: string;
  call_count: number;
}

// Define the API context type
interface ApiContextType {
  // Blocks
  getBlocks: (
    page?: number,
    pageSize?: number
  ) => Promise<{
    blocks: Block[];
    total: number;
    page: number;
    page_size: number;
  }>;
  getBlock: (hashOrNumber: string) => Promise<Block>;

  // Transactions
  getTransactions: (
    page?: number,
    pageSize?: number,
    address?: string
  ) => Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    page_size: number;
  }>;
  getTransaction: (hash: string) => Promise<Transaction>;

  // Accounts
  getAccount: (address: string) => Promise<Account>;

  // Contracts
  getContracts: (
    page?: number,
    pageSize?: number
  ) => Promise<{
    contracts: Contract[];
    total: number;
    page: number;
    page_size: number;
  }>;
  getContract: (address: string) => Promise<Contract>;

  // Extrinsics
  getExtrinsics: (
    page?: number,
    pageSize?: number,
    section?: string,
    method?: string
  ) => Promise<{
    extrinsics: Extrinsic[];
    total: number;
    page: number;
    page_size: number;
  }>;
  getExtrinsic: (hash: string) => Promise<Extrinsic>;

  // Events
  getEvents: (
    page?: number,
    pageSize?: number,
    section?: string,
    method?: string,
    blockNumber?: number,
    extrinsicHash?: string
  ) => Promise<{
    events: Event[];
    total: number;
    page: number;
    page_size: number;
  }>;
  getEvent: (id: number) => Promise<Event>;

  // WASM Contracts
  getWasmContracts: (
    page?: number,
    pageSize?: number
  ) => Promise<{
    contracts: WasmContract[];
    total: number;
    page: number;
    page_size: number;
  }>;
  getWasmContract: (address: string) => Promise<WasmContract>;

  // Search
  search: (query: string) => Promise<{ type: string; result: any }>;
}

// Create the context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Provider component
interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  // Blocks
  const getBlocks = async (page = 1, pageSize = 10) => {
    const response = await apiClient.get(
      `/blocks?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  };

  const getBlock = async (hashOrNumber: string) => {
    const response = await apiClient.get(`/blocks/${hashOrNumber}`);
    return response.data;
  };

  // Transactions
  const getTransactions = async (page = 1, pageSize = 10, address?: string) => {
    let url = `/transactions?page=${page}&page_size=${pageSize}`;
    if (address) {
      url += `&address=${address}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  };

  const getTransaction = async (hash: string) => {
    const response = await apiClient.get(`/transactions/${hash}`);
    return response.data;
  };

  // Accounts
  const getAccount = async (address: string) => {
    const response = await apiClient.get(`/accounts/${address}`);
    return response.data;
  };

  // Contracts
  const getContracts = async (page = 1, pageSize = 10) => {
    const response = await apiClient.get(
      `/contracts?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  };

  const getContract = async (address: string) => {
    const response = await apiClient.get(`/contracts/${address}`);
    return response.data;
  };

  // Extrinsics
  const getExtrinsics = async (
    page = 1,
    pageSize = 10,
    section?: string,
    method?: string
  ) => {
    let url = `/extrinsics?page=${page}&page_size=${pageSize}`;
    if (section) {
      url += `&section=${section}`;
    }
    if (method) {
      url += `&method=${method}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  };

  const getExtrinsic = async (hash: string) => {
    const response = await apiClient.get(`/extrinsics/${hash}`);
    return response.data;
  };

  // Events
  const getEvents = async (
    page = 1,
    pageSize = 10,
    section?: string,
    method?: string,
    blockNumber?: number,
    extrinsicHash?: string
  ) => {
    let url = `/events?page=${page}&page_size=${pageSize}`;
    if (section) {
      url += `&section=${section}`;
    }
    if (method) {
      url += `&method=${method}`;
    }
    if (blockNumber) {
      url += `&block_number=${blockNumber}`;
    }
    if (extrinsicHash) {
      url += `&extrinsic_hash=${extrinsicHash}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  };

  const getEvent = async (id: number) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  };

  // WASM Contracts
  const getWasmContracts = async (page = 1, pageSize = 10) => {
    const response = await apiClient.get(
      `/wasm-contracts?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  };

  const getWasmContract = async (address: string) => {
    const response = await apiClient.get(`/wasm-contracts/${address}`);
    return response.data;
  };

  // Search
  const search = async (query: string) => {
    const response = await apiClient.get(
      `/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  };

  const value = {
    getBlocks,
    getBlock,
    getTransactions,
    getTransaction,
    getAccount,
    getContracts,
    getContract,
    getExtrinsics,
    getExtrinsic,
    getEvents,
    getEvent,
    getWasmContracts,
    getWasmContract,
    search,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

// Hook to use the API context
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
