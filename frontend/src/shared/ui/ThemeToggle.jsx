import { useTheme } from '../hooks/useTheme.js';

/**
 * Компонент для переключения темы с поддержкой системной темы
 * @param {Object} props - Свойства компонента
 * @param {string} props.className - Дополнительные CSS классы
 * @param {string} props.size - Размер кнопки (sm, md, lg)
 * @returns {JSX.Element} Компонент переключателя темы
 */
export const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { theme, isDark, isSystem, toggle, isLoading } = useTheme();

  // Размеры кнопки
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  // Размеры иконок
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Иконки для тем
  const icons = {
    light: (
      <svg
        className={iconSizeClasses[size]}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
      </svg>
    ),
    dark: (
      <svg
        className={iconSizeClasses[size]}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
      </svg>
    ),
    system: (
      <svg
        className={iconSizeClasses[size]}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h10.5a3 3 0 013 3V15a3 3 0 01-3 3H5.25a3 3 0 01-3-3V5.25zm6.75 3a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6zm0 3a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6zm-3 3a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clipRule="evenodd" />
        <path d="M5.25 15a3 3 0 00-3 3v.75c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V18a3 3 0 00-3-3H5.25z" />
      </svg>
    ),
  };

  // Определяем текущую иконку
  const getCurrentIcon = () => {
    if (isSystem) {
      return icons.system;
    }
    return isDark ? icons.dark : icons.light;
  };

  // Определяем текст подсказки
  const getTooltipText = () => {
    if (isSystem) {
      return `Системная тема (сейчас ${isDark ? 'темная' : 'светлая'})`;
    }
    return `Переключить на ${isDark ? 'светлую' : 'темную'} тему`;
  };

  // Определяем следующее состояние для подсказки
  const getNextStateText = () => {
    if (theme === 'light') return 'темную тему';
    if (theme === 'dark') return 'системную тему';
    return 'светлую тему';
  };

  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-surface-secondary dark:bg-dark-surface-secondary animate-pulse ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      className={`
        ${sizeClasses[size]}
        relative
        rounded-full
        bg-surface-secondary
        dark:bg-dark-surface-secondary
        hover:bg-gray-200
        dark:hover:bg-gray-600
        text-text-primary
        dark:text-dark-text-primary
        transition-all
        duration-200
        ease-out
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500
        focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        group
        ${className}
      `}
      aria-label={`Переключить на ${getNextStateText()}`}
      title={getTooltipText()}
    >
      {/* Основная иконка */}
      <div className="absolute inset-0 flex items-center justify-center">
        {getCurrentIcon()}
      </div>

      {/* Индикатор системной темы */}
      {isSystem && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-primary-500 rounded-full transform translate-x-0.5 -translate-y-0.5 shadow-sm" />
      )}

      {/* Эффект наведения */}
      <div
        className={`
          absolute
          inset-0
          rounded-full
          bg-gradient-to-r
          from-primary-500/10
          to-primary-600/10
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-200
        `}
      />
    </button>
  );
};

export default ThemeToggle; 