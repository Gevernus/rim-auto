// Абстракция навигации для миграции на React Native
// В веб-версии использует react-router-dom v7
// В RN версии будет использовать react-navigation

import { useNavigate, useLocation, useParams } from 'react-router-dom';

// Хук для навигации
export const useAppNavigation = () => {
  const navigate = useNavigate();
  
  return {
    navigateTo: (path) => navigate(path),
    goBack: () => navigate(-1),
    replace: (path) => navigate(path, { replace: true }),
  };
};

// Хук для получения текущего местоположения
export const useAppLocation = () => {
  const location = useLocation();
  
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
  };
};

// Хук для получения параметров URL
export const useAppParams = () => {
  const params = useParams();
  return params;
};

// Утилиты для создания путей
export const routes = {
  // Базовые пути
  root: '/',

  // Основное меню
  cars: '/cars',
  specialTech: '/special-tech',
  parts: '/parts',
  moto: '/moto',
  
  // Мобильная навигация
  favorites: '/favorites',
  messages: '/messages',
  menu: '/menu',
  
  // Дополнительное меню
  news: '/news',
  services: '/services',
  reviews: '/reviews',
  about: '/about',
  insurance: '/insurance',
  credit: '/credit',
  leasing: '/leasing',
  
  // Дополнительные маршруты
  car: (id) => `/car/${id}`,
  order: '/order',
  admin: '/admin',
};

// Функция для навигации без хуков (для использования в обработчиках)
let navigateFunction = null;

export const setNavigateFunction = (navigate) => {
  navigateFunction = navigate;
};

export const navigateTo = (path) => {
  if (navigateFunction) {
    navigateFunction(path);
  }
}; 