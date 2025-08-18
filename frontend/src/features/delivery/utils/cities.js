import { citiesApi } from '../../../shared/api/client';

// Функция для получения всех городов с API
export const fetchCities = async () => {
  try {
    const response = await citiesApi.getCities({ limit: 1000 });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// Функция для поиска городов через API
export const searchCities = async (query) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await citiesApi.searchCities(query, 10);
    return response.data;
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

// Функция для получения города по ID через API
export const getCityById = async (cityId) => {
  try {
    const response = await citiesApi.getCityById(cityId);
    return response.data;
  } catch (error) {
    console.error('Error fetching city:', error);
    return null;
  }
};

// Функция для получения информации о зоне доставки
export const getDeliveryZoneInfo = async (zoneName) => {
  try {
    // Сначала пытаемся получить данные с API
    const zones = await fetchDeliveryRegions();
    if (zones && zones.length > 0) {
      return zones.find(zone => zone.name === zoneName);
    }
  } catch {
    console.warn('Failed to fetch delivery zones from API, using fallback data');
  }
  
};

// Функция для получения регионов доставки через API
export const fetchDeliveryRegions = async () => {
  try {
    const response = await citiesApi.getDeliveryRegions();
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery regions:', error);
    return []; 
  }
};

// Функция для получения активных городов
export const fetchActiveCities = async () => {
  try {
    const response = await citiesApi.getCities({ is_active: true, limit: 1000 });
    return response.data;
  } catch (error) {
    console.error('Error fetching active cities:', error);
    return [];
  }
}; 