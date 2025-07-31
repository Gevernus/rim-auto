import { useState, useEffect, useCallback } from 'react';

// Хук для работы с API запросами
export const useApi = (apiFunction, params = null, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (customParams = params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(customParams);
      setData(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate && params !== null) {
      execute();
    }
  }, [execute, immediate, params]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}; 