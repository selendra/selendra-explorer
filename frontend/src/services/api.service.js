import { APP_CONFIG } from '../config/app.config';
import { API_ENDPOINTS } from '../config/routes.config';
import { handleApiError, buildQueryString } from '../utils';

class ApiService {
  constructor() {
    this.baseURL = APP_CONFIG.api.baseUrl;
    this.timeout = APP_CONFIG.api.timeout;
    this.controller = null;
  }

  // Create fetch request with timeout and error handling
  async request(endpoint, options = {}) {
    this.controller = new AbortController();
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: this.controller.signal,
      ...options,
    };

    const timeoutId = setTimeout(() => {
      this.controller.abort();
    }, this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(handleApiError(error));
    }
  }

  // Cancel ongoing requests
  cancelRequest() {
    if (this.controller) {
      this.controller.abort();
    }
  }

  // Network endpoints
  async getNetworkInfo() {
    return this.request(API_ENDPOINTS.network);
  }

  async getLatestBlockNumber() {
    return this.request(API_ENDPOINTS.latestBlock);
  }

  async getTotalIssuance() {
    return this.request(API_ENDPOINTS.totalIssuance);
  }

  async getSessionEra() {
    return this.request(API_ENDPOINTS.sessionEra);
  }

  async getTotalStaking() {
    return this.request(API_ENDPOINTS.totalStaking);
  }

  // Address conversion
  async convertSs58ToEvm(address) {
    return this.request(`${API_ENDPOINTS.ss58ToEvm}/${address}`);
  }

  async convertEvmToSs58(address) {
    return this.request(`${API_ENDPOINTS.evmToSs58}/${address}`);
  }

  // EVM Block endpoints
  async getEvmBlocks(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.evm.blocks}${queryString ? `?${queryString}` : ''}`);
  }

  async getLatestEvmBlock() {
    return this.request(API_ENDPOINTS.evm.blocksLatest);
  }

  async getEvmBlockByNumber(blockNumber) {
    return this.request(`${API_ENDPOINTS.evm.blocksByNumber}/${blockNumber}`);
  }

  async getEvmBlockByHash(blockHash) {
    return this.request(`${API_ENDPOINTS.evm.blocksByHash}/${blockHash}`);
  }

  // EVM Transaction endpoints
  async getEvmTransactions(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.evm.transactions}${queryString ? `?${queryString}` : ''}`);
  }

  async getLatestEvmTransaction() {
    return this.request(API_ENDPOINTS.evm.transactionsLatest);
  }

  async getEvmTransactionByHash(txHash) {
    return this.request(`${API_ENDPOINTS.evm.transactionsByHash}/${txHash}`);
  }

  async getEvmTransactionsByBlock(blockNumber) {
    return this.request(`${API_ENDPOINTS.evm.transactionsByBlock}/${blockNumber}`);
  }

  // EVM Account endpoints
  async getEvmAccounts(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.evm.accounts}${queryString ? `?${queryString}` : ''}`);
  }

  async getEvmAccountByAddress(address) {
    return this.request(`${API_ENDPOINTS.evm.accountsByAddress}/${address}`);
  }

  async getEvmAccountsByBalance(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.evm.accountsByBalance}${queryString ? `?${queryString}` : ''}`);
  }

  // EVM Contract endpoints
  async getEvmContracts(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.evm.contracts}${queryString ? `?${queryString}` : ''}`);
  }

  async getEvmContractByAddress(address) {
    return this.request(`${API_ENDPOINTS.evm.contractsByAddress}/${address}`);
  }

  async getEvmContractsByType(contractType) {
    return this.request(`${API_ENDPOINTS.evm.contractsByType}/${contractType}`);
  }

  async getVerifiedEvmContracts() {
    return this.request(API_ENDPOINTS.evm.contractsVerified);
  }

  // Substrate Block endpoints
  async getSubstrateBlocks(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.blocks}${queryString ? `?${queryString}` : ''}`);
  }

  async getLatestSubstrateBlock() {
    return this.request(API_ENDPOINTS.substrate.blocksLatest);
  }

  async getSubstrateBlockByNumber(blockNumber) {
    return this.request(`${API_ENDPOINTS.substrate.blocksByNumber}/${blockNumber}`);
  }

  async getSubstrateBlockByHash(blockHash) {
    return this.request(`${API_ENDPOINTS.substrate.blocksByHash}/${blockHash}`);
  }

  // Substrate Extrinsic endpoints
  async getSubstrateExtrinsics(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.extrinsics}${queryString ? `?${queryString}` : ''}`);
  }

  async getSubstrateExtrinsicsByBlock(blockNumber) {
    return this.request(`${API_ENDPOINTS.substrate.extrinsicsByBlock}/${blockNumber}`);
  }

  async getSubstrateExtrinsicsBySigner(signer, params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.extrinsicsBySigner}/${signer}${queryString ? `?${queryString}` : ''}`);
  }

  async getSubstrateExtrinsicsByModule(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.extrinsicsByModule}${queryString ? `?${queryString}` : ''}`);
  }

  // Substrate Event endpoints
  async getSubstrateEvents(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.events}${queryString ? `?${queryString}` : ''}`);
  }

  async getSubstrateEventsByBlock(blockNumber) {
    return this.request(`${API_ENDPOINTS.substrate.eventsByBlock}/${blockNumber}`);
  }

  async getSubstrateEventsByModule(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.eventsByModule}${queryString ? `?${queryString}` : ''}`);
  }

  async getSubstrateEventsByName(eventName, params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.eventsByName}/${eventName}${queryString ? `?${queryString}` : ''}`);
  }

  async getRecentSubstrateEvents(params = {}) {
    const queryString = buildQueryString(params);
    return this.request(`${API_ENDPOINTS.substrate.eventsRecent}${queryString ? `?${queryString}` : ''}`);
  }
}

export const apiService = new ApiService();