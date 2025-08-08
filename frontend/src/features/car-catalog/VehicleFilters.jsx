import { useState } from 'react';
import { useVehicleFilters } from './hooks/useVehicleFilters';
import { YearPopup } from './components/YearPopup';
import { PricePopup } from './components/PricePopup';
import { ParametersPopup } from './components/ParametersPopup';
import { useEffect } from 'react';

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
    getApiFilters,
    filterDataLoading
  } = useVehicleFilters();

  // Локальное состояние для попапов
  const [isYearPopupOpen, setIsYearPopupOpen] = useState(false);
  const [isPricePopupOpen, setIsPricePopupOpen] = useState(false);
  const [isParametersPopupOpen, setIsParametersPopupOpen] = useState(false);

  // Передаем изменения фильтров родительскому компоненту
  const handleFiltersUpdate = () => {
    console.log('🔍 handleFiltersUpdate вызван');
    if (onFiltersChange) {
      const apiFilters = getApiFilters();
      console.log('📋 Передаем фильтры родителю:', apiFilters);
      onFiltersChange(apiFilters);
    }
  };

  // Автоматически вызываем фильтрацию при изменении фильтров
  useEffect(() => {
    handleFiltersUpdate();
  }, [filters]); // Зависимость от filters

  // Обработчик изменения экспортируемой страны
  const handleCountryChange = (country) => {
    console.log('🔍 handleCountryChange:', country);
    updateCountriesFilter(country === 'all' ? ['all'] : [country]);
  };

  // Обработчик изменения марки
  const handleBrandChange = (brand) => {
    console.log('🔍 handleBrandChange:', brand);
    updateBrandFilter(brand);
  };

  // Обработчик изменения модели
  const handleModelChange = (model) => {
    console.log('🔍 handleModelChange:', model);
    updateFilter('model', model);
  };

  // Обработчик изменения состояния автомобиля
  const handleConditionChange = (condition) => {
    console.log('🔍 handleConditionChange:', condition);
    updateFilter('vehicleCondition', condition);
  };

  // Обработчик изменения наличия
  const handleAvailabilityChange = (availability) => {
    console.log('🔍 handleAvailabilityChange:', availability);
    updateFilter('availability', availability);
  };

  // Обработчик сброса фильтров
  const handleReset = () => {
    console.log('🔍 handleReset вызван');
    resetFilters();
  };

  // Список экспортируемых стран
  const countries = [
    { value: 'all', label: 'Все страны' },
    { value: 'japan', label: 'Япония' },
    { value: 'korea', label: 'Корея' },
    { value: 'uae', label: 'О.А.Э.' },
    { value: 'china', label: 'Китай' }
  ];

  // Опции наличия
  const availabilityOptions = [
    { value: 'all', label: 'Все' },
    { value: 'in_stock', label: 'В наличии' },
    { value: 'on_order', label: 'Под заказ' }
  ];

  // Состояния автомобиля
  const conditionOptions = [
    { value: 'all', label: 'Любое' },
    { value: 'new', label: 'Новые' },
    { value: 'used', label: 'С пробегом' }
  ];

  if (loading) {
    return (
      <div className={`bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-2 ${className}`}>
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

      {/* Грид-сетка фильтров */}
      <div className="grid grid-cols-3 gap-2">

		{/* Экспортируемая страна */}
        <div>
          <select
            value={filters.countries.includes('all') ? 'all' : filters.countries[0] || 'all'}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full p-3 border border-border dark:border-dark-border rounded-tl-md bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            {countries.map(country => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

		{/* Наличие */}
        <div>
          <select
            value={filters.availability || 'all'}
            onChange={(e) => handleAvailabilityChange(e.target.value)}
            className="w-full p-3 border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            {availabilityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Состояние */}
        <div>
          <select
            value={filters.vehicleCondition || 'all'}
            onChange={(e) => handleConditionChange(e.target.value)}
            className="w-full p-3 border border-border dark:border-dark-border rounded-tr-md bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            {conditionOptions.map(condition => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>

        

		

        {/* Марка */}
        <div className="col-span-3 md:col-span-2">
          <select
            value={filters.brand || ''}
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={filterDataLoading}
            className=" w-full p-3 border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <option value="">
              {filterDataLoading ? 'Загрузка...' : 'Все марки'}
            </option>
            {!filterDataLoading && getAvailableBrands.map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Модель - скрыта на мобильных */}
        <div className="hidden md:block">
          <select
            value={filters.model || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!filters.brand || filterDataLoading}
            className="w-full p-3 border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <option value="">
              {!filters.brand 
                ? 'Сначала марку' 
                : filterDataLoading 
                  ? 'Загрузка...' 
                  : 'Все модели'
              }
            </option>
            {filters.brand && !filterDataLoading && getAvailableModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Год выпуска */}
        <div className="relative">
          <button
            onClick={() => setIsYearPopupOpen(true)}
            className="w-full p-3 text-left border border-border dark:border-dark-border rounded-bl-md bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            {filters.yearRange.from || filters.yearRange.to ? (
              <span className="text-primary-600">
                {filters.yearRange.from || '...'} - {filters.yearRange.to || '...'}
              </span>
            ) : (
              <span className="text-text-muted dark:text-dark-text-muted">Год</span>
            )}
          </button>
          
          {isYearPopupOpen && (
            <YearPopup
              yearRange={filters.yearRange}
              onApply={(range) => {
                console.log('🔍 YearPopup onApply:', range);
                updateNestedFilter('yearRange', 'from', range.from);
                updateNestedFilter('yearRange', 'to', range.to);
                setIsYearPopupOpen(false);
                handleFiltersUpdate();
              }}
              onClose={() => setIsYearPopupOpen(false)}
            />
          )}
        </div>

        {/* Цена */}
        <div className="relative">
          <button
            onClick={() => setIsPricePopupOpen(true)}
            className="w-full p-3 text-left border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            {filters.priceRange.from || filters.priceRange.to ? (
              <span className="text-primary-600">
                {filters.priceRange.from ? `¥${parseInt(filters.priceRange.from).toLocaleString()}` : '...'} - 
                {filters.priceRange.to ? `¥${parseInt(filters.priceRange.to).toLocaleString()}` : '...'}
              </span>
            ) : (
              <span className="text-text-muted dark:text-dark-text-muted">Цена</span>
            )}
          </button>
          
          {isPricePopupOpen && (
            <PricePopup
              priceRange={filters.priceRange}
              onApply={(range) => {
                console.log('🔍 PricePopup onApply:', range);
                updateNestedFilter('priceRange', 'from', range.from);
                updateNestedFilter('priceRange', 'to', range.to);
                setIsPricePopupOpen(false);
                handleFiltersUpdate();
              }}
              onClose={() => setIsPricePopupOpen(false)}
            />
          )}
        </div>

        {/* Параметры */}
        <div className="relative">
          <button
            onClick={() => setIsParametersPopupOpen(true)}
            className="w-full p-3 text-left border border-border dark:border-dark-border rounded-br-md bg-surface-secondary dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            {filters.parameters.fuelType || filters.parameters.transmission ? (
              <span className="text-primary-600">
                {[filters.parameters.fuelType, filters.parameters.transmission]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            ) : (
              <span className="text-text-muted dark:text-dark-text-muted">Параметры</span>
            )}
          </button>
          
          {isParametersPopupOpen && (
            <ParametersPopup
              parameters={filters.parameters}
              onApply={(params) => {
                console.log('🔍 ParametersPopup onApply:', params);
                updateNestedFilter('parameters', 'fuelType', params.fuelType);
                updateNestedFilter('parameters', 'transmission', params.transmission);
                updateNestedFilter('parameters', 'driveType', params.driveType);
                setIsParametersPopupOpen(false);
                handleFiltersUpdate();
              }}
              onClose={() => setIsParametersPopupOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters; 