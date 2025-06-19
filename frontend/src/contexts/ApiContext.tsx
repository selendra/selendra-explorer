import React, { createContext, useContext, ReactNode } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { apiService } from "../services/api";
import { NetworkType } from "../types";

// Re-export types from mocks for convenience
import { mockBlocks } from "../mocks/blocks";
import { mockTransactions } from "../mocks/transactions";
import { mockAccounts } from "../mocks/accounts";
import { mockContracts } from "../mocks/contracts";
import { mockTokens } from "../mocks/tokens";
import { mockValidators } from "../mocks/validators";
import { mockNetworkStats } from "../mocks/networkStats";

// Export types for use in components
export type Block = (typeof mockBlocks)[0];
export type Transaction = (typeof mockTransactions)[0];
export type Account = (typeof mockAccounts)[0];
export type Contract = (typeof mockContracts)[0];
export type Token = (typeof mockTokens)[0];
export type Validator = (typeof mockValidators)[0];
export type NetworkStats = typeof mockNetworkStats;

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 2, // Only retry 2 times on failure
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});

// Create the API context
const ApiContext = createContext<typeof apiService | null>(null);

// API Provider props
interface ApiProviderProps {
  children: ReactNode;
}

// API Provider component
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={apiService}>{children}</ApiContext.Provider>
    </QueryClientProvider>
  );
};

// Hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

// Custom hooks for data fetching

// Blocks
export const useBlocks = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["blocks", page, pageSize],
    queryFn: () => apiService.getBlocks(page, pageSize),
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2, // Only retry 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
};

export const useBlock = (numberOrHash: string | number) => {
  return useQuery({
    queryKey: ["block", numberOrHash],
    queryFn: () => apiService.getBlock(numberOrHash),
    enabled: !!numberOrHash,
  });
};

// Transactions
export const useTransactions = (
  page: number = 1,
  pageSize: number = 10,
  address?: string
) => {
  return useQuery({
    queryKey: ["transactions", page, pageSize, address],
    queryFn: () => apiService.getTransactions(page, pageSize, address),
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2, // Only retry 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
};

export const useTransaction = (hash: string) => {
  return useQuery({
    queryKey: ["transaction", hash],
    queryFn: () => apiService.getTransaction(hash),
    enabled: !!hash,
  });
};

export const useTransactionsByBlock = (blockNumber: number) => {
  return useQuery({
    queryKey: ["transactions", "block", blockNumber],
    queryFn: () => apiService.getTransactionsByBlock(blockNumber),
    enabled: !!blockNumber,
  });
};

// Accounts
export const useAccounts = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["accounts", page, pageSize],
    queryFn: () => apiService.getAccounts(page, pageSize),
  });
};

export const useAccount = (address: string) => {
  return useQuery({
    queryKey: ["account", address],
    queryFn: () => apiService.getAccount(address),
    enabled: !!address,
  });
};

// Contracts
export const useContracts = (
  page: number = 1,
  pageSize: number = 10,
  networkType?: NetworkType
) => {
  return useQuery({
    queryKey: ["contracts", page, pageSize, networkType],
    queryFn: () => apiService.getContracts(page, pageSize, networkType),
  });
};

export const useContract = (address: string) => {
  return useQuery({
    queryKey: ["contract", address],
    queryFn: () => apiService.getContract(address),
    enabled: !!address,
  });
};

// Tokens
export const useTokens = (
  page: number = 1,
  pageSize: number = 10,
  type?: string,
  networkType?: NetworkType
) => {
  return useQuery({
    queryKey: ["tokens", page, pageSize, type, networkType],
    queryFn: () => apiService.getTokens(page, pageSize, type, networkType),
  });
};

export const useToken = (address: string) => {
  return useQuery({
    queryKey: ["token", address],
    queryFn: () => apiService.getToken(address),
    enabled: !!address,
  });
};

// Validators
export const useValidators = (
  page: number = 1,
  pageSize: number = 10,
  status?: "active" | "waiting" | "inactive"
) => {
  return useQuery({
    queryKey: ["validators", page, pageSize, status],
    queryFn: () => apiService.getValidators(page, pageSize, status),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useValidator = (address: string) => {
  return useQuery({
    queryKey: ["validator", address],
    queryFn: () => apiService.getValidator(address),
    enabled: !!address,
  });
};

// Network Stats
export const useNetworkStats = () => {
  return useQuery({
    queryKey: ["networkStats"],
    queryFn: () => apiService.getNetworkStats(),
    refetchInterval: 60000, // Refetch every 60 seconds instead of 30
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2, // Only retry 2 times
    retryDelay: 2000, // Wait 2 seconds between retries
  });
};

// Search
export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => apiService.search(query),
    enabled: query.length > 2, // Only search if query is at least 3 characters
  });
};
