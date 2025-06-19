import type {
  NetworkType,
  PaginatedResponse,
  SearchResult,
  TokenType,
  Validator,
  NetworkStats,
  Block,
  Transaction,
  Account,
  Contract,
  Token,
} from "../types";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000";
const API_ENDPOINTS = {
  // Network endpoints
  NETWORK: "/api/network",
  LATEST_BLOCK: "/api/latest_block",
  TOTAL_ISSUANCE: "/api/get_total_issuance",
  SESSION_ERA: "/api/session_era",
  TOTAL_STAKING: "/api/get_total_staking",

  // Address conversion
  SS58_TO_EVM: "/api/convert/ss58_to_evm_address",
  EVM_TO_SS58: "/api/convert/evm_to_ss58_address",

  // EVM endpoints
  EVM_BLOCKS: "/api/evm/blocks",
  EVM_BLOCKS_LATEST: "/api/evm/blocks/latest",
  EVM_BLOCKS_NUMBER: "/api/evm/blocks/number",
  EVM_BLOCKS_HASH: "/api/evm/blocks/hash",
  EVM_TRANSACTIONS: "/api/evm/transactions",
  EVM_TRANSACTIONS_LATEST: "/api/evm/transactions/latest",
  EVM_TRANSACTIONS_HASH: "/api/evm/transactions/hash",
  EVM_TRANSACTIONS_BLOCK: "/api/evm/transactions/block",
  EVM_ACCOUNTS: "/api/evm/accounts",
  EVM_ACCOUNTS_ADDRESS: "/api/evm/accounts/address",
  EVM_ACCOUNTS_BALANCE: "/api/evm/accounts/balance",
  EVM_CONTRACTS: "/api/evm/contracts",
  EVM_CONTRACTS_ADDRESS: "/api/evm/contracts/address",
  EVM_CONTRACTS_TYPE: "/api/evm/contracts/type",
  EVM_CONTRACTS_VERIFIED: "/api/evm/contracts/verified",

  // Substrate endpoints
  SUBSTRATE_BLOCKS: "/api/substrate/blocks",
  SUBSTRATE_BLOCKS_LATEST: "/api/substrate/blocks/latest",
  SUBSTRATE_BLOCKS_NUMBER: "/api/substrate/blocks/number",
  SUBSTRATE_BLOCKS_HASH: "/api/substrate/blocks/hash",
  SUBSTRATE_EXTRINSICS: "/api/substrate/extrinsics",
  SUBSTRATE_EXTRINSICS_BLOCK: "/api/substrate/extrinsics/block",
  SUBSTRATE_EXTRINSICS_SIGNER: "/api/substrate/extrinsics/signer",
  SUBSTRATE_EXTRINSICS_MODULE: "/api/substrate/extrinsics/module",
  SUBSTRATE_EVENTS: "/api/substrate/events",
  SUBSTRATE_EVENTS_BLOCK: "/api/substrate/events/block",
  SUBSTRATE_EVENTS_MODULE: "/api/substrate/events/module",
  SUBSTRATE_EVENTS_NAME: "/api/substrate/events/name",
  SUBSTRATE_EVENTS_RECENT: "/api/substrate/events/recent",
};

// Backend API Response Format
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Utility functions
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;

    const delay = Math.min(
      RETRY_CONFIG.baseDelay * (RETRY_CONFIG.maxRetries - retries + 1),
      RETRY_CONFIG.maxDelay
    );

    await sleep(delay);
    return withRetry(fn, retries - 1);
  }
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  return withRetry(async () => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "API request failed");
    }

    // Handle null data from backend - this is normal for some endpoints when no data exists
    if (result.data === null) {
      // For array endpoints, return empty array instead of null
      if (
        endpoint.includes("blocks") ||
        endpoint.includes("transactions") ||
        endpoint.includes("accounts") ||
        endpoint.includes("contracts")
      ) {
        return [] as unknown as T;
      }
      // For single item endpoints, return null
      return null as unknown as T;
    }

    return result.data as T;
  });
};

// Backend data type mappings
interface BackendEvmBlock {
  number: number;
  hash: string;
  parent_hash: string;
  timestamp: number; // milliseconds
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

interface BackendEvmTransaction {
  hash: string;
  block_number: number;
  timestamp: number; // milliseconds
  from: string;
  to: string | null;
  value: number;
  gas_price: number;
  gas_limit: number;
  gas_used: number;
  nonce: number;
  status: "Success" | "Failed" | "Pending";
  transaction_type: "Legacy" | "AccessList" | "DynamicFee";
  fee: number;
  transaction_method: string | null;
}

interface BackendEvmAccount {
  address: string;
  balance_token: number;
  free_balance: number;
  nonce: number;
  is_contract: boolean;
  address_type: "H160";
  created_at: number;
  last_activity: number;
}

interface BackendEvmContract {
  address: string;
  contract_type: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  total_supply?: string;
  is_verified: boolean;
  creator_info?: {
    contract_address: string;
    creator_address: string;
    transaction_hash: string;
    block_number: number;
    timestamp: number;
    creation_bytecode: string;
  };
}

interface BackendSubstrateBlock {
  number: number;
  timestamp: number; // seconds (not milliseconds!)
  is_finalize: boolean;
  hash: string;
  parent_hash: string;
  state_root: string;
  extrinsics_root: string;
  extrinscs_len?: number; // note the typo in backend
  event_len?: number;
}

interface BackendSubstrateExtrinsic {
  block_number: number;
  extrinsic_index: number;
  is_signed: boolean;
  signer: string | null;
  call_module: string;
  call_function: string;
  args: string;
  timestamp: number; // seconds
}

interface BackendSubstrateEvent {
  block_number: number;
  event_index: number;
  phase: string;
  module: string;
  event: string;
  data: string;
  timestamp: number; // seconds
}

interface BackendNetworkInfo {
  chain_id: number;
  gas_price: number;
  max_priority_fee: number;
  max_fee: number;
  latest_block_number: number;
  syncing: boolean;
}

interface BackendEraSession {
  era: number;
  start_at: number;
  end_at: number;
  session: number;
}

// Data transformation utilities
const transformBackendBlockToFrontend = (
  backendBlock: BackendEvmBlock
): Block => ({
  id: `block-${backendBlock.number}`,
  number: backendBlock.number,
  hash: backendBlock.hash,
  parentHash: backendBlock.parent_hash,
  timestamp: new Date(backendBlock.timestamp).toISOString(),
  transactionCount: backendBlock.transaction_count,
  size: backendBlock.size,
  gasUsed: backendBlock.gas_used.toString(),
  gasLimit: backendBlock.gas_limit.toString(),
  validator: backendBlock.validator,
  networkType: "evm" as NetworkType,
  extraData: backendBlock.extra_data,
  stateRoot: backendBlock.hash, // Using hash as state root for now
  nonce: backendBlock.nonce.toString(),
});

const transformBackendTransactionToFrontend = (
  backendTx: BackendEvmTransaction
): Transaction => ({
  id: backendTx.hash,
  hash: backendTx.hash,
  blockNumber: backendTx.block_number,
  blockHash: "", // Not provided in backend response
  timestamp: new Date(backendTx.timestamp).toISOString(),
  from: backendTx.from,
  to: backendTx.to,
  value: backendTx.value.toString(),
  gasPrice: backendTx.gas_price.toString(),
  gasLimit: backendTx.gas_limit.toString(),
  gasUsed: backendTx.gas_used.toString(),
  nonce: backendTx.nonce,
  status: backendTx.status.toLowerCase() as "success" | "failed" | "pending",
  transactionType:
    backendTx.transaction_type === "Legacy" ? "transfer" : "contract_call",
  networkType: "evm" as NetworkType,
  fee: backendTx.fee.toString(),
});

const transformBackendAccountToFrontend = (
  backendAccount: BackendEvmAccount
): Account => ({
  id: backendAccount.address,
  address: backendAccount.address,
  balance: backendAccount.balance_token.toString(),
  nonce: backendAccount.nonce,
  type: backendAccount.is_contract ? "contract_evm" : "eoa",
  createdAt: new Date(backendAccount.created_at).toISOString(),
  transactionCount: backendAccount.nonce, // Using nonce as transaction count approximation
  networkType: "evm" as NetworkType,
});

const transformBackendContractToFrontend = (
  backendContract: BackendEvmContract
): Contract => ({
  id: backendContract.address,
  address: backendContract.address,
  creator: backendContract.creator_info?.creator_address || "",
  creationTransaction: backendContract.creator_info?.transaction_hash || "",
  createdAt: backendContract.creator_info
    ? new Date(backendContract.creator_info.timestamp).toISOString()
    : "",
  networkType: "evm" as NetworkType,
  name: backendContract.name,
  verified: backendContract.is_verified,
  contractType: backendContract.contract_type,
});

/**
 * API Service class for interacting with blockchain data
 * Now using real backend endpoints
 */
export class ApiService {
  // Network Information
  async getNetworkInfo() {
    return apiRequest<BackendNetworkInfo>(API_ENDPOINTS.NETWORK);
  }

  async getLatestBlockNumber(): Promise<number> {
    return apiRequest<number>(API_ENDPOINTS.LATEST_BLOCK);
  }

  async getTotalIssuance(): Promise<number> {
    return apiRequest<number>(API_ENDPOINTS.TOTAL_ISSUANCE);
  }

  async getSessionEra() {
    return apiRequest<BackendEraSession>(API_ENDPOINTS.SESSION_ERA);
  }

  async getTotalStaking(): Promise<number> {
    return apiRequest<number>(API_ENDPOINTS.TOTAL_STAKING);
  }

  // Address Conversion
  async convertSS58ToEVM(address: string): Promise<string> {
    return apiRequest<string>(`${API_ENDPOINTS.SS58_TO_EVM}/${address}`);
  }

  async convertEVMToSS58(address: string): Promise<string> {
    return apiRequest<string>(`${API_ENDPOINTS.EVM_TO_SS58}/${address}`);
  }

  // EVM Blocks
  async getBlocks(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Block>> {
    try {
      const offset = (page - 1) * pageSize;
      const blocks = await apiRequest<BackendEvmBlock[]>(
        `${API_ENDPOINTS.EVM_BLOCKS}?limit=${pageSize}&offset=${offset}`
      );

      // Handle null or empty response
      if (!blocks || !Array.isArray(blocks)) {
        return {
          items: [],
          totalCount: 0,
          page,
          pageSize,
          hasMore: false,
        };
      }

      return {
        items: blocks.map(transformBackendBlockToFrontend),
        totalCount: blocks.length,
        page,
        pageSize,
        hasMore: blocks.length === pageSize,
      };
    } catch (error) {
      console.warn("Error fetching blocks, returning empty result:", error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
  }

  async getBlock(numberOrHash: string | number): Promise<Block | null> {
    try {
      let backendBlock: BackendEvmBlock;

      if (
        typeof numberOrHash === "number" ||
        /^\d+$/.test(numberOrHash.toString())
      ) {
        backendBlock = await apiRequest<BackendEvmBlock>(
          `${API_ENDPOINTS.EVM_BLOCKS_NUMBER}/${numberOrHash}`
        );
      } else {
        backendBlock = await apiRequest<BackendEvmBlock>(
          `${API_ENDPOINTS.EVM_BLOCKS_HASH}/${numberOrHash}`
        );
      }

      return transformBackendBlockToFrontend(backendBlock);
    } catch (error) {
      console.error("Error fetching block:", error);
      return null;
    }
  }

  async getLatestBlock(): Promise<Block | null> {
    try {
      const backendBlock = await apiRequest<BackendEvmBlock>(
        API_ENDPOINTS.EVM_BLOCKS_LATEST
      );
      return transformBackendBlockToFrontend(backendBlock);
    } catch (error) {
      console.error("Error fetching latest block:", error);
      return null;
    }
  }

  // EVM Transactions
  async getTransactions(
    page: number = 1,
    pageSize: number = 10,
    address?: string
  ): Promise<PaginatedResponse<Transaction>> {
    try {
      const offset = (page - 1) * pageSize;
      let endpoint = `${API_ENDPOINTS.EVM_TRANSACTIONS}?limit=${pageSize}&offset=${offset}`;

      // Backend doesn't support filtering by address in the main endpoint
      // This would need to be implemented differently
      if (address) {
        console.warn("Address filtering not yet implemented in backend");
      }

      const transactions = await apiRequest<BackendEvmTransaction[]>(endpoint);

      // Handle null or empty response
      if (!transactions || !Array.isArray(transactions)) {
        return {
          items: [],
          totalCount: 0,
          page,
          pageSize,
          hasMore: false,
        };
      }

      return {
        items: transactions.map(transformBackendTransactionToFrontend),
        totalCount: transactions.length,
        page,
        pageSize,
        hasMore: transactions.length === pageSize,
      };
    } catch (error) {
      console.warn(
        "Error fetching transactions, returning empty result:",
        error
      );
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
  }

  async getTransaction(hash: string): Promise<Transaction | null> {
    try {
      const backendTx = await apiRequest<BackendEvmTransaction>(
        `${API_ENDPOINTS.EVM_TRANSACTIONS_HASH}/${hash}`
      );
      return transformBackendTransactionToFrontend(backendTx);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  async getTransactionsByBlock(blockNumber: number): Promise<Transaction[]> {
    try {
      const transactions = await apiRequest<BackendEvmTransaction[]>(
        `${API_ENDPOINTS.EVM_TRANSACTIONS_BLOCK}/${blockNumber}`
      );
      return transactions.map(transformBackendTransactionToFrontend);
    } catch (error) {
      console.error("Error fetching transactions by block:", error);
      return [];
    }
  }

  // EVM Accounts
  async getAccounts(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Account>> {
    const offset = (page - 1) * pageSize;
    const accounts = await apiRequest<BackendEvmAccount[]>(
      `${API_ENDPOINTS.EVM_ACCOUNTS}?limit=${pageSize}&offset=${offset}`
    );

    return {
      items: accounts.map(transformBackendAccountToFrontend),
      totalCount: accounts.length,
      page,
      pageSize,
      hasMore: accounts.length === pageSize,
    };
  }

  async getAccount(address: string): Promise<Account | null> {
    try {
      const backendAccount = await apiRequest<BackendEvmAccount>(
        `${API_ENDPOINTS.EVM_ACCOUNTS_ADDRESS}/${address}`
      );
      return transformBackendAccountToFrontend(backendAccount);
    } catch (error) {
      console.error("Error fetching account:", error);
      return null;
    }
  }

  // EVM Contracts
  async getContracts(
    page: number = 1,
    pageSize: number = 10,
    networkType?: NetworkType
  ): Promise<PaginatedResponse<Contract>> {
    const offset = (page - 1) * pageSize;
    // Backend doesn't filter by network type in contracts endpoint
    const contracts = await apiRequest<BackendEvmContract[]>(
      `${API_ENDPOINTS.EVM_CONTRACTS}?limit=${pageSize}&offset=${offset}`
    );

    return {
      items: contracts.map(transformBackendContractToFrontend),
      totalCount: contracts.length,
      page,
      pageSize,
      hasMore: contracts.length === pageSize,
    };
  }

  async getContract(address: string): Promise<Contract | null> {
    try {
      const backendContract = await apiRequest<BackendEvmContract>(
        `${API_ENDPOINTS.EVM_CONTRACTS_ADDRESS}/${address}`
      );
      return transformBackendContractToFrontend(backendContract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      return null;
    }
  }

  // Tokens (using contracts endpoint for now)
  async getTokens(
    page: number = 1,
    pageSize: number = 10,
    type?: string,
    networkType?: NetworkType
  ): Promise<PaginatedResponse<Token>> {
    // Use contracts endpoint and filter by type
    let endpoint = `${API_ENDPOINTS.EVM_CONTRACTS}`;
    if (type) {
      endpoint = `${API_ENDPOINTS.EVM_CONTRACTS_TYPE}/${type}`;
    }

    const offset = (page - 1) * pageSize;
    endpoint += `?limit=${pageSize}&offset=${offset}`;

    const contracts = await apiRequest<BackendEvmContract[]>(endpoint);

    // Transform contracts to tokens
    const tokens: Token[] = contracts
      .filter((contract) =>
        ["ERC20", "ERC721", "ERC1155"].includes(contract.contract_type)
      )
      .map((contract) => ({
        id: contract.address,
        address: contract.address,
        name: contract.name || "Unknown Token",
        symbol: contract.symbol || "UNK",
        decimals: contract.decimals || 18,
        totalSupply: contract.total_supply || "0",
        type: contract.contract_type.toLowerCase() as TokenType,
        tokenType: contract.contract_type.toLowerCase() as TokenType,
        networkType: "evm" as NetworkType,
        creator: contract.creator_info?.creator_address || "",
        createdAt: contract.creator_info
          ? new Date(contract.creator_info.timestamp).toISOString()
          : "",
      }));

    return {
      items: tokens,
      totalCount: tokens.length,
      page,
      pageSize,
      hasMore: tokens.length === pageSize,
    };
  }

  async getToken(address: string): Promise<Token | null> {
    try {
      const contract = await this.getContract(address);
      if (
        !contract ||
        !["ERC20", "ERC721", "ERC1155"].includes(contract.contractType || "")
      ) {
        return null;
      }

      // Get additional token info from contract
      const backendContract = await apiRequest<BackendEvmContract>(
        `${API_ENDPOINTS.EVM_CONTRACTS_ADDRESS}/${address}`
      );

      return {
        id: contract.address,
        address: contract.address,
        name: backendContract.name || "Unknown Token",
        symbol: backendContract.symbol || "UNK",
        decimals: backendContract.decimals || 18,
        totalSupply: backendContract.total_supply || "0",
        type: contract.contractType?.toLowerCase() as TokenType,
        tokenType: contract.contractType?.toLowerCase() as TokenType,
        networkType: "evm" as NetworkType,
        creator: contract.creator,
        createdAt: contract.createdAt,
      };
    } catch (error) {
      console.error("Error fetching token:", error);
      return null;
    }
  }

  // Validators (not implemented in backend yet - using mock for now)
  async getValidators(
    page: number = 1,
    pageSize: number = 10,
    status?: "active" | "waiting" | "inactive"
  ): Promise<PaginatedResponse<Validator>> {
    // TODO: Implement when backend provides validator endpoints
    console.warn("Validator endpoints not yet implemented in backend");
    return {
      items: [],
      totalCount: 0,
      page,
      pageSize,
      hasMore: false,
    };
  }

  async getValidator(address: string): Promise<Validator> {
    // TODO: Implement when backend provides validator endpoints
    console.warn("Validator endpoints not yet implemented in backend");
    throw new Error(
      `Validator with address ${address} not found - endpoint not implemented`
    );
  }

  // Network Stats (constructed from various endpoints)
  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const [networkInfo, latestBlockNumber, totalIssuance, totalStaking] =
        await Promise.all([
          this.getNetworkInfo(),
          this.getLatestBlockNumber(),
          this.getTotalIssuance(),
          this.getTotalStaking(),
        ]);

      return {
        latestBlock: latestBlockNumber,
        averageBlockTime: 12, // TODO: Calculate from actual data
        totalTransactions: 0, // TODO: Get from backend
        activeAccounts: 0, // TODO: Get from backend
        totalAccounts: 0, // TODO: Get from backend
        gasPrice: networkInfo.gas_price.toString(),
        totalValueLocked: totalStaking.toString(),
        validators: {
          total: 0, // TODO: Get from backend
          active: 0, // TODO: Get from backend
        },
      };
    } catch (error) {
      console.error("Error fetching network stats:", error);
      // Return default stats on error
      return {
        latestBlock: 0,
        averageBlockTime: 12,
        totalTransactions: 0,
        activeAccounts: 0,
        totalAccounts: 0,
        gasPrice: "0",
        totalValueLocked: "0",
        validators: {
          total: 0,
          active: 0,
        },
      };
    }
  }

  // Search (basic implementation - needs enhancement)
  async search(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      // Try to search as block number
      if (/^\d+$/.test(query)) {
        const block = await this.getBlock(parseInt(query));
        if (block) {
          results.push({
            type: "block",
            id: block.id,
            title: `Block #${block.number}`,
            subtitle: `${block.transactionCount} transactions`,
            networkType: block.networkType,
          });
        }
      }

      // Try to search as transaction hash
      if (/^0x[a-fA-F0-9]{64}$/.test(query)) {
        const transaction = await this.getTransaction(query);
        if (transaction) {
          results.push({
            type: "transaction",
            id: transaction.id,
            title: `Transaction ${transaction.hash.substring(0, 10)}...`,
            subtitle: `Block #${transaction.blockNumber}`,
            networkType: transaction.networkType,
          });
        }

        // Also try as block hash
        const block = await this.getBlock(query);
        if (block) {
          results.push({
            type: "block",
            id: block.id,
            title: `Block #${block.number}`,
            subtitle: block.hash.substring(0, 20) + "...",
            networkType: block.networkType,
          });
        }
      }

      // Try to search as address
      if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
        const [account, contract] = await Promise.allSettled([
          this.getAccount(query),
          this.getContract(query),
        ]);

        if (account.status === "fulfilled" && account.value) {
          results.push({
            type: "account",
            id: account.value.id,
            title: `Account ${account.value.address.substring(0, 10)}...`,
            subtitle: `Balance: ${account.value.balance}`,
            networkType: account.value.networkType,
          });
        }

        if (contract.status === "fulfilled" && contract.value) {
          results.push({
            type: "contract",
            id: contract.value.id,
            title:
              contract.value.name ||
              `Contract ${contract.value.address.substring(0, 10)}...`,
            subtitle: `Type: ${contract.value.contractType}`,
            networkType: contract.value.networkType,
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    }

    return results;
  }
}

// Create a singleton instance
export const apiService = new ApiService();
