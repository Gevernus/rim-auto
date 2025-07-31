import { useState, useMemo, useCallback } from 'react';

// Константы для работы с фильтрами
const BRAND_TO_COUNTRY = {
  'Toyota': 'japan', 'Honda': 'japan', 'Nissan': 'japan', 'Mazda': 'japan', 'Subaru': 'japan', 'Lexus': 'japan',
  'Hyundai': 'korea', 'KIA': 'korea', 'Genesis': 'korea',
  'Tesla': 'usa',
  'BMW': 'germany', 'Mercedes-Benz': 'germany', 'Audi': 'germany', 'Volkswagen': 'germany',
  'BYD': 'china', 'NIO': 'china', 'XPeng': 'china', 'Li Auto': 'china', 'Geely': 'china',
  '比亚迪': 'china', '蔚来': 'china', '小鹏': 'china', '理想': 'china', '特斯拉': 'usa',
  '奔驰': 'germany', '宝马': 'germany', '奥迪': 'germany', '大众': 'germany',
  '丰田': 'japan', '本田': 'japan', '日产': 'japan', '现代': 'korea', '起亚': 'korea'
};

// Популярные бренды (будем получать из API в будущем)
const POPULAR_BRANDS = [
  'BYD', '比亚迪', 'Tesla', '特斯拉', 'NIO', '蔚来', 'XPeng', '小鹏', 
  'BMW', '宝马', 'Mercedes-Benz', '奔驰', 'Audi', '奥迪'
];

// Начальное состояние фильтров
const initialFilters = {
  countries: [],
  vehicleCondition: 'all', // all, new, used
  brand: '',
  model: '',
  yearRange: {
    from: '',
    to: ''
  },
  priceRange: {
    from: '',
    to: ''
  },
  parameters: {
    fuelType: '',
    transmission: '',
    driveType: ''
  }
};

export const useVehicleFilters = () => {
  const [filters, setFilters] = useState(initialFilters);

  // Обновление фильтра
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Обновление вложенного фильтра
  const updateNestedFilter = useCallback((parentKey, childKey, value) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  }, []);

  // Обновление фильтра стран
  const updateCountriesFilter = useCallback((countries) => {
    setFilters(prev => ({
      ...prev,
      countries,
      brand: '', // Сбрасываем бренд при изменении страны
      model: ''  // Сбрасываем модель при изменении страны
    }));
  }, []);

  // Обновление фильтра бренда
  const updateBrandFilter = useCallback((brand) => {
    setFilters(prev => ({
      ...prev,
      brand,
      model: '' // Сбрасываем модель при изменении бренда
    }));
  }, []);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Получение брендов для выбранных стран (статические данные)
  const getAvailableBrands = useMemo(() => {
    if (filters.countries.length === 0 || filters.countries.includes('all')) {
      return POPULAR_BRANDS;
    }

    return Object.entries(BRAND_TO_COUNTRY)
      .filter(([brand, country]) => filters.countries.includes(country))
      .map(([brand]) => brand);
  }, [filters.countries]);

  // Получение моделей для выбранного бренда (заглушка - в реальности будет из API)
  const getAvailableModels = useMemo(() => {
    if (!filters.brand) return [];
    
    // Заглушка для моделей - в реальности это будет API запрос
    const modelMap = {
      'BYD': ['Han', 'Tang', 'Song', 'Qin'],
      '比亚迪': ['汉', '唐', '宋', '秦'],
      'Tesla': ['Model 3', 'Model Y', 'Model S'],
      '特斯拉': ['Model 3', 'Model Y', 'Model S'],
      'NIO': ['ES8', 'ES6', 'ET7'],
      '蔚来': ['ES8', 'ES6', 'ET7'],
      'XPeng': ['P7', 'G3', 'P5'],
      '小鹏': ['P7', 'G3', 'P5'],
      'BMW': ['X3', 'X5', 'iX3', '3 Series'],
      '宝马': ['X3', 'X5', 'iX3', '3系']
    };

    return modelMap[filters.brand] || [];
  }, [filters.brand]);

  // Проверка активности фильтров
  const hasActiveFilters = useMemo(() => {
    return (
      filters.countries.length > 0 ||
      filters.vehicleCondition !== 'all' ||
      filters.brand !== '' ||
      filters.model !== '' ||
      filters.yearRange.from !== '' ||
      filters.yearRange.to !== '' ||
      filters.priceRange.from !== '' ||
      filters.priceRange.to !== '' ||
      filters.parameters.fuelType !== '' ||
      filters.parameters.transmission !== '' ||
      filters.parameters.driveType !== ''
    );
  }, [filters]);

  // Преобразование фильтров в параметры для API
  const getApiFilters = useCallback(() => {
    const apiFilters = {
      page: 1, // Всегда сбрасываем на первую страницу при изменении фильтров
      page_size: 12
    };

    // Добавляем фильтры только если они заданы
    if (filters.brand) {
      apiFilters.title = filters.brand; // Backend ищет по title
    }

    if (filters.priceRange.from) {
      apiFilters.price_from = parseInt(filters.priceRange.from) / 10000; // Конвертируем в 万
    }

    if (filters.priceRange.to) {
      apiFilters.price_to = parseInt(filters.priceRange.to) / 10000; // Конвертируем в 万
    }

    // Сортировка по цене если задан диапазон
    if (filters.priceRange.from || filters.priceRange.to) {
      apiFilters.sort_by = 'price';
      apiFilters.sort_order = 'asc';
    }

    return apiFilters;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateNestedFilter,
    updateCountriesFilter,
    updateBrandFilter,
    resetFilters,
    getAvailableBrands,
    getAvailableModels,
    hasActiveFilters,
    getApiFilters
  };
}; 