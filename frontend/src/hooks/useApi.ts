import { useState, useEffect, useCallback } from 'react';
import { SITE_CONSTANTS } from '../content';
import { UseApiOptions, UseApiReturn } from '../types';

export const useApi = <T = any>(
  apiCall: (params?: any) => Promise<T>, 
  params: Record<string, any> = {}, 
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const { 
    immediate = true, 
    refreshInterval = null 
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (customParams: Record<string, any> = {}): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...params, ...customParams };
      const result = await apiCall(mergedParams);
      
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = (err as Error).message || SITE_CONSTANTS.MESSAGES.ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, params]);

  const refresh = useCallback((): Promise<T> => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    execute,
    refresh
  };
};