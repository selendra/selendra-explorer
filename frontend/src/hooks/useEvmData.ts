import { useApi } from './useApi';
import { apiService } from '../services';
import { APP_CONFIG } from '../config/app.config';
import { EvmBlock, EvmTransaction, EvmAccount, EvmContract, PaginationParams } from '../types';

export const useEvmBlocks = (params: PaginationParams = {}) => {
  return useApi<EvmBlock[]>(
    (p) => apiService.getEvmBlocks(p),
    params,
    { immediate: true }
  );
};

export const useLatestEvmBlock = () => {
  return useApi<EvmBlock>(
    () => apiService.getLatestEvmBlock(),
    {},
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.latestBlock 
    }
  );
};

export const useEvmBlock = (identifier: string | number, type: 'number' | 'hash' = 'number') => {
  return useApi<EvmBlock>(
    () => {
      if (type === 'hash') {
        return apiService.getEvmBlockByHash(identifier as string);
      }
      return apiService.getEvmBlockByNumber(identifier as number);
    },
    {},
    { 
      immediate: !!identifier
    }
  );
};

export const useEvmTransactions = (params: PaginationParams = {}) => {
  return useApi<EvmTransaction[]>(
    (p) => apiService.getEvmTransactions(p),
    params,
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.transactions 
    }
  );
};

export const useEvmTransaction = (txHash: string) => {
  return useApi<EvmTransaction>(
    () => apiService.getEvmTransactionByHash(txHash),
    {},
    { 
      immediate: !!txHash
    }
  );
};

export const useEvmAccounts = (params: PaginationParams = {}) => {
  return useApi<EvmAccount[]>(
    (p) => apiService.getEvmAccounts(p),
    params,
    { immediate: true }
  );
};

export const useEvmAccount = (address: string) => {
  return useApi<EvmAccount>(
    () => apiService.getEvmAccountByAddress(address),
    {},
    { 
      immediate: !!address,
      refreshInterval: APP_CONFIG.refreshIntervals.accounts 
    }
  );
};

export const useEvmContracts = (params: PaginationParams = {}) => {
  return useApi<EvmContract[]>(
    (p) => apiService.getEvmContracts(p),
    params,
    { immediate: true }
  );
};

export const useEvmContract = (address: string) => {
  return useApi<EvmContract>(
    () => apiService.getEvmContractByAddress(address),
    {},
    { 
      immediate: !!address
    }
  );
};