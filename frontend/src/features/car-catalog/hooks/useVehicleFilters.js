import { useState, useCallback, useMemo } from 'react';
import { mockVehicles } from '../../../shared/mocks/vehicleData';

// Маппинг брендов к странам
const BRAND_TO_COUNTRY = {
  'Toyota': 'japan',
  'Honda': 'japan', 
  'Nissan': 'japan',
  'Mazda': 'japan',
  'Subaru': 'japan',
  'Lexus': 'japan',
  'Hyundai': 'korea',
  'KIA': 'korea',
  'Genesis': 'korea',
  'Tesla': 'usa',
  'BMW': 'germany',
  'Mercedes-Benz': 'germany',
  'Audi': 'germany',
  'Volkswagen': 'germany',
  'BYD': 'china',
  'NIO': 'china',
  'XPeng': 'china',
  'Li Auto': 'china',
  'Geely': 'china'
};

// Начальное состояние фильтров
const initialFilters = {
  countries: ['all'], // По умолчанию выбрано "Всё"
  vehicleCondition: 'used', // По умолчанию "с пробегом"
  brand: '',
  model: '',
  yearRange: { from: '', to: '' },
  priceRange: { from: '', to: '' },
  parameters: {
    fuelType: '',
    transmission: '',
    bodyType: '',
    driveType: ''
  }
};

export const useVehicleFilters = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isYearPopupOpen, setIsYearPopupOpen] = useState(false);
  const [isPricePopupOpen, setIsPricePopupOpen] = useState(false);
  const [isParametersPopupOpen, setIsParametersPopupOpen] = useState(false);

  // Извлекаем уникальные значения для фильтров
  const filterOptions = useMemo(() => {
    const brands = [...new Set(mockVehicles.map(v => v.brand))].sort();
    const models = [...new Set(mockVehicles.map(v => v.model))].sort();
    const years = [...new Set(mockVehicles.map(v => v.year))].sort((a, b) => b - a);
    const fuelTypes = [...new Set(mockVehicles.map(v => v.fuel_type))].sort();
    const transmissions = [...new Set(mockVehicles.map(v => v.transmission))].sort();

    return {
      brands,
      models,
      years,
      fuelTypes,
      transmissions,
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
      minPrice: Math.min(...mockVehicles.map(v => v.price.amount)),
      maxPrice: Math.max(...mockVehicles.map(v => v.price.amount))
    };
  }, []);

  // Обновление фильтров
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Получение отфильтрованных автомобилей
  const getFilteredVehicles = useCallback(() => {
    return mockVehicles.filter(vehicle => {
      // Фильтр по странам
      if (filters.countries.length > 0 && !filters.countries.includes('all')) {
        const vehicleCountry = BRAND_TO_COUNTRY[vehicle.brand] || 'other';
        if (!filters.countries.includes(vehicleCountry)) {
          return false;
        }
      }

      // Фильтр по состоянию (новые/с пробегом)
      if (filters.vehicleCondition !== 'all') {
        const isNew = vehicle.mileage.value < 1000;
        if (filters.vehicleCondition === 'new' && !isNew) return false;
        if (filters.vehicleCondition === 'used' && isNew) return false;
      }

      // Фильтр по марке
      if (filters.brand && vehicle.brand !== filters.brand) {
        return false;
      }

      // Фильтр по модели
      if (filters.model && vehicle.model !== filters.model) {
        return false;
      }

      // Фильтр по году
      if (filters.yearRange.from && vehicle.year < parseInt(filters.yearRange.from)) {
        return false;
      }
      if (filters.yearRange.to && vehicle.year > parseInt(filters.yearRange.to)) {
        return false;
      }

      // Фильтр по цене
      if (filters.priceRange.from && vehicle.price.amount < parseInt(filters.priceRange.from)) {
        return false;
      }
      if (filters.priceRange.to && vehicle.price.amount > parseInt(filters.priceRange.to)) {
        return false;
      }

      // Фильтр по параметрам
      if (filters.parameters.fuelType && vehicle.fuel_type !== filters.parameters.fuelType) {
        return false;
      }
      if (filters.parameters.transmission && vehicle.transmission !== filters.parameters.transmission) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Получение моделей для выбранной марки
  const getModelsForBrand = useCallback((brand) => {
    if (!brand) return [];
    return [...new Set(
      mockVehicles
        .filter(v => v.brand === brand)
        .map(v => v.model)
    )].sort();
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
    filterOptions,
    getFilteredVehicles,
    getModelsForBrand,
    
    // Состояние попапов
    isYearPopupOpen,
    setIsYearPopupOpen,
    isPricePopupOpen,
    setIsPricePopupOpen,
    isParametersPopupOpen,
    setIsParametersPopupOpen
  };
}; 