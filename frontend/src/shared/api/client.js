import axios from 'axios';
import { getItemSync, removeItemSync } from '../lib/storage.js';

// Базовая конфигурация API клиента
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Создание экземпляра axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Базовый timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Создание экземпляра для длительных операций
const longOperationClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 минут для парсинга
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
apiClient.interceptors.request.use(
  (config) => {
    const token = getItemSync('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для длительных операций
longOperationClient.interceptors.request.use(
  (config) => {
    const token = getItemSync('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор ответов
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeItemSync('authToken');
      removeItemSync('telegramInitData');
    }
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Интерцептор ответов для длительных операций
longOperationClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('Long Operation API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeItemSync('authToken');
      removeItemSync('telegramInitData');
    }
    console.error('Long Operation API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export const carsApi = {
  getCars: (params = {}) => {
    const {
      page = 1,
      page_size = 10,
      title,
      price_from,
      price_to,
      year_from,
      year_to,
      country,
      sort_by,
      sort_order
    } = params;
    return api.get('/cars', { 
      params: { page, page_size, title, price_from, price_to, year_from, year_to, country, sort_by, sort_order }
    });
  },
  scrapeCars: () => api.get('/scrape-cars'),
  refreshCache: (signal = null) => longOperationClient.post('/refresh-cache', {}, signal ? { signal } : {}),
  searchCars: (query, filters = {}) => api.get('/cars', { params: { title: query, ...filters } }),
  getCarById: (id) => api.get(`/cars/${id}`),
  getPopularCars: () => api.get('/cars', { params: { page: 1, page_size: 10 } }),
};

export const systemApi = {
  getHealth: () => api.get('/health'),
  getStatus: () => api.get('/health'),
};

export const authApi = {
  telegramAuth: (authData) => api.post('/auth/telegram', authData),
  savePhone: (phone) => api.post('/auth/save-phone', { phone }),
  getMe: () => api.get('/auth/me'),
};

export const ordersApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const calculatorApi = {
  calculateDelivery: (carData, destination) => api.post('/calculator/delivery', { carData, destination }),
  calculateCustoms: (carData) => api.post('/calculator/customs', carData),
  calculateTotal: (carData, destination) => api.post('/calculator/total', { carData, destination }),
};

export const imagesApi = {
  getStats: () => api.get('/images/stats'),
  cleanup: () => api.post('/images/cleanup'),
};

export const debugApi = {
  getPageSource: () => api.get('/debug/page-source'),
  testSelectors: () => api.get('/debug/selectors-test'),
  testCustomSelector: (selector) => api.post('/debug/test-selector', { selector }),
};

export const adminApi = {
  refreshCache: () => longOperationClient.post('/refresh-cache'),
  getVolumesStats: () => api.get('/volumes/stats'),
  cleanupContracts: () => api.post('/contracts/cleanup'),
};

export const applicationsApi = {
  submitCreditApplication: (applicationData) => api.post('/applications/credit', applicationData),
  submitLeasingApplication: (applicationData) => api.post('/applications/leasing', applicationData),
  submitInsuranceApplication: (applicationData) => api.post('/applications/insurance', applicationData),
  submitGuaranteeApplication: (applicationData) => api.post('/applications/guarantee', applicationData),
  getStats: () => api.get('/applications/stats'),
  getCreditApplications: (params = {}) => api.get('/applications/credit', { params }),
  getLeasingApplications: (params = {}) => api.get('/applications/leasing', { params }),
  getInsuranceApplications: (params = {}) => api.get('/applications/insurance', { params }),
  getGuaranteeApplications: (params = {}) => api.get('/applications/guarantee', { params }),
  updateApplicationStatus: (applicationType, applicationId, status) => api.put(`/applications/${applicationType}/${applicationId}/status`, { status }),
};

export const contractsApi = {
  list: () => api.get('/contracts'),
  get: (type) => api.get(`/contracts/${type}`),
  upload: (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/contracts/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  remove: (type) => api.delete(`/contracts/${type}`),
};

export const reviewsApi = {
  getReviews: (params = {}) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data),
  replyReview: (id, reply, author = 'Менеджер') => api.post(`/reviews/${id}/reply`, { reply, author }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  updateReview: (id, data) => api.patch(`/reviews/${id}`, data),
};

export default apiClient;
export { apiClient }; 