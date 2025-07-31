import { useDeliveryStore } from '../store/deliveryStore';

const useDelivery = () => {
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
    calculateDeliveryCost,
    calculateTotalPriceInRubles
  } = useDeliveryStore();

  // Получаем информацию о доставке
  const deliveryInfo = getDeliveryInfo();

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
    setSearchQuery,
    calculateDeliveryCost,
    calculateTotalPriceInRubles,
  };
};

export { useDelivery }; 