import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getCurrentTheme, 
  getAppliedTheme, 
  setTheme, 
  initializeTheme,
  THEME_OPTIONS 
} from './theme.js';

// Создаем контекст темы
const ThemeContext = createContext({
  theme: THEME_OPTIONS.SYSTEM,
  appliedTheme: THEME_OPTIONS.LIGHT,
  isDark: false,
  isLight: true,
  isSystem: true,
  toggle: () => {},
  setTheme: () => {},
  isLoading: true,
});

/**
 * Провайдер темы для всего приложения
 * Использует платформо-независимые абстракции для легкой миграции на React Native
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} Провайдер темы
 */
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(THEME_OPTIONS.SYSTEM);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация темы при монтировании
  useEffect(() => {
    try {
      // Инициализируем систему тем
      initializeTheme();
      
      // Получаем текущее состояние
      const theme = getCurrentTheme();
      setCurrentTheme(theme);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка инициализации темы:', error);
      setIsLoading(false);
    }
  }, []);

  // Функция переключения темы
  const toggleTheme = () => {
    const current = getCurrentTheme();
    
    // Переключение: light -> dark -> system -> light
    let newTheme;
    if (current === THEME_OPTIONS.LIGHT) {
      newTheme = THEME_OPTIONS.DARK;
    } else if (current === THEME_OPTIONS.DARK) {
      newTheme = THEME_OPTIONS.SYSTEM;
    } else {
      newTheme = THEME_OPTIONS.LIGHT;
    }
    
    setTheme(newTheme);
    setCurrentTheme(newTheme);
    
    return newTheme;
  };

  // Функция установки конкретной темы
  const setThemeValue = (theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  // Вычисляемые значения на основе текущего состояния
  const appliedTheme = getAppliedTheme();
  const isDark = appliedTheme === THEME_OPTIONS.DARK;
  const isLight = appliedTheme === THEME_OPTIONS.LIGHT;
  const isSystem = currentTheme === THEME_OPTIONS.SYSTEM;

  const value = {
    theme: currentTheme,
    appliedTheme,
    isDark,
    isLight,
    isSystem,
    isLoading,
    toggle: toggleTheme,
    setTheme: setThemeValue,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Хук для использования контекста темы
 * @returns {Object} Контекст темы
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeProvider; 