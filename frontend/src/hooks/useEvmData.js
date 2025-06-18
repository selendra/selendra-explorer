import { useApi } from './useApi';
import { apiService } from '../services';
import { APP_CONFIG } from '../config/app.config';

export const useEvmBlocks = (params = {}) => {
  return useApi(
    (p) => apiService.getEvmBlocks(p),
    params,
    { immediate: true }
  );
};

export const useLatestEvmBlock = () => {
  return useApi(
    () => apiService.getLatestEvmBlock(),
    {},
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.latestBlock 
    }
  );
};

export const useEvmBlock = (identifier, type = 'number') => {
  return useApi(
    () => {
      if (type === 'hash') {
        return apiService.getEvmBlockByHash(identifier);
      }
      return apiService.getEvmBlockByNumber(identifier);
    },
    {},
    { 
      immediate: !!identifier,
      dependencies: [identifier, type] 
    }
  );
};

export const useEvmTransactions = (params = {}) => {
  return useApi(
    (p) => apiService.getEvmTransactions(p),
    params,
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.transactions 
    }
  );
};

export const useEvmTransaction = (txHash) => {
  return useApi(
    () => apiService.getEvmTransactionByHash(txHash),
    {},
    { 
      immediate: !!txHash,
      dependencies: [txHash] 
    }
  );
};

export const useEvmAccounts = (params = {}) => {
  return useApi(
    (p) => apiService.getEvmAccounts(p),
    params,
    { immediate: true }
  );
};

export const useEvmAccount = (address) => {
  return useApi(
    () => apiService.getEvmAccountByAddress(address),
    {},
    { 
      immediate: !!address,
      dependencies: [address],
      refreshInterval: APP_CONFIG.refreshIntervals.accounts 
    }
  );
};

export const useEvmContracts = (params = {}) => {
  return useApi(
    (p) => apiService.getEvmContracts(p),
    params,
    { immediate: true }
  );
};

export const useEvmContract = (address) => {
  return useApi(
    () => apiService.getEvmContractByAddress(address),
    {},
    { 
      immediate: !!address,
      dependencies: [address] 
    }
  );
};
