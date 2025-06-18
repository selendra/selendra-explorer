import { APP_CONFIG } from '../config/app.config';
import { API_ENDPOINTS } from '../config/routes.config';
import { handleApiError, buildQueryString } from '../utils';
import { 
  ApiResponse, 
  PaginationParams, 
  RequestOptions,
  EvmBlock,
  EvmTransaction,
  EvmAccount,
  EvmContract,
  SubstrateBlock,
  SubstrateExtrinsic,
  SubstrateEvent,
  NetworkInfo,
  SessionEra
} from '../types';

class ApiService {
  private baseURL: string;
  private timeout: number;
  private controller: AbortController | null = null;

  constructor() {
    this.baseURL = APP_CONFIG.api.baseUrl;
    this.timeout = APP_CONFIG.api.timeout;
  }

  // Create fetch request with timeout and error handling
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    this.controller = new AbortController();
    
    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: this.controller.signal,
      ...options,
    };

    const timeoutId = setTimeout(() => {
      this.controller?.abort();
    }, this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(handleApiError(error as Error));
    }
  }

  // Cancel ongoing requests
  public cancelRequest(): void {
    if (this.controller) {
      this.controller.abort();
    }
  }

  // Network endpoints
  public async getNetworkInfo(): Promise<NetworkInfo> {
    return this.request<NetworkInfo>(API_ENDPOINTS.network);
  }

  public async getLatestBlockNumber(): Promise<number> {
    return this.request<number>(API_ENDPOINTS.latestBlock);
  }

  public async getTotalIssuance(): Promise<string> {
    return this.request<string>(API_ENDPOINTS.totalIssuance);
  }

  public async getSessionEra(): Promise<SessionEra> {
    return this.request<SessionEra>(API_ENDPOINTS.sessionEra);
  }

  public async getTotalStaking(): Promise<string> {
    return this.request<string>(API_ENDPOINTS.totalStaking);
  }

  // Address conversion
  public async convertSs58ToEvm(address: string): Promise<{ evm_address: string }> {
    return this.request<{ evm_address: string }>(`${API_ENDPOINTS.ss58ToEvm}/${address}`);
  }

  public async convertEvmToSs58(address: string): Promise<{ ss58_address: string }> {
    return this.request<{ ss58_address: string }>(`${API_ENDPOINTS.evmToSs58}/${address}`);
  }

  // EVM Block endpoints
  public async getEvmBlocks(params: PaginationParams = {}): Promise<EvmBlock[]> {
    const queryString = buildQueryString(params);
    return this.request<EvmBlock[]>(`${API_ENDPOINTS.evm.blocks}${queryString ? `?${queryString}` : ''}`);
  }

  public async getLatestEvmBlock(): Promise<EvmBlock> {
    return this.request<EvmBlock>(API_ENDPOINTS.evm.blocksLatest);
  }

  public async getEvmBlockByNumber(blockNumber: number): Promise<EvmBlock> {
    return this.request<EvmBlock>(`${API_ENDPOINTS.evm.blocksByNumber}/${blockNumber}`);
  }

  public async getEvmBlockByHash(blockHash: string): Promise<EvmBlock> {
    return this.request<EvmBlock>(`${API_ENDPOINTS.evm.blocksByHash}/${blockHash}`);
  }

  // EVM Transaction endpoints
  public async getEvmTransactions(params: PaginationParams = {}): Promise<EvmTransaction[]> {
    const queryString = buildQueryString(params);
    return this.request<EvmTransaction[]>(`${API_ENDPOINTS.evm.transactions}${queryString ? `?${queryString}` : ''}`);
  }

  public async getLatestEvmTransaction(): Promise<EvmTransaction> {
    return this.request<EvmTransaction>(API_ENDPOINTS.evm.transactionsLatest);
  }

  public async getEvmTransactionByHash(txHash: string): Promise<EvmTransaction> {
    return this.request<EvmTransaction>(`${API_ENDPOINTS.evm.transactionsByHash}/${txHash}`);
  }

  public async getEvmTransactionsByBlock(blockNumber: number): Promise<EvmTransaction[]> {
    return this.request<EvmTransaction[]>(`${API_ENDPOINTS.evm.transactionsByBlock}/${blockNumber}`);
  }

  // EVM Account endpoints
  public async getEvmAccounts(params: PaginationParams = {}): Promise<EvmAccount[]> {
    const queryString = buildQueryString(params);
    return this.request<EvmAccount[]>(`${API_ENDPOINTS.evm.accounts}${queryString ? `?${queryString}` : ''}`);
  }

  public async getEvmAccountByAddress(address: string): Promise<EvmAccount> {
    return this.request<EvmAccount>(`${API_ENDPOINTS.evm.accountsByAddress}/${address}`);
  }

  public async getEvmAccountsByBalance(params: PaginationParams = {}): Promise<EvmAccount[]> {
    const queryString = buildQueryString(params);
    return this.request<EvmAccount[]>(`${API_ENDPOINTS.evm.accountsByBalance}${queryString ? `?${queryString}` : ''}`);
  }

  // EVM Contract endpoints
  public async getEvmContracts(params: PaginationParams = {}): Promise<EvmContract[]> {
    const queryString = buildQueryString(params);
    return this.request<EvmContract[]>(`${API_ENDPOINTS.evm.contracts}${queryString ? `?${queryString}` : ''}`);
  }

  public async getEvmContractByAddress(address: string): Promise<EvmContract> {
    return this.request<EvmContract>(`${API_ENDPOINTS.evm.contractsByAddress}/${address}`);
  }

  public async getEvmContractsByType(contractType: string): Promise<EvmContract[]> {
    return this.request<EvmContract[]>(`${API_ENDPOINTS.evm.contractsByType}/${contractType}`);
  }

  public async getVerifiedEvmContracts(): Promise<EvmContract[]> {
    return this.request<EvmContract[]>(API_ENDPOINTS.evm.contractsVerified);
  }

  // Substrate Block endpoints
  public async getSubstrateBlocks(params: PaginationParams = {}): Promise<SubstrateBlock[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateBlock[]>(`${API_ENDPOINTS.substrate.blocks}${queryString ? `?${queryString}` : ''}`);
  }

  public async getLatestSubstrateBlock(): Promise<SubstrateBlock> {
    return this.request<SubstrateBlock>(API_ENDPOINTS.substrate.blocksLatest);
  }

  public async getSubstrateBlockByNumber(blockNumber: number): Promise<SubstrateBlock> {
    return this.request<SubstrateBlock>(`${API_ENDPOINTS.substrate.blocksByNumber}/${blockNumber}`);
  }

  public async getSubstrateBlockByHash(blockHash: string): Promise<SubstrateBlock> {
    return this.request<SubstrateBlock>(`${API_ENDPOINTS.substrate.blocksByHash}/${blockHash}`);
  }

  // Substrate Extrinsic endpoints
  public async getSubstrateExtrinsics(params: PaginationParams = {}): Promise<SubstrateExtrinsic[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateExtrinsic[]>(`${API_ENDPOINTS.substrate.extrinsics}${queryString ? `?${queryString}` : ''}`);
  }

  public async getSubstrateExtrinsicsByBlock(blockNumber: number): Promise<SubstrateExtrinsic[]> {
    return this.request<SubstrateExtrinsic[]>(`${API_ENDPOINTS.substrate.extrinsicsByBlock}/${blockNumber}`);
  }

  public async getSubstrateExtrinsicsBySigner(signer: string, params: PaginationParams = {}): Promise<SubstrateExtrinsic[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateExtrinsic[]>(`${API_ENDPOINTS.substrate.extrinsicsBySigner}/${signer}${queryString ? `?${queryString}` : ''}`);
  }

  public async getSubstrateExtrinsicsByModule(params: PaginationParams = {}): Promise<SubstrateExtrinsic[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateExtrinsic[]>(`${API_ENDPOINTS.substrate.extrinsicsByModule}${queryString ? `?${queryString}` : ''}`);
  }

  // Substrate Event endpoints
  public async getSubstrateEvents(params: PaginationParams = {}): Promise<SubstrateEvent[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateEvent[]>(`${API_ENDPOINTS.substrate.events}${queryString ? `?${queryString}` : ''}`);
  }

  public async getSubstrateEventsByBlock(blockNumber: number): Promise<SubstrateEvent[]> {
    return this.request<SubstrateEvent[]>(`${API_ENDPOINTS.substrate.eventsByBlock}/${blockNumber}`);
  }

  public async getSubstrateEventsByModule(params: PaginationParams = {}): Promise<SubstrateEvent[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateEvent[]>(`${API_ENDPOINTS.substrate.eventsByModule}${queryString ? `?${queryString}` : ''}`);
  }

  public async getSubstrateEventsByName(eventName: string, params: PaginationParams = {}): Promise<SubstrateEvent[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateEvent[]>(`${API_ENDPOINTS.substrate.eventsByName}/${eventName}${queryString ? `?${queryString}` : ''}`);
  }

  public async getRecentSubstrateEvents(params: PaginationParams = {}): Promise<SubstrateEvent[]> {
    const queryString = buildQueryString(params);
    return this.request<SubstrateEvent[]>(`${API_ENDPOINTS.substrate.eventsRecent}${queryString ? `?${queryString}` : ''}`);
  }
}

export const apiService = new ApiService();