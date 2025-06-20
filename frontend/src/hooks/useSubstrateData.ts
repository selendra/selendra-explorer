import { useApi } from "./useApi";
import { apiService } from "../services";
import { APP_CONFIG } from "../config/app.config";
import {
  SubstrateBlock,
  SubstrateExtrinsic,
  SubstrateEvent,
  PaginationParams,
} from "../types";

export const useSubstrateBlocks = (params: PaginationParams = {}) => {
  return useApi<SubstrateBlock[]>(
    (p) => apiService.getSubstrateBlocks(p),
    params,
    { immediate: true }
  );
};

export const useLatestSubstrateBlock = () => {
  return useApi<SubstrateBlock>(
    () => apiService.getLatestSubstrateBlock(),
    {},
    {
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.latestBlock,
    }
  );
};

export const useSubstrateBlock = (
  identifier: string | number,
  type: "number" | "hash" = "number"
) => {
  return useApi<SubstrateBlock>(
    () => {
      if (type === "hash") {
        return apiService.getSubstrateBlockByHash(identifier as string);
      }
      return apiService.getSubstrateBlockByNumber(identifier as number);
    },
    {},
    {
      immediate: !!identifier,
    }
  );
};

export const useSubstrateExtrinsics = (params: PaginationParams = {}) => {
  return useApi<SubstrateExtrinsic[]>(
    (p) => apiService.getSubstrateExtrinsics(p),
    params,
    { immediate: true }
  );
};

// NEW: Add the hook for getting extrinsic by hash
export const useSubstrateExtrinsic = (
  identifier: string | number,
  type: "hash" | "block" = "hash"
) => {
  return useApi<SubstrateExtrinsic | SubstrateExtrinsic[]>(
    () => {
      if (type === "hash") {
        return apiService.getSubstrateExtrinsicByHash(identifier as string);
      }
      return apiService.getSubstrateExtrinsicsByBlock(identifier as number);
    },
    {},
    {
      immediate: !!identifier,
    }
  );
};

export const useSubstrateEvents = (params: PaginationParams = {}) => {
  return useApi<SubstrateEvent[]>(
    (p) => apiService.getSubstrateEvents(p),
    params,
    {
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.events,
    }
  );
};

export const useRecentSubstrateEvents = (params: PaginationParams = {}) => {
  return useApi<SubstrateEvent[]>(
    (p) => apiService.getRecentSubstrateEvents(p),
    params,
    {
      immediate: true,
      refreshInterval: APP_CONFIG.refreshIntervals.events,
    }
  );
};
