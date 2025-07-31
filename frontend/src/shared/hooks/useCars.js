import { useState, useEffect } from 'react';
import { carsApi, systemApi } from '../api/client.js';

export const useCars = (params = {}) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 10
  });

  const fetchCars = async (fetchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await carsApi.getCars({ ...params, ...fetchParams });
      const { data, total, page, page_size } = response.data;
      
      setCars(data);
      setPagination({ total, page, page_size });
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError(err.message || 'Ошибка загрузки автомобилей');
    } finally {
      setLoading(false);
    }
  };

  const refreshCache = async () => {
    try {
      setLoading(true);
      await carsApi.refreshCache();
      await fetchCars();
    } catch (err) {
      console.error('Error refreshing cache:', err);
      setError(err.message || 'Ошибка обновления кэша');
    } finally {
      setLoading(false);
    }
  };

  const searchCars = async (query) => {
    await fetchCars({ title: query });
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return {
    cars,
    loading,
    error,
    pagination,
    fetchCars,
    refreshCache,
    searchCars
  };
};

export const useSystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await systemApi.getHealth();
      setHealth(response.data);
    } catch (err) {
      console.error('Error checking health:', err);
      setError(err.message || 'Ошибка проверки состояния системы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    health,
    loading,
    error,
    checkHealth
  };
}; 