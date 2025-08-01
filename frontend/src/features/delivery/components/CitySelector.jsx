import { useState, useRef, useEffect } from 'react';
import { useDelivery } from '../hooks/useDelivery';
import { Button } from '../../../shared/ui/Button';
import { Popup } from '../../../shared/ui/Popup';

const CitySelector = ({ onCitySelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  
  const {
    selectedCity,
    searchQuery,
    searchResults,
    setSearchQuery,
    selectCity,
    clearCity,
    isLoading
  } = useDelivery();

  // Уведомляем родительский компонент о выбранном городе при инициализации
  useEffect(() => {
    if (selectedCity && onCitySelect) {
      onCitySelect(selectedCity.id);
    }
  }, [selectedCity, onCitySelect]);

  const handleCitySelect = (cityId) => {
    selectCity(cityId);
    setIsOpen(false);
    
    if (onCitySelect) {
      onCitySelect(cityId);
    }
  };

  const handleClear = () => {
    clearCity();
    setSearchQuery('');
    
    if (onCitySelect) {
      onCitySelect(null);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Заголовок */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
          Город доставки
        </label>
        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
          Выберите город для расчета стоимости доставки
        </p>
      </div>

      {/* Выбранный город */}
      {selectedCity && (
        <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-primary-700 dark:text-primary-300">
                {selectedCity.name}
              </div>
              <div className="text-xs text-primary-600 dark:text-primary-400">
                {selectedCity.region} • Зона {selectedCity.delivery_zone} • {selectedCity.delivery_days} дней
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Поле поиска */}
      {!selectedCity && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Начните вводить название города..."
            className="w-full px-4 py-3 border border-border dark:border-dark-border rounded-lg 
                     bg-surface-elevated dark:bg-dark-surface-elevated
                     text-text-primary dark:text-dark-text-primary
                     placeholder-text-muted dark:placeholder-dark-text-muted
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-colors"
          />
          
          {/* Иконка поиска */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 text-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Выпадающий список результатов */}
          <Popup 
            isOpen={isOpen && searchResults.length > 0} 
            onClose={() => setIsOpen(false)}
            className="w-full max-h-64 overflow-y-auto p-2"
          >
            {searchResults.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-surface dark:hover:bg-dark-surface-secondary 
                         transition-colors group"
              >
                <div className="font-medium text-text-primary dark:text-dark-text-primary group-hover:text-primary-600">
                  {city.name}
                </div>
                <div className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {city.region} • Зона {city.delivery_zone} • {city.delivery_days} дней
                </div>
              </button>
            ))}
          </Popup>
        </div>
      )}

      {/* Подсказка */}
      {!selectedCity && searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="mt-2 text-xs text-text-muted dark:text-dark-text-muted">
          Введите минимум 2 символа для поиска
        </p>
      )}

      {/* Нет результатов */}
      {!selectedCity && searchQuery.length >= 2 && searchResults.length === 0 && (
        <p className="mt-2 text-xs text-text-secondary dark:text-dark-text-secondary">
          Город не найден. Попробуйте другой запрос.
        </p>
      )}
    </div>
  );
};

export { CitySelector }; 