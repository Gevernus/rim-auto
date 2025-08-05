/**
 * Утилиты для работы с темой согласно Tailwind 4 best practices
 * Использует платформо-независимые абстракции для легкой миграции на React Native
 */

import { storage } from './storage.js';

// Простые функции для работы с localStorage
const getStorageItem = (key) => localStorage.getItem(key);
const setStorageItem = (key, value) => localStorage.setItem(key, value);
const removeStorageItem = (key) => localStorage.removeItem(key);

// Функции для работы с DOM
const getRootElement = () => document.documentElement;
const setThemeAttribute = (element, theme) => element.setAttribute('data-theme', theme);
const updateThemeColor = (isDark) => {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', isDark ? '#000000' : '#ffffff');
  }
};
const createScript = (id, content) => {
  const existing = document.getElementById(id);
  if (existing) return;
  
  const script = document.createElement('script');
  script.id = id;
  script.textContent = content;
  document.head.appendChild(script);
};

// Получение системной темы
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Возможные состояния темы
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark', 
  SYSTEM: 'system'
};

// Получение текущей темы из localStorage
export const getStoredTheme = () => {
  return getStorageItem('theme');
};

// Получение текущей активной темы (учитывая system)
export const getCurrentTheme = () => {
  const stored = getStoredTheme();
  
  if (stored === THEME_OPTIONS.LIGHT || stored === THEME_OPTIONS.DARK) {
    return stored;
  }
  
  // Если тема не установлена или установлена как system
  return THEME_OPTIONS.SYSTEM;
};

// Получение реально применяемой темы (dark/light)
export const getAppliedTheme = () => {
  const currentTheme = getCurrentTheme();
  
  if (currentTheme === THEME_OPTIONS.SYSTEM) {
    return getSystemTheme();
  }
  
  return currentTheme;
};

// Применение темы к DOM через абстракцию
export const applyTheme = (theme) => {
  const root = getRootElement();
  
  if (root) {
    // Для системной темы получаем реальную тему
    const appliedTheme = theme === THEME_OPTIONS.SYSTEM ? getSystemTheme() : theme;
    
    // Устанавливаем data-theme атрибут только если он отличается от текущего
    const currentAttribute = root.getAttribute('data-theme');
    if (currentAttribute !== appliedTheme) {
      setThemeAttribute(root, appliedTheme);
    }
    
    // Обновляем meta тег для браузера
    updateThemeColor(appliedTheme === THEME_OPTIONS.DARK);
  }
};

// Установка темы
export const setTheme = (theme) => {
  // Сохраняем выбор пользователя
  if (theme === THEME_OPTIONS.SYSTEM) {
    removeStorageItem('theme');
  } else {
    setStorageItem('theme', theme);
  }
  
  // Применяем тему
  applyTheme(theme);
};

// Переключение между light и dark (без system)
export const toggleTheme = () => {
  const applied = getAppliedTheme();
  const newTheme = applied === THEME_OPTIONS.DARK ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK;
  setTheme(newTheme);
  return newTheme;
};

// Инициализация темы при загрузке
export const initializeTheme = () => {
  const currentTheme = getCurrentTheme();
  applyTheme(currentTheme);
  
  // Создаем inline script для предотвращения FOUC
  updateThemeScript();
};

// Создание inline script для предотвращения FOUC (Flash of Unstyled Content)
const updateThemeScript = () => {
  const scriptContent = `
    (function() {
      const stored = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = stored === 'dark' || (!stored && systemDark);
      
      // Проверяем, не установлен ли уже data-theme атрибут
      if (!document.documentElement.hasAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
      }
    })();
  `;
  
  createScript('theme-script', scriptContent);
};

// Проверка, является ли тема темной
export const isDarkTheme = (theme) => {
  if (theme === THEME_OPTIONS.SYSTEM) {
    return getSystemTheme() === THEME_OPTIONS.DARK;
  }
  return theme === THEME_OPTIONS.DARK;
}; 