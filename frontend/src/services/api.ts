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
  SubstrateBlock,
  SubstrateExtrinsic,
  SubstrateEvent,
} from "../types";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.explorer.selendra.org";
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
    timestamp: string | number; // Can be string or number from backend
    creation_bytecode: string;
  };
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
  timestamp: new Date(backendBlock.timestamp * 1000).toISOString(), // EVM timestamps are in seconds, convert to ms
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
  timestamp: new Date(backendTx.timestamp * 1000).toISOString(), // EVM timestamps are in seconds, convert to ms
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
    ? new Date(
        parseInt(backendContract.creator_info.timestamp.toString()) * 1000
      ).toISOString()
    : "",
  networkType: "evm" as NetworkType,
  name: backendContract.name || "Unnamed Contract",
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
    pageSize: number = 10
  ): Promise<PaginatedResponse<Contract>> {
    const offset = (page - 1) * pageSize;
    // Backend doesn't filter by network type in contracts endpoint
    const contracts = await apiRequest<BackendEvmContract[]>(
      `${API_ENDPOINTS.EVM_CONTRACTS}?limit=${pageSize}&offset=${offset}`
    );

    // Since the backend doesn't provide total count, we estimate it
    // If we get a full page, assume there are more items
    const hasMore = contracts.length === pageSize;
    const estimatedTotal = hasMore
      ? page * pageSize + 1
      : (page - 1) * pageSize + contracts.length;

    return {
      items: contracts.map(transformBackendContractToFrontend),
      totalCount: estimatedTotal,
      page,
      pageSize,
      hasMore,
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
    type?: string
  ): Promise<PaginatedResponse<Token>> {
    try {
      // Use contracts endpoint and filter by type
      let endpoint = `${API_ENDPOINTS.EVM_CONTRACTS}`;
      if (type && type !== "all") {
        endpoint = `${API_ENDPOINTS.EVM_CONTRACTS_TYPE}/${type.toUpperCase()}`;
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
            ? new Date(
                typeof contract.creator_info.timestamp === "string"
                  ? parseInt(contract.creator_info.timestamp) * 1000
                  : contract.creator_info.timestamp * 1000
              ).toISOString()
            : new Date().toISOString(),
          // Additional fields for better UX
          holders: Math.floor(Math.random() * 1000) + 10, // Mock data for now
          price:
            contract.contract_type === "ERC20"
              ? (Math.random() * 100).toFixed(4)
              : undefined,
          priceChange24h:
            contract.contract_type === "ERC20"
              ? parseFloat((Math.random() * 20 - 10).toFixed(2))
              : undefined,
          marketCap:
            contract.contract_type === "ERC20"
              ? (Math.random() * 1000000).toFixed(0)
              : undefined,
          logoUrl: undefined,
        }));

      // Get total count by fetching all contracts (for now, since backend doesn't provide total count)
      let totalCount = tokens.length;
      try {
        const allContracts = await apiRequest<BackendEvmContract[]>(
          type && type !== "all"
            ? `${API_ENDPOINTS.EVM_CONTRACTS_TYPE}/${type.toUpperCase()}`
            : API_ENDPOINTS.EVM_CONTRACTS
        );
        totalCount = allContracts.filter((contract) =>
          ["ERC20", "ERC721", "ERC1155"].includes(contract.contract_type)
        ).length;
      } catch (error) {
        console.warn("Failed to get total count:", error);
      }

      return {
        items: tokens,
        totalCount,
        page,
        pageSize,
        hasMore: tokens.length === pageSize,
      };
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
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

  // Substrate Blocks
  async getSubstrateBlocks(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<SubstrateBlock>> {
    try {
      const offset = (page - 1) * pageSize;
      const blocks = await apiRequest<SubstrateBlock[]>(
        `${API_ENDPOINTS.SUBSTRATE_BLOCKS}?limit=${pageSize}&offset=${offset}`
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
        items: blocks,
        totalCount: blocks.length,
        page,
        pageSize,
        hasMore: blocks.length === pageSize,
      };
    } catch (error) {
      console.warn(
        "Error fetching substrate blocks, returning empty result:",
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

  async getSubstrateBlock(
    numberOrHash: string | number
  ): Promise<SubstrateBlock | null> {
    try {
      let block: SubstrateBlock;

      if (
        typeof numberOrHash === "number" ||
        /^\d+$/.test(numberOrHash.toString())
      ) {
        block = await apiRequest<SubstrateBlock>(
          `${API_ENDPOINTS.SUBSTRATE_BLOCKS_NUMBER}/${numberOrHash}`
        );
      } else {
        block = await apiRequest<SubstrateBlock>(
          `${API_ENDPOINTS.SUBSTRATE_BLOCKS_HASH}/${numberOrHash}`
        );
      }

      return block;
    } catch (error) {
      console.error("Error fetching substrate block:", error);
      return null;
    }
  }

  async getLatestSubstrateBlock(): Promise<SubstrateBlock | null> {
    try {
      const block = await apiRequest<SubstrateBlock>(
        API_ENDPOINTS.SUBSTRATE_BLOCKS_LATEST
      );
      return block;
    } catch (error) {
      console.error("Error fetching latest substrate block:", error);
      return null;
    }
  }

  // Substrate Extrinsics
  async getSubstrateExtrinsics(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<SubstrateExtrinsic>> {
    try {
      const offset = (page - 1) * pageSize;
      const extrinsics = await apiRequest<SubstrateExtrinsic[]>(
        `${API_ENDPOINTS.SUBSTRATE_EXTRINSICS}?limit=${pageSize}&offset=${offset}`
      );

      // Handle null or empty response
      if (!extrinsics || !Array.isArray(extrinsics)) {
        return {
          items: [],
          totalCount: 0,
          page,
          pageSize,
          hasMore: false,
        };
      }

      return {
        items: extrinsics,
        totalCount: extrinsics.length,
        page,
        pageSize,
        hasMore: extrinsics.length === pageSize,
      };
    } catch (error) {
      console.warn(
        "Error fetching substrate extrinsics, returning empty result:",
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

  async getSubstrateExtrinsicsByBlock(
    blockNumber: number
  ): Promise<SubstrateExtrinsic[]> {
    try {
      const extrinsics = await apiRequest<SubstrateExtrinsic[]>(
        `${API_ENDPOINTS.SUBSTRATE_EXTRINSICS_BLOCK}/${blockNumber}`
      );
      return extrinsics || [];
    } catch (error) {
      console.error("Error fetching substrate extrinsics by block:", error);
      return [];
    }
  }

  async getSubstrateExtrinsicsBySigner(
    signer: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<SubstrateExtrinsic>> {
    try {
      const offset = (page - 1) * pageSize;
      const extrinsics = await apiRequest<SubstrateExtrinsic[]>(
        `${API_ENDPOINTS.SUBSTRATE_EXTRINSICS_SIGNER}/${signer}?limit=${pageSize}&offset=${offset}`
      );

      if (!extrinsics || !Array.isArray(extrinsics)) {
        return {
          items: [],
          totalCount: 0,
          page,
          pageSize,
          hasMore: false,
        };
      }

      return {
        items: extrinsics,
        totalCount: extrinsics.length,
        page,
        pageSize,
        hasMore: extrinsics.length === pageSize,
      };
    } catch (error) {
      console.warn("Error fetching substrate extrinsics by signer:", error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
  }

  async getSubstrateExtrinsicsByModule(
    module: string,
    functionName?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<SubstrateExtrinsic>> {
    try {
      const offset = (page - 1) * pageSize;
      let endpoint = `${API_ENDPOINTS.SUBSTRATE_EXTRINSICS_MODULE}?module=${module}&limit=${pageSize}&offset=${offset}`;

      if (functionName) {
        endpoint += `&function=${functionName}`;
      }

      const extrinsics = await apiRequest<SubstrateExtrinsic[]>(endpoint);

      if (!extrinsics || !Array.isArray(extrinsics)) {
        return {
          items: [],
          totalCount: 0,
          page,
          pageSize,
          hasMore: false,
        };
      }

      return {
        items: extrinsics,
        totalCount: extrinsics.length,
        page,
        pageSize,
        hasMore: extrinsics.length === pageSize,
      };
    } catch (error) {
      console.warn("Error fetching substrate extrinsics by module:", error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
  }

  // Substrate Events
  async getSubstrateEvents(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<SubstrateEvent>> {
    const offset = (page - 1) * pageSize;
    try {
      const events = await apiRequest<SubstrateEvent[]>(
        `${API_ENDPOINTS.SUBSTRATE_EVENTS}?limit=${pageSize}&offset=${offset}`
      );

      const convertedEvents = events.map((event) => ({
        ...event,
        // Backend provides timestamp in milliseconds
        timestamp: event.timestamp,
      }));

      return {
        items: convertedEvents,
        totalCount: events.length,
        page,
        pageSize,
        hasMore: events.length === pageSize,
      };
    } catch (error) {
      console.warn(
        "Error fetching substrate events, returning empty result:",
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

  async getSubstrateEventsByBlock(
    blockNumber: number
  ): Promise<SubstrateEvent[]> {
    try {
      const events = await apiRequest<SubstrateEvent[]>(
        `${API_ENDPOINTS.SUBSTRATE_EVENTS_BLOCK}/${blockNumber}`
      );
      return events.map((event) => ({
        ...event,
        timestamp: event.timestamp,
      }));
    } catch (error) {
      console.error("Error fetching substrate events by block:", error);
      return [];
    }
  }

  async getSubstrateEventsByModule(
    module: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<SubstrateEvent>> {
    const offset = (page - 1) * pageSize;
    try {
      let endpoint = `${API_ENDPOINTS.SUBSTRATE_EVENTS_MODULE}?module=${module}&limit=${pageSize}&offset=${offset}`;

      const events = await apiRequest<SubstrateEvent[]>(endpoint);

      const convertedEvents = events.map((event) => ({
        ...event,
        timestamp: event.timestamp,
      }));

      return {
        items: convertedEvents,
        totalCount: events.length,
        page,
        pageSize,
        hasMore: events.length === pageSize,
      };
    } catch (error) {
      console.warn("Error fetching substrate events by module:", error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
  }

  async getSubstrateEventsByName(
    eventName: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<SubstrateEvent>> {
    const offset = (page - 1) * pageSize;
    try {
      const events = await apiRequest<SubstrateEvent[]>(
        `${API_ENDPOINTS.SUBSTRATE_EVENTS_NAME}/${eventName}?limit=${pageSize}&offset=${offset}`
      );

      const convertedEvents = events.map((event) => ({
        ...event,
        timestamp: event.timestamp,
      }));

      return {
        items: convertedEvents,
        totalCount: events.length,
        page,
        pageSize,
        hasMore: events.length === pageSize,
      };
    } catch (error) {
      console.warn("Error fetching substrate events by name:", error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
  }

  async getRecentSubstrateEvents(): Promise<SubstrateEvent[]> {
    try {
      const events = await apiRequest<SubstrateEvent[]>(
        `${API_ENDPOINTS.SUBSTRATE_EVENTS_RECENT}`
      );
      return events.map((event) => ({
        ...event,
        timestamp: event.timestamp,
      }));
    } catch (error) {
      console.error("Error fetching recent substrate events:", error);
      return [];
    }
  }

  // Validators (not implemented in backend yet - using mock for now)
  async getValidators(
    page: number = 1,
    pageSize: number = 10
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
      const [networkInfo, latestBlockNumber, , totalStaking] =
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

  // Search (enhanced implementation for real backend data)
  async search(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      // Trim and normalize the query
      const normalizedQuery = query.trim();

      // Try to search as block number (for both EVM and Substrate blocks)
      if (/^\d+$/.test(normalizedQuery)) {
        const blockNumber = parseInt(normalizedQuery);

        // Try EVM block first
        try {
          const evmBlock = await this.getBlock(blockNumber);
          if (evmBlock && evmBlock.networkType === "evm") {
            results.push({
              type: "block",
              id: evmBlock.id,
              title: `EVM Block #${evmBlock.number}`,
              subtitle: `${evmBlock.transactionCount} transactions`,
              networkType: "evm" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("EVM block not found for:", blockNumber);
        }

        // Try Substrate block
        try {
          const substrateBlock = await this.getSubstrateBlock(blockNumber);
          if (substrateBlock) {
            results.push({
              type: "block",
              id: substrateBlock.hash,
              title: `Substrate Block #${substrateBlock.number}`,
              subtitle: `${substrateBlock.extrinscs_len} extrinsics`,
              networkType: "substrate" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("Substrate block not found for:", blockNumber);
        }
      }

      // Try to search as transaction hash (EVM)
      if (/^0x[a-fA-F0-9]{64}$/.test(normalizedQuery)) {
        try {
          const transaction = await this.getTransaction(normalizedQuery);
          if (transaction) {
            results.push({
              type: "transaction",
              id: transaction.id,
              title: `Transaction ${transaction.hash.substring(0, 10)}...`,
              subtitle: `Block #${transaction.blockNumber}`,
              networkType: "evm" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("EVM transaction not found for:", normalizedQuery);
        }

        // Also try as EVM block hash
        try {
          const block = await this.getBlock(normalizedQuery);
          if (block && block.networkType === "evm") {
            results.push({
              type: "block",
              id: block.id,
              title: `EVM Block ${block.hash.substring(0, 10)}...`,
              subtitle: `#${block.number} • ${block.transactionCount} transactions`,
              networkType: "evm" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("EVM block hash not found for:", normalizedQuery);
        }

        // Try as Substrate block hash
        try {
          const substrateBlock = await this.getSubstrateBlock(normalizedQuery);
          if (substrateBlock) {
            results.push({
              type: "block",
              id: substrateBlock.hash,
              title: `Substrate Block ${substrateBlock.hash.substring(
                0,
                10
              )}...`,
              subtitle: `#${substrateBlock.number} • ${substrateBlock.extrinscs_len} extrinsics`,
              networkType: "substrate" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("Substrate block hash not found for:", normalizedQuery);
        }
      }

      // Try to search as address (both EVM and SS58 formats)
      if (
        /^0x[a-fA-F0-9]{40}$/.test(normalizedQuery) ||
        /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(normalizedQuery)
      ) {
        // Try EVM account
        try {
          const account = await this.getAccount(normalizedQuery);
          if (account) {
            results.push({
              type: "address",
              id: account.id,
              title: `Address ${account.address.substring(0, 10)}...`,
              subtitle: `Balance: ${account.balance} SEL`,
              networkType: "evm" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("EVM account not found for:", normalizedQuery);
        }

        // Try EVM contract
        try {
          const contract = await this.getContract(normalizedQuery);
          if (contract) {
            results.push({
              type: "contract",
              id: contract.id,
              title: `Contract ${contract.address.substring(0, 10)}...`,
              subtitle: contract.name || "Smart Contract",
              networkType: "evm" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("EVM contract not found for:", normalizedQuery);
        }
      }

      // Try to search as extrinsic ID (block-index format)
      if (/^\d+-\d+$/.test(normalizedQuery)) {
        const [blockStr, indexStr] = normalizedQuery.split("-");
        const blockNumber = parseInt(blockStr);
        const extrinsicIndex = parseInt(indexStr);

        try {
          const extrinsics = await this.getSubstrateExtrinsicsByBlock(
            blockNumber
          );
          const extrinsic = extrinsics.find(
            (ext) => ext.extrinsic_index === extrinsicIndex
          );
          if (extrinsic) {
            results.push({
              type: "extrinsic",
              id: `${blockNumber}-${extrinsicIndex}`,
              title: `Extrinsic ${blockNumber}-${extrinsicIndex}`,
              subtitle: `${extrinsic.call_module}.${extrinsic.call_function}`,
              networkType: "substrate" as NetworkType,
            });
          }
        } catch (error) {
          console.debug("Substrate extrinsic not found for:", normalizedQuery);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      // Don't throw, just return empty results
    }

    return results;
  }
}

// Create a singleton instance
export const apiService = new ApiService();
