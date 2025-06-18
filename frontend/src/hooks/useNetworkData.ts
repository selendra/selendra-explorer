import { useApi } from "./useApi";
import { apiService } from "../services";
import { APP_CONFIG } from "../config/app.config";
import { NetworkInfo, SessionEra } from "../types";

export const useNetworkInfo = () => {
  return useApi<NetworkInfo>(
    () => apiService.getNetworkInfo(),
    {},
    {
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.network,
    }
  );
};

export const useLatestBlockNumber = () => {
  return useApi<number>(
    () => apiService.getLatestBlockNumber(),
    {},
    {
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.latestBlock,
    }
  );
};

export const useTotalIssuance = () => {
  return useApi<string>(
    () => apiService.getTotalIssuance(),
    {},
    { immediate: true }
  );
};

export const useSessionEra = () => {
  return useApi<SessionEra>(
    () => apiService.getSessionEra(),
    {},
    { immediate: true }
  );
};
