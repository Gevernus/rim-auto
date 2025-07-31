import { useState } from 'react';
import { useVehicleFilters } from './hooks/useVehicleFilters';
import { YearPopup } from './components/YearPopup';
import { PricePopup } from './components/PricePopup';
import { ParametersPopup } from './components/ParametersPopup';

const VehicleFilters = ({ onFiltersChange, className, loading }) => {
  const {
    filters,
    updateFilter,
    updateNestedFilter,
    updateCountriesFilter,
    updateBrandFilter,
    resetFilters,
    getAvailableBrands,
    getAvailableModels,
    hasActiveFilters,
    getApiFilters
  } = useVehicleFilters();

  // Локальное состояние для попапов
  const [isYearPopupOpen, setIsYearPopupOpen] = useState(false);
  const [isPricePopupOpen, setIsPricePopupOpen] = useState(false);
  const [isParametersPopupOpen, setIsParametersPopupOpen] = useState(false);

  // Передаем изменения фильтров родительскому компоненту
  const handleFiltersUpdate = () => {
    if (onFiltersChange) {
      const apiFilters = getApiFilters();
      onFiltersChange(apiFilters);
    }
  };

  // Обработчик чекбоксов стран
  const handleCountryChange = (country) => {
    let newCountries;
    if (country === 'all') {
      newCountries = filters.countries.includes('all') ? [] : ['all'];
    } else {
      if (filters.countries.includes('all')) {
        newCountries = [country];
      } else if (filters.countries.includes(country)) {
        newCountries = filters.countries.filter(c => c !== country);
      } else {
        newCountries = [...filters.countries, country];
      }
    }
    
    updateCountriesFilter(newCountries);
    setTimeout(handleFiltersUpdate, 0);
  };

  // Обработчик изменения марки
  const handleBrandChange = (brand) => {
    updateBrandFilter(brand);
    setTimeout(handleFiltersUpdate, 0);
  };

  // Обработчик изменения модели
  const handleModelChange = (model) => {
    updateFilter('model', model);
    setTimeout(handleFiltersUpdate, 0);
  };

  // Обработчик изменения состояния автомобиля
  const handleConditionChange = (condition) => {
    updateFilter('vehicleCondition', condition);
    setTimeout(handleFiltersUpdate, 0);
  };

  // Обработчик сброса фильтров
  const handleReset = () => {
    resetFilters();
    setTimeout(handleFiltersUpdate, 0);
  };

  // Список стран для фильтрации
  const countries = [
    { id: 'all', name: 'Все страны', flag: '🌍' },
    { id: 'china', name: 'Китай', flag: '🇨🇳' },
    { id: 'japan', name: 'Япония', flag: '🇯🇵' },
    { id: 'korea', name: 'Корея', flag: '🇰🇷' },
    { id: 'germany', name: 'Германия', flag: '🇩🇪' },
    { id: 'usa', name: 'США', flag: '🇺🇸' }
  ];

  if (loading) {
    return (
      <div className={`bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-6 ${className}`}>
      {/* Заголовок с кнопкой сброса */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
          Фильтры
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Первая строка - Страны и состояние */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Фильтр по странам */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-3">
            Страна производства
          </h4>
          <div className="flex flex-wrap gap-3">
            {countries.map(country => (
              <label key={country.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.countries.includes(country.id)}
                  onChange={() => handleCountryChange(country.id)}
                  className="w-4 h-4 text-primary-600 bg-white dark:bg-dark-surface border-border dark:border-dark-border rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-text-primary dark:text-dark-text-primary flex items-center">
                  <span className="mr-2">{country.flag}</span>
                  {country.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Состояние автомобиля */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-3">
            Состояние
          </h4>
          <div className="flex gap-4">
            {[
              { value: 'all', label: 'Любое' },
              { value: 'new', label: 'Новые' },
              { value: 'used', label: 'С пробегом' }
            ].map(condition => (
              <label key={condition.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value={condition.value}
                  checked={filters.vehicleCondition === condition.value}
                  onChange={() => handleConditionChange(condition.value)}
                  className="w-4 h-4 text-primary-600 bg-white dark:bg-dark-surface border-border dark:border-dark-border focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-text-primary dark:text-dark-text-primary">
                  {condition.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Вторая строка - Марка и модель */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Марка автомобиля */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
            Марка
          </label>
          <select
            value={filters.brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full p-3 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Все марки</option>
            {getAvailableBrands.map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Модель автомобиля */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
            Модель
          </label>
          <select
            value={filters.model}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!filters.brand}
            className="w-full p-3 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Все модели</option>
            {filters.brand && getAvailableModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Третья строка - Кнопки попапов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setIsYearPopupOpen(true)}
          className="p-3 text-left border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Год выпуска</span>
          <div className="mt-1">
            {filters.yearRange.from || filters.yearRange.to ? (
              <span className="text-primary-600">
                {filters.yearRange.from || '...'} - {filters.yearRange.to || '...'}
              </span>
            ) : (
              <span className="text-text-muted dark:text-dark-text-muted">Любой год</span>
            )}
          </div>
        </button>

        <button
          onClick={() => setIsPricePopupOpen(true)}
          className="p-3 text-left border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Цена</span>
          <div className="mt-1">
            {filters.priceRange.from || filters.priceRange.to ? (
              <span className="text-primary-600">
                {filters.priceRange.from ? `¥${parseInt(filters.priceRange.from).toLocaleString()}` : '...'} - 
                {filters.priceRange.to ? `¥${parseInt(filters.priceRange.to).toLocaleString()}` : '...'}
              </span>
            ) : (
              <span className="text-text-muted dark:text-dark-text-muted">Любая цена</span>
            )}
          </div>
        </button>

        <button
          onClick={() => setIsParametersPopupOpen(true)}
          className="p-3 text-left border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Параметры</span>
          <div className="mt-1">
            {filters.parameters.fuelType || filters.parameters.transmission ? (
              <span className="text-primary-600">
                {[filters.parameters.fuelType, filters.parameters.transmission]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            ) : (
              <span className="text-text-muted dark:text-dark-text-muted">Любые параметры</span>
            )}
          </div>
        </button>
      </div>

      {/* Попапы */}
      {isYearPopupOpen && (
        <YearPopup
          yearRange={filters.yearRange}
          onApply={(range) => {
            updateNestedFilter('yearRange', 'from', range.from);
            updateNestedFilter('yearRange', 'to', range.to);
            setIsYearPopupOpen(false);
            setTimeout(handleFiltersUpdate, 0);
          }}
          onClose={() => setIsYearPopupOpen(false)}
        />
      )}

      {isPricePopupOpen && (
        <PricePopup
          priceRange={filters.priceRange}
          onApply={(range) => {
            updateNestedFilter('priceRange', 'from', range.from);
            updateNestedFilter('priceRange', 'to', range.to);
            setIsPricePopupOpen(false);
            setTimeout(handleFiltersUpdate, 0);
          }}
          onClose={() => setIsPricePopupOpen(false)}
        />
      )}

      {isParametersPopupOpen && (
        <ParametersPopup
          parameters={filters.parameters}
          onApply={(params) => {
            updateNestedFilter('parameters', 'fuelType', params.fuelType);
            updateNestedFilter('parameters', 'transmission', params.transmission);
            updateNestedFilter('parameters', 'driveType', params.driveType);
            setIsParametersPopupOpen(false);
            setTimeout(handleFiltersUpdate, 0);
          }}
          onClose={() => setIsParametersPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default VehicleFilters; 