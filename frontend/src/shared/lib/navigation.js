// Абстракция навигации для миграции на React Native
// В веб-версии использует react-router-dom v7
// В RN версии будет использовать react-navigation

import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCallback } from 'react';

// Хук для навигации
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const navigateTo = useCallback((path) => navigate(path), [navigate]);
  const goBack = useCallback(() => navigate(-1), [navigate]);
  const replace = useCallback((path) => navigate(path, { replace: true }), [navigate]);

  return { navigateTo, goBack, replace };
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
  sto: '/sto',
  stoCompany: (slug) => `/sto/${slug}`,
  help: '/help',
  helpCompany: (slug) => `/help/${slug}`,
  wash: '/wash',
  washCompany: (slug) => `/wash/${slug}`,
  tire: '/tire',
  tireCompany: (slug) => `/tire/${slug}`,
  detailing: '/detailing',
  reviews: '/reviews',
  about: '/about',
  insurance: '/insurance',
  insuranceCompany: (key) => `/insurance/${key}`,
  credit: '/credit',
  creditBank: (key) => `/credit/${key}`,
  leasing: '/leasing',
  leasingCompany: (key) => `/leasing/${key}`,
  aspectLeasing: '/leasing/aspect',
  directLeasing: '/leasing/direct',
  carcadeLeasing: '/leasing/carcade',
  guarantee: '/guarantee',
  guaranteeCompany: (key) => `/guarantee/${key}`,
  contracts: '/contracts',
  
  // Дополнительные маршруты
  car: (id) => `/car/${id}`,
  order: '/order',
  admin: '/admin',
  detailingCompany: (slug) => `/detailing/${slug}`,
  detailingService: (companySlug, serviceSlug) => `/detailing/${companySlug}/service/${serviceSlug}`,
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