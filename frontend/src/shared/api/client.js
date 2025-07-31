import axios from 'axios';
import { getStorageItem, setStorageItem, removeStorageItem } from '../lib/platform';

// Базовая конфигурация API клиента
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Создание экземпляра axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Увеличиваем timeout для парсинга
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запросов
apiClient.interceptors.request.use(
  (config) => {
    // Добавляем токен авторизации если есть
    const token = getStorageItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Логирование запросов в dev режиме
    if (import.meta.env.DEV) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор ответов
apiClient.interceptors.response.use(
  (response) => {
    // Логирование ответов в dev режиме
    if (import.meta.env.DEV) {
      console.log('API Response:', response.status, response.config.url);
    }
    
    return response;
  },
  (error) => {
    // Обработка ошибок авторизации
    if (error.response?.status === 401) {
      removeStorageItem('authToken');
      removeStorageItem('telegramInitData');
      
      // В веб-окружении перенаправляем на страницу авторизации
      if (typeof window !== 'undefined') {
        // Не перенаправляем если это уже страница авторизации
        if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
          window.location.href = '/cars'; // Перенаправляем на главную страницу каталога
        }
      }
    }
    
    // Логирование ошибок
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    
    return Promise.reject(error);
  }
);

// Базовые методы API
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// Методы для работы с автомобилями (адаптированы под реальное API)
export const carsApi = {
  // Получить список автомобилей с фильтрами и пагинацией
  getCars: (params = {}) => {
    const {
      page = 1,
      page_size = 10,
      title,
      price_from,
      price_to,
      sort_by,
      sort_order
    } = params;
    
    return api.get('/cars', { 
      params: {
        page,
        page_size,
        title,
        price_from,
        price_to,
        sort_by,
        sort_order
      }
    });
  },
  
  // Парсинг новых автомобилей с che168.com
  scrapeCars: () => api.get('/scrape-cars'),
  
  // Обновление кэша автомобилей
  refreshCache: () => api.post('/refresh-cache'),
  
  // Поиск автомобилей по названию
  searchCars: (query, filters = {}) => {
    return api.get('/cars', { 
      params: { 
        title: query,
        ...filters 
      } 
    });
  },
  
  // Получить автомобиль по ID (пока не реализовано в backend)
  getCarById: (id) => api.get(`/cars/${id}`),
  
  // Получить популярные автомобили (первые 10)
  getPopularCars: () => api.get('/cars', { params: { page: 1, page_size: 10 } }),
};

// Методы для системы здравоохранения API
export const systemApi = {
  // Проверка состояния системы
  getHealth: () => api.get('/health'),
  
  // Проверка подключения к базе и selenium
  getStatus: () => api.get('/health'),
};

// Методы для Telegram авторизации
export const authApi = {
  // Авторизация через Telegram
  telegramAuth: (authData) => api.post('/auth/telegram', authData),
};

// Методы для заказов (заготовка для будущего расширения)
export const ordersApi = {
  // Создать заказ
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Получить заказы пользователя
  getUserOrders: () => api.get('/orders/my'),
  
  // Получить заказ по ID
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  // Обновить статус заказа
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Методы для калькулятора (заготовка для будущего расширения)
export const calculatorApi = {
  // Рассчитать стоимость доставки
  calculateDelivery: (carData, destination) => 
    api.post('/calculator/delivery', { carData, destination }),
  
  // Рассчитать стоимость растаможки
  calculateCustoms: (carData) => api.post('/calculator/customs', carData),
  
  // Полный расчет стоимости
  calculateTotal: (carData, destination) => 
    api.post('/calculator/total', { carData, destination }),
};

// Методы для работы с изображениями
export const imagesApi = {
  // Получить статистику изображений
  getStats: () => api.get('/images/stats'),
  
  // Очистить папку с изображениями
  cleanup: () => api.post('/images/cleanup'),
};

// Методы для отладки
export const debugApi = {
  // Получить HTML источник страницы
  getPageSource: () => api.get('/debug/page-source'),
  
  // Протестировать селекторы
  testSelectors: () => api.get('/debug/selectors-test'),
};

export default apiClient;

// Экспорт apiClient для прямого использования
export { apiClient }; 