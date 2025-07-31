import { useState, useEffect } from 'react';
import { carsApi, systemApi } from '../api/client.js';
import { adaptApiResponse, adaptVehicle } from '../api/dataAdapter.js';

export const useCars = (params = {}) => {
  const [vehicles, setVehicles] = useState([]);
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
      const adaptedData = adaptApiResponse(response.data);
      
      setVehicles(adaptedData.vehicles);
      setPagination({ 
        total: adaptedData.total, 
        page: adaptedData.page, 
        page_size: adaptedData.page_size 
      });
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
      const response = await carsApi.refreshCache(); // Используем правильный метод
      console.log('Cache refresh result:', response.data);
      await fetchCars();
    } catch (err) {
      console.error('Error refreshing cache:', err);
      setError(err.message || 'Ошибка обновления кэша');
    } finally {
      setLoading(false);
    }
  };

  const searchCars = async (query, filters = {}) => {
    await fetchCars({ title: query, ...filters });
  };

  const filterCars = async (filters) => {
    await fetchCars(filters);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return {
    vehicles, // Переименовал с cars на vehicles для соответствия frontend типам
    loading,
    error,
    pagination,
    fetchCars,
    refreshCache,
    searchCars,
    filterCars
  };
};

// Новый хук для получения одного автомобиля по ID
export const useVehicle = (id) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Поскольку backend не имеет endpoint для одного автомобиля,
        // получаем все и ищем по ID (временное решение)
        const response = await carsApi.getCars({ title: id.replace('che168_', '') });
        const adaptedData = adaptApiResponse(response.data);
        
        // Ищем автомобиль с нужным ID или берем первый
        const foundVehicle = adaptedData.vehicles.find(v => v.id === id) || adaptedData.vehicles[0];
        setVehicle(foundVehicle || null);
        
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError(err.message || 'Ошибка загрузки автомобиля');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  return {
    vehicle,
    loading,
    error
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