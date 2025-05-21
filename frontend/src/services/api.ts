import type {
  NetworkType,
  PaginatedResponse,
  SearchResult,
  TokenType,
  Validator,
  NetworkStats,
} from "../types";
import { delay } from "../utils/mockHelpers";

// Import mock data and helper functions
import {
  mockBlocks,
  getMockBlocks,
  getMockBlockByNumberOrHash,
} from "../mocks/blocks";
import {
  mockTransactions,
  getMockTransactions,
  getMockTransactionByHash,
  getMockTransactionsByBlock,
} from "../mocks/transactions";
import {
  mockAccounts,
  getMockAccounts,
  getMockAccountByAddress,
} from "../mocks/accounts";
import {
  mockContracts,
  getMockContracts,
  getMockContractByAddress,
} from "../mocks/contracts";
import {
  mockTokens,
  getMockTokens,
  getMockTokenByAddress,
} from "../mocks/tokens";
import { getMockValidators, getMockValidatorByAddress } from "../mocks/validators";
import { mockNetworkStats } from "../mocks/networkStats";
import { searchMockData } from "../mocks/search";

// Simulate network latency - can be adjusted for testing
const NETWORK_DELAY = 300; // ms

/**
 * API Service class for interacting with blockchain data
 * Currently using mock data for development
 */
export class ApiService {
  // Blocks
  async getBlocks(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<(typeof mockBlocks)[0]>> {
    await delay(NETWORK_DELAY);
    return getMockBlocks(page, pageSize);
  }

  async getBlock(
    numberOrHash: string | number
  ): Promise<(typeof mockBlocks)[0] | null> {
    await delay(NETWORK_DELAY);
    return getMockBlockByNumberOrHash(numberOrHash) || null;
  }

  // Transactions
  async getTransactions(
    page: number = 1,
    pageSize: number = 10,
    address?: string
  ): Promise<PaginatedResponse<(typeof mockTransactions)[0]>> {
    await delay(NETWORK_DELAY);
    return getMockTransactions(page, pageSize, address);
  }

  async getTransaction(
    hash: string
  ): Promise<(typeof mockTransactions)[0] | null> {
    await delay(NETWORK_DELAY);
    return getMockTransactionByHash(hash) || null;
  }

  async getTransactionsByBlock(
    blockNumber: number
  ): Promise<(typeof mockTransactions)[0][]> {
    await delay(NETWORK_DELAY);
    return getMockTransactionsByBlock(blockNumber);
  }

  // Accounts
  async getAccounts(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<(typeof mockAccounts)[0]>> {
    await delay(NETWORK_DELAY);
    return getMockAccounts(page, pageSize);
  }

  async getAccount(address: string): Promise<(typeof mockAccounts)[0] | null> {
    await delay(NETWORK_DELAY);
    return getMockAccountByAddress(address) || null;
  }

  // Contracts
  async getContracts(
    page: number = 1,
    pageSize: number = 10,
    networkType?: NetworkType
  ): Promise<PaginatedResponse<(typeof mockContracts)[0]>> {
    await delay(NETWORK_DELAY);
    return getMockContracts(page, pageSize, networkType);
  }

  async getContract(
    address: string
  ): Promise<(typeof mockContracts)[0] | null> {
    await delay(NETWORK_DELAY);
    return getMockContractByAddress(address) || null;
  }

  // Tokens
  async getTokens(
    page: number = 1,
    pageSize: number = 10,
    type?: string,
    networkType?: NetworkType
  ): Promise<PaginatedResponse<(typeof mockTokens)[0]>> {
    await delay(NETWORK_DELAY);
    return getMockTokens(page, pageSize, type as TokenType, networkType);
  }

  async getToken(address: string): Promise<(typeof mockTokens)[0] | null> {
    await delay(NETWORK_DELAY);
    return getMockTokenByAddress(address) || null;
  }

  // Validators
  async getValidators(
    page: number = 1,
    pageSize: number = 10,
    status?: "active" | "waiting" | "inactive"
  ): Promise<PaginatedResponse<Validator>> {
    await delay(NETWORK_DELAY);
    return getMockValidators(page, pageSize, status);
  }

  async getValidator(address: string): Promise<Validator> {
    await delay(NETWORK_DELAY);
    const validator = getMockValidatorByAddress(address);
    if (!validator) {
      throw new Error(`Validator with address ${address} not found`);
    }
    return validator;
  }

  // Network Stats
  async getNetworkStats(): Promise<NetworkStats> {
    await delay(NETWORK_DELAY);
    return mockNetworkStats;
  }

  // Search
  async search(query: string): Promise<SearchResult[]> {
    await delay(NETWORK_DELAY);
    return searchMockData(query);
  }
}

// Create a singleton instance
export const apiService = new ApiService();
