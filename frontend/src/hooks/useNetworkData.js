import { useApi } from './useApi';
import { apiService } from '../services';
import { APP_CONFIG } from '../config/app.config';

export const useNetworkInfo = () => {
  return useApi(
    () => apiService.getNetworkInfo(),
    {},
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.network 
    }
  );
};

export const useLatestBlockNumber = () => {
  return useApi(
    () => apiService.getLatestBlockNumber(),
    {},
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.latestBlock 
    }
  );
};

export const useTotalIssuance = () => {
  return useApi(
    () => apiService.getTotalIssuance(),
    {},
    { immediate: true }
  );
};

export const useSessionEra = () => {
  return useApi(
    () => apiService.getSessionEra(),
    {},
    { immediate: true }
  );
};