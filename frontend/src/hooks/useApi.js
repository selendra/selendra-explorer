import { useState, useEffect, useCallback } from 'react';
import { SITE_CONSTANTS } from '../content';

export const useApi = (apiCall, params = {}, options = {}) => {
  const { 
    immediate = true, 
    refreshInterval = null  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (customParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...params, ...customParams };
      const result = await apiCall(mergedParams);
      
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || SITE_CONSTANTS.MESSAGES.ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, params]);

  const refresh = useCallback(() => {
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