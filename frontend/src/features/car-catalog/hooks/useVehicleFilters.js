import { useState, useMemo, useCallback } from 'react';
import { useFilterData } from '../../../shared/hooks/useCars';

// Константы для работы с фильтрами (оставляем для fallback)
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
  
  // Используем новый хук для получения данных фильтров
  const { brands, models, loading: filterDataLoading, fetchModelsForBrand } = useFilterData();

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
    
    // Загружаем модели для выбранного бренда
    if (brand) {
      fetchModelsForBrand(brand);
    }
  }, [fetchModelsForBrand]);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Получение брендов с фильтрацией по странам
  const getAvailableBrands = useMemo(() => {
    // console.log('🔍 Фильтрация брендов, текущие страны:', filters.countries);
    // console.log('🔍 Доступные бренды из API:', brands);
    
    // Если нет данных из API, используем статические
    if (!brands || brands.length === 0) {
    //   console.log('⚠️ Используем статические бренды');
      if (filters.countries.length === 0 || filters.countries.includes('all')) {
        return Object.keys(BRAND_TO_COUNTRY);
      }
      
      return Object.entries(BRAND_TO_COUNTRY)
        .filter(([brand, country]) => filters.countries.includes(country))
        .map(([brand]) => brand);
    }

    // Если выбраны все страны или не выбрана ни одна, показываем все бренды
    if (filters.countries.length === 0 || filters.countries.includes('all')) {
    //   console.log('✅ Показываем все бренды из API');
      return brands;
    }

    // Фильтруем бренды по выбранным странам
    const filteredBrands = brands.filter(brand => {
      const country = BRAND_TO_COUNTRY[brand];
      return country && filters.countries.includes(country);
    });
    
    // console.log('✅ Отфильтрованные бренды:', filteredBrands);
    return filteredBrands;
  }, [brands, filters.countries]);

  // Получение моделей для выбранного бренда
  const getAvailableModels = useMemo(() => {
    // console.log('🔍 Получение моделей для бренда:', filters.brand);
    // console.log('🔍 Доступные модели из API:', models);
    
    if (!filters.brand) {
      return [];
    }
    
    // Используем модели из API
    return models;
  }, [filters.brand, models]);

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
    // console.log('🔍 getApiFilters вызван с фильтрами:', filters);
    
    const apiFilters = {
      page: 1, // Всегда сбрасываем на первую страницу при изменении фильтров
      page_size: 12
    };

    // Добавляем фильтры только если они заданы
    if (filters.brand) {
      apiFilters.title = filters.brand; // Backend ищет по title
    //   console.log('✅ Добавлен фильтр по бренду:', filters.brand);
    }

    // Исправляем конвертацию цен - делим на 10000 для перевода в 万
    if (filters.priceRange.from) {
      const priceInWan = (parseInt(filters.priceRange.from) / 10000).toString();
      apiFilters.price_from = priceInWan;
    //   console.log(`✅ Добавлен фильтр по цене от: ${filters.priceRange.from} юаней = ${priceInWan}万`);
    }

    if (filters.priceRange.to) {
      const priceInWan = (parseInt(filters.priceRange.to) / 10000).toString();
      apiFilters.price_to = priceInWan;
    //   console.log(`✅ Добавлен фильтр по цене до: ${filters.priceRange.to} юаней = ${priceInWan}万`);
    }

    // Добавляем фильтрацию по году
    if (filters.yearRange.from) {
      apiFilters.year_from = filters.yearRange.from;
    //   console.log('✅ Добавлен фильтр по году от:', filters.yearRange.from);
    }

    if (filters.yearRange.to) {
      apiFilters.year_to = filters.yearRange.to;
    //   console.log('✅ Добавлен фильтр по году до:', filters.yearRange.to);
    }

    // Добавляем фильтрацию по странам
    if (filters.countries.length > 0) {
      if (filters.countries.includes('all')) {
        apiFilters.country = 'all';
        // console.log('✅ Добавлен фильтр по стране: все страны');
      } else if (filters.countries.length === 1) {
        apiFilters.country = filters.countries[0];
        // console.log('✅ Добавлен фильтр по стране:', filters.countries[0]);
      } else {
        // Если выбрано несколько стран, пока используем первую
        apiFilters.country = filters.countries[0];
        // console.log('✅ Добавлен фильтр по стране (первая из выбранных):', filters.countries[0]);
      }
    }

    // Сортировка по цене если задан диапазон
    if (filters.priceRange.from || filters.priceRange.to) {
      apiFilters.sort_by = 'price';
      apiFilters.sort_order = 'asc';
    //   console.log('✅ Добавлена сортировка по цене');
    }

    // console.log('🔍 Итоговые API фильтры:', apiFilters);
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
    getApiFilters,
    filterDataLoading
  };
}; 