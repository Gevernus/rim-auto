import { create } from 'zustand';
import { getDeliveryZoneInfo, searchCities, fetchCities } from '../utils/cities';

const useDeliveryStore = create((set, get) => ({
  // Состояние
  selectedCity: null, // Будет загружен асинхронно
  isLoading: false,
  searchQuery: '',
  searchResults: [],

  // Действия
  setSelectedCity: (city) => set({ selectedCity: city }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setSearchQuery: async (query) => {
    if (query.length >= 2) {
      try {
        const results = await searchCities(query);
        set({ searchQuery: query, searchResults: results });
      } catch (error) {
        console.error('Error searching cities:', error);
        set({ searchQuery: query, searchResults: [] });
      }
    } else {
      set({ searchQuery: query, searchResults: [] });
    }
  },
  
  selectCity: async (city) => {
    set({ isLoading: true });
    
    try {
      // Если city - это объект города, используем его напрямую
      if (typeof city === 'object' && city.id) {
        set({ 
          selectedCity: city,
          searchQuery: '',
          searchResults: [],
          isLoading: false 
        });
      } else {
        console.error('Invalid city object:', city);
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error selecting city:', error);
      set({ isLoading: false });
    }
  },
  
  clearCity: () => set({ 
    selectedCity: null,
    searchQuery: '',
    searchResults: []
  }),

  // Вычисляемые значения
  getDeliveryInfo: async () => {
    const { selectedCity } = get();
    if (!selectedCity) return null;

    const zoneInfo = await getDeliveryZoneInfo(selectedCity.delivery_zone);
    
    return {
      city: selectedCity,
      city_name: selectedCity.name,
      delivery_zone: selectedCity.delivery_zone,
      zone: zoneInfo,
      estimated_days: null // Поле delivery_days больше не используется
    };
  },


  // Инициализация города по умолчанию
  initializeDefaultCity: async () => {
    try {
      // Получаем все города и выбираем Москву
      const cities = await fetchCities();
      const moscowCity = cities.find(city => city.name === 'Москва');
      if (moscowCity) {
        set({ selectedCity: moscowCity });
      }
    } catch (error) {
      console.warn('Could not load default city:', error);
    }
  },


}));

export { useDeliveryStore }; 