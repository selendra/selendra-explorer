import { useApi } from './useApi';
import { apiService } from '../services';
import { APP_CONFIG } from '../config/app.config';

export const useSubstrateBlocks = (params = {}) => {
  return useApi(
    (p) => apiService.getSubstrateBlocks(p),
    params,
    { immediate: true }
  );
};

export const useLatestSubstrateBlock = () => {
  return useApi(
    () => apiService.getLatestSubstrateBlock(),
    {},
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.latestBlock 
    }
  );
};

export const useSubstrateBlock = (identifier, type = 'number') => {
  return useApi(
    () => {
      if (type === 'hash') {
        return apiService.getSubstrateBlockByHash(identifier);
      }
      return apiService.getSubstrateBlockByNumber(identifier);
    },
    {},
    { 
      immediate: !!identifier,
      dependencies: [identifier, type] 
    }
  );
};

export const useSubstrateExtrinsics = (params = {}) => {
  return useApi(
    (p) => apiService.getSubstrateExtrinsics(p),
    params,
    { immediate: true }
  );
};

export const useSubstrateEvents = (params = {}) => {
  return useApi(
    (p) => apiService.getSubstrateEvents(p),
    params,
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.events 
    }
  );
};

export const useRecentSubstrateEvents = (params = {}) => {
  return useApi(
    (p) => apiService.getRecentSubstrateEvents(p),
    params,
    { 
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.events 
    }
  );
};