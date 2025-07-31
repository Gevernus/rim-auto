import { create } from 'zustand';
import { getCityById, getDeliveryZoneInfo, searchCities, convertToRubles, formatPriceInRubles } from '../utils/cities';

const useDeliveryStore = create((set, get) => ({
  // Состояние
  selectedCity: getCityById('moscow'), // Москва по умолчанию
  isLoading: false,
  searchQuery: '',
  searchResults: [],

  // Действия
  setSelectedCity: (city) => set({ selectedCity: city }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setSearchQuery: (query) => {
    const results = query.length >= 2 ? searchCities(query) : [];
    set({ searchQuery: query, searchResults: results });
  },
  
  selectCity: (cityId) => {
    set({ isLoading: true });
    
    // Имитация загрузки (для будущего API)
    setTimeout(() => {
      const city = getCityById(cityId);
      set({ 
        selectedCity: city,
        searchQuery: '',
        searchResults: [],
        isLoading: false 
      });
    }, 300);
  },
  
  clearCity: () => set({ 
    selectedCity: null,
    searchQuery: '',
    searchResults: []
  }),

  // Вычисляемые значения
  getDeliveryInfo: () => {
    const { selectedCity } = get();
    if (!selectedCity) return null;

    const zoneInfo = getDeliveryZoneInfo(selectedCity.delivery_zone);
    
    return {
      city: selectedCity,
      zone: zoneInfo,
      estimated_days: selectedCity.delivery_days
    };
  },

  calculateDeliveryCost: (vehiclePrice = 0) => {
    const { selectedCity } = get();
    if (!selectedCity) return null;

    const zoneInfo = getDeliveryZoneInfo(selectedCity.delivery_zone);
    
    // Базовая логика расчета
    const baseCost = zoneInfo.base_cost;
    const vehicleValueFactor = Math.min(vehiclePrice * 0.01, 50000); // 1% от стоимости, но не более 50к
    
    const totalCost = baseCost + vehicleValueFactor;
    
    return {
      base_cost: baseCost,
      vehicle_factor: vehicleValueFactor,
      total_cost: Math.round(totalCost),
      delivery_days: selectedCity.delivery_days,
      zone_name: zoneInfo.name
    };
  },

  calculateTotalPriceInRubles: (vehiclePrice, vehicleCurrency = 'CNY') => {
    const { calculateDeliveryCost } = get();
    
    if (!vehiclePrice) return null;
    
    const priceInRubles = convertToRubles(vehiclePrice, vehicleCurrency);
    const deliveryCost = calculateDeliveryCost(priceInRubles);
    
    if (!deliveryCost) return { priceInRubles, totalPrice: priceInRubles };
    
    return {
      priceInRubles,
      deliveryCost: deliveryCost.total_cost,
      totalPrice: priceInRubles + deliveryCost.total_cost,
      formattedPrice: formatPriceInRubles(priceInRubles),
      formattedDelivery: formatPriceInRubles(deliveryCost.total_cost),
      formattedTotal: formatPriceInRubles(priceInRubles + deliveryCost.total_cost)
    };
  }
}));

export { useDeliveryStore }; 