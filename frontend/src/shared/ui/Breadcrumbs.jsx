import { useAppNavigation } from '../lib/navigation';

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - Текст хлебной крошки
 * @property {string} [href] - Путь для навигации (если не указан, элемент не кликабельный)
 * @property {boolean} [active] - Активный элемент (последний в цепочке)
 * @property {React.ComponentType} [icon] - Иконка для отображения рядом с текстом
 */

/**
 * Компонент хлебных крошек для навигации
 * @param {Object} props
 * @param {BreadcrumbItem[]} props.items - Массив элементов хлебных крошек
 * @param {string} props.separator - Символ разделителя (по умолчанию chevron)
 * @param {string} props.className - Дополнительные CSS классы
 */
const Breadcrumbs = ({ 
  items = [], 
  separator = 'chevron',
  className = '' 
}) => {
  const { navigateTo } = useAppNavigation();

  const handleClick = (href) => {
    if (href) {
      navigateTo(href);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const renderSeparator = () => {
    if (separator === 'chevron') {
      return <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />;
    }
    if (separator === 'slash') {
      return <span className="mx-2 text-gray-400">/</span>;
    }
    return <span className="mx-2 text-gray-400">{separator}</span>;
  };

  return (
    <nav className={`text-sm ${className}`} aria-label="Хлебные крошки">
      <ol className="flex items-center space-x-1 text-text-secondary dark:text-dark-text-secondary">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && renderSeparator()}
            
            <div className="flex items-center">
              {item.icon && (
                <item.icon className="w-4 h-4 mr-1.5" />
              )}
              
              {item.href && !item.active ? (
                <button
                  onClick={() => handleClick(item.href)}
                  className="hover:text-primary-600 transition-colors underline underline-offset-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm"
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ) : (
                <span 
                  className={`${
                    item.active 
                      ? 'text-text-primary dark:text-dark-text-primary font-medium' 
                      : 'text-text-secondary dark:text-dark-text-secondary'
                  }`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

// SVG иконка
const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export { Breadcrumbs }; 