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

  // Функция для извлечения оригинального названия из ID
  const extractTitleFromId = (vehicleId) => {
    if (!vehicleId || !vehicleId.startsWith('che168_')) {
      return null;
    }
    
    // Убираем префикс che168_ и хеш в конце
    const withoutPrefix = vehicleId.replace('che168_', '');
    const parts = withoutPrefix.split('_');
    
    if (parts.length < 2) {
      return null;
    }
    
    // Убираем последнюю часть (хеш) и соединяем остальное
    const titleParts = parts.slice(0, -1);
    const extractedTitle = titleParts.join(' ').replace(/_/g, ' ').trim();
    
    // Если извлеченное название слишком короткое или содержит только цифры, возвращаем null
    if (extractedTitle.length < 3 || /^\d+\s*$/.test(extractedTitle)) {
      return null;
    }
    
    return extractedTitle;
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setLoading(false);
        setError('ID автомобиля не указан');
        return;
      }

      console.log('🔍 Поиск автомобиля с ID:', id);

      try {
        setLoading(true);
        setError(null);
        
        // Сначала пробуем получить автомобиль напрямую по ID
        try {
          const response = await carsApi.getCarById(id);
          if (response.data && response.data.vehicle) {
            console.log('✅ Найден автомобиль через прямой поиск');
            setVehicle(adaptVehicle(response.data.vehicle));
            setLoading(false);
            return;
          }
        } catch (directError) {
          console.log('❌ Прямой поиск не удался:', directError.message);
        }
        
        // Извлекаем оригинальное название из ID
        const originalTitle = extractTitleFromId(id);
        console.log('🔍 Извлеченное название из ID:', originalTitle);
        
        // Пробуем разные варианты поиска
        const searchVariants = [
          originalTitle,
          id.replace(/^che168_/, ''),
          id,
          originalTitle?.replace(/\s+/g, '_'),
          originalTitle?.replace(/\s+/g, '-'),
          // Добавляем поиск по частям ID
          ...id.replace(/^che168_/, '').split('_').filter(part => part.length > 2),
          // Поиск по году (если есть)
          ...(originalTitle?.match(/\d{4}/) || []),
          // Поиск по бренду (если есть)
          ...(originalTitle?.split(' ').filter(word => word.length > 2) || [])
        ].filter(Boolean); // Убираем null/undefined
        
        console.log('🔍 Варианты поиска:', searchVariants);
        
        let foundVehicle = null;
        
        for (const searchTerm of searchVariants) {
          try {
            console.log(`🔍 Пробуем поиск: "${searchTerm}"`);
            const response = await carsApi.getCars({ 
              title: searchTerm,
              page_size: 100 // Увеличиваем размер страницы для поиска
            });
            
            const adaptedData = adaptApiResponse(response.data);
            console.log(`📊 Найдено ${adaptedData.vehicles.length} автомобилей для "${searchTerm}"`);
            
            // Ищем точное совпадение по ID
            foundVehicle = adaptedData.vehicles.find(v => v.id === id);
            
            if (foundVehicle) {
              console.log('✅ Найдено точное совпадение по ID');
              break;
            }
            
            // Если точное совпадение не найдено, берем первый результат
            if (adaptedData.vehicles.length > 0) {
              console.log('⚠️ Точное совпадение не найдено, берем первый результат');
              foundVehicle = adaptedData.vehicles[0];
              break;
            }
          } catch (searchError) {
            console.log(`❌ Поиск "${searchTerm}" не удался:`, searchError.message);
            continue;
          }
        }
        
        // Если все поиски не дали результата, попробуем получить все автомобили
        if (!foundVehicle) {
          try {
            console.log('🔍 Пробуем получить все автомобили для поиска по ID');
            const response = await carsApi.getCars({ 
              page_size: 200 // Получаем больше автомобилей
            });
            
            const adaptedData = adaptApiResponse(response.data);
            console.log(`📊 Получено ${adaptedData.vehicles.length} автомобилей для поиска`);
            
            // Ищем точное совпадение по ID среди всех автомобилей
            foundVehicle = adaptedData.vehicles.find(v => v.id === id);
            
            if (foundVehicle) {
              console.log('✅ Найдено точное совпадение по ID среди всех автомобилей');
            } else {
              console.log('❌ Автомобиль не найден даже среди всех автомобилей');
            }
          } catch (allCarsError) {
            console.log('❌ Ошибка получения всех автомобилей:', allCarsError.message);
          }
        }
        
        if (foundVehicle) {
          console.log('✅ Автомобиль найден:', foundVehicle.title);
          setVehicle(foundVehicle);
        } else {
          console.log('❌ Автомобиль не найден');
          setError(`Автомобиль с ID "${id}" не найден`);
        }
        
      } catch (err) {
        console.error('❌ Ошибка загрузки автомобиля:', err);
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

// Новый хук для получения данных для фильтров
export const useFilterData = () => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Получение уникальных брендов
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем все автомобили для извлечения брендов
      const response = await carsApi.getCars({ page_size: 200 });
      const adaptedData = adaptApiResponse(response.data);
      
      // Извлекаем уникальные бренды
      const uniqueBrands = [...new Set(adaptedData.vehicles.map(vehicle => vehicle.brand))]
        .filter(brand => brand && brand !== 'Unknown')
        .sort();
      
      console.log('📋 Найденные бренды:', uniqueBrands);
      setBrands(uniqueBrands);
      
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Ошибка загрузки брендов');
    } finally {
      setLoading(false);
    }
  };

  // Получение моделей для конкретного бренда
  const fetchModelsForBrand = async (brand) => {
    if (!brand) {
      setModels([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Ищем автомобили конкретного бренда
      const response = await carsApi.getCars({ title: brand, page_size: 200 });
      const adaptedData = adaptApiResponse(response.data);
      
      // Фильтруем автомобили по бренду и извлекаем модели
      const brandVehicles = adaptedData.vehicles.filter(vehicle => 
        vehicle.brand === brand
      );
      
      const uniqueModels = [...new Set(brandVehicles.map(vehicle => vehicle.model))]
        .filter(model => model && model !== 'Unknown Model')
        .sort();
      
      console.log(`📋 Найденные модели для ${brand}:`, uniqueModels);
      setModels(uniqueModels);
      
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Ошибка загрузки моделей');
    } finally {
      setLoading(false);
    }
  };

  // Автоматически загружаем бренды при инициализации
  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    models,
    loading,
    error,
    fetchBrands,
    fetchModelsForBrand
  };
}; 