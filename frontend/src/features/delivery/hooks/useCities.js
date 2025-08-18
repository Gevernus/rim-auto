import { useState, useEffect } from 'react';
import { citiesApi } from '../../../shared/api/client';

export const useCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await citiesApi.getCities();
      setCities(response.data || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Ошибка загрузки городов');
    } finally {
      setLoading(false);
    }
  };

  const getCityById = (cityId) => {
    return cities.find(city => city.id === cityId);
  };

  const getCityByName = (cityName) => {
    return cities.find(city => city.name === cityName);
  };

  return {
    cities,
    loading,
    error,
    fetchCities,
    getCityById,
    getCityByName
  };
};
