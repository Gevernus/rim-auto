import { useState, useEffect } from 'react';
import { useDeliveryStore } from '../store/deliveryStore';

const useDelivery = () => {
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  
  // Получаем состояние и действия из Zustand store
  const {
    selectedCity,
    isLoading,
    searchQuery,
    searchResults,
    setSearchQuery,
    selectCity,
    clearCity,
    getDeliveryInfo,
    initializeDefaultCity
  } = useDeliveryStore();

  // Обработчик поиска городов
  const handleSearchQuery = async (query) => {
    await setSearchQuery(query);
  };

  // Инициализация города по умолчанию и загрузка информации о доставке
  useEffect(() => {
    const initialize = async () => {
      if (!selectedCity) {
        await initializeDefaultCity();
      }
    };

    initialize();
  }, [initializeDefaultCity]);

  // Получаем информацию о доставке асинхронно
  useEffect(() => {
    const loadDeliveryInfo = async () => {
      if (selectedCity) {
        const info = await getDeliveryInfo();
        setDeliveryInfo(info);
      } else {
        setDeliveryInfo(null);
      }
    };

    loadDeliveryInfo();
  }, [selectedCity, getDeliveryInfo]);

  return {
    // Состояние
    selectedCity,
    isLoading,
    searchQuery,
    searchResults,
    deliveryInfo,
    
    // Действия
    selectCity,
    clearCity,
    setSearchQuery: handleSearchQuery,
    initializeDefaultCity,
  };
};

export { useDelivery }; 