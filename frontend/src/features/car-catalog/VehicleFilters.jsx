import { useVehicleFilters } from './hooks/useVehicleFilters';
import { YearPopup } from './components/YearPopup';
import { PricePopup } from './components/PricePopup';
import { ParametersPopup } from './components/ParametersPopup';

const VehicleFilters = ({ onFiltersChange, className }) => {
  const {
    filters,
    updateFilters,
    resetFilters,
    filterOptions,
    getModelsForBrand,
    isYearPopupOpen,
    setIsYearPopupOpen,
    isPricePopupOpen,
    setIsPricePopupOpen,
    isParametersPopupOpen,
    setIsParametersPopupOpen
  } = useVehicleFilters();

  // Передаем изменения фильтров родительскому компоненту
  const handleFiltersUpdate = (newFilters) => {
    updateFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange({ ...filters, ...newFilters });
    }
  };

  // Обработчик чекбоксов стран
  const handleCountryChange = (country) => {
    let newCountries = [...filters.countries];
    
    if (country === 'all') {
      newCountries = newCountries.includes('all') ? [] : ['all'];
    } else {
      // Убираем "Всё" если выбираем конкретную страну
      newCountries = newCountries.filter(c => c !== 'all');
      
      if (newCountries.includes(country)) {
        newCountries = newCountries.filter(c => c !== country);
      } else {
        newCountries.push(country);
      }
    }
    
    // Если не выбрана ни одна страна, автоматически выбираем "Всё"
    if (newCountries.length === 0) {
      newCountries = ['all'];
    }
    
    handleFiltersUpdate({ countries: newCountries });
  };

  // Обработчик изменения марки
  const handleBrandChange = (brand) => {
    handleFiltersUpdate({ 
      brand,
      model: '' // Сбрасываем модель при смене марки
    });
  };

  // Функция для отображения выбранного года
  const getYearDisplayText = () => {
    const { from, to } = filters.yearRange;
    if (from && to) {
      return `${from} - ${to}`;
    } else if (from) {
      return `от ${from}`;
    } else if (to) {
      return `до ${to}`;
    }
    return 'Год';
  };

  // Функция для отображения выбранной цены
  const getPriceDisplayText = () => {
    const { from, to } = filters.priceRange;
    if (from && to) {
      return `${from} - ${to}`;
    } else if (from) {
      return `от ${from}`;
    } else if (to) {
      return `до ${to}`;
    }
    return 'Цена';
  };

  // Функция для подсчета выбранных параметров
  const getSelectedParametersCount = () => {
    const { fuelType, transmission, bodyType, driveType } = filters.parameters;
    let count = 0;
    if (fuelType) count++;
    if (transmission) count++;
    if (bodyType) count++;
    if (driveType) count++;
    return count;
  };

  // Функция для отображения текста параметров
  const getParametersDisplayText = () => {
    const count = getSelectedParametersCount();
    if (count === 0) {
      return 'Выберите параметры';
    }
    return `Выбрано параметров (${count})`;
  };

  return (
    <div className={`bg-surface-elevated dark:bg-dark-surface-elevated rounded-lg shadow-sm border border-border dark:border-dark-border p-6 space-y-6 ${className}`}>
      {/* Первая строка - Чекбоксы стран и Заказ авто на одной строке */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Страна происхождения */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-3">
            Страна происхождения
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'japan', label: 'Япония' },
              { key: 'korea', label: 'Корея' },
              { key: 'uae', label: 'ОАЭ' },
              { key: 'china', label: 'Китай' },
              { key: 'all', label: 'Всё' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.countries.includes(key)}
                  onChange={() => handleCountryChange(key)}
                  className="w-4 h-4 text-primary-600 bg-form-bg dark:bg-dark-form-bg border-form-border dark:border-dark-form-border rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm text-text-primary dark:text-dark-text-primary">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Рим Авто / Заказ авто */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-3">
            Рим Авто / Заказ авто с
          </h3>
          <div className="flex gap-4">
            {[
              { key: 'used', label: 'пробегом' },
              { key: 'new', label: 'новые' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="vehicleCondition"
                  value={key}
                  checked={filters.vehicleCondition === key}
                  onChange={(e) => handleFiltersUpdate({ vehicleCondition: e.target.value })}
                  className="w-4 h-4 text-primary-600 bg-form-bg dark:bg-dark-form-bg border-form-border dark:border-dark-form-border focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm text-text-primary dark:text-dark-text-primary">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Вторая строка - Селект марки */}
      <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
          Выберите марку
        </label>
        <select
          value={filters.brand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full p-3 border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Все марки</option>
          {filterOptions.brands.map(brand => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Третья строка - Селект модели */}
      <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
          Выберите модель
        </label>
        <select
          value={filters.model}
          onChange={(e) => handleFiltersUpdate({ model: e.target.value })}
          disabled={!filters.brand}
          className="w-full p-3 border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Все модели</option>
          {filters.brand && getModelsForBrand(filters.brand).map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Четвертая строка - Год, Цена, Параметры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Год */}
        <div className="relative">
          <button
            onClick={() => setIsYearPopupOpen(!isYearPopupOpen)}
            className="w-full p-3 border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex justify-between items-center"
          >
            <span>{getYearDisplayText()}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isYearPopupOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isYearPopupOpen && (
            <YearPopup
              filters={filters}
              onUpdate={handleFiltersUpdate}
              onClose={() => setIsYearPopupOpen(false)}
              options={filterOptions}
            />
          )}
        </div>

        {/* Цена */}
        <div className="relative">
          <button
            onClick={() => setIsPricePopupOpen(!isPricePopupOpen)}
            className="w-full p-3 border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex justify-between items-center"
          >
            <span>{getPriceDisplayText()}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isPricePopupOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isPricePopupOpen && (
            <PricePopup
              filters={filters}
              onUpdate={handleFiltersUpdate}
              onClose={() => setIsPricePopupOpen(false)}
              options={filterOptions}
            />
          )}
        </div>

        {/* Параметры */}
        <div className="relative">
          <button
            onClick={() => setIsParametersPopupOpen(!isParametersPopupOpen)}
            className="w-full p-3 border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex justify-between items-center"
          >
            <span>{getParametersDisplayText()}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isParametersPopupOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isParametersPopupOpen && (
            <ParametersPopup
              filters={filters}
              onUpdate={handleFiltersUpdate}
              onClose={() => setIsParametersPopupOpen(false)}
              options={filterOptions}
            />
          )}
        </div>
      </div>

      {/* Кнопка сброса фильтров */}
      <div className="flex justify-end pt-4 border-t border-border dark:border-dark-border">
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
        >
          Сбросить все фильтры
        </button>
      </div>
    </div>
  );
};

export { VehicleFilters }; 