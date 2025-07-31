import { useThemeContext } from '../lib/ThemeProvider.jsx';

/**
 * Хук для работы с темой через контекст
 * @returns {Object} Объект с состоянием темы и методами для управления
 */
export const useTheme = () => {
  return useThemeContext();
};

// Экспортируем дополнительные утилиты для обратной совместимости
export { 
  getCurrentTheme, 
  setTheme, 
  toggleTheme, 
  isDarkTheme,
  THEME_OPTIONS 
} from '../lib/theme.js'; 