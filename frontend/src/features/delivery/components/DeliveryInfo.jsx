import { useState, useEffect } from 'react';
import { useDelivery } from '../hooks/useDelivery';
import { useVehicleFilters } from '../../car-catalog/hooks/useVehicleFilters';

const DeliveryInfo = ({ city: _city, filters: propFilters, className = '' }) => {
  const { deliveryInfo } = useDelivery();
  const { filters: storeFilters } = useVehicleFilters();
  const [isExpanded, setIsExpanded] = useState(false);
  
    // Используем фильтры из props или из store
  const filters = propFilters || storeFilters;
  
  // Маппинг названий стран
  const countryNames = {
    'china': 'Китай',
    'japan': 'Япония',
    'uae': 'О.А.Э.',
    'korea': 'Корея',
    'europe': 'Европа'
  };
  
  // Получаем выбранную страну импорта
  const selectedCountry = filters?.country === 'all' || !filters?.country ? null : filters.country;
  
  // Проверяем что выбраны необходимые параметры
  const hasRequiredData = deliveryInfo?.city && deliveryInfo?.zone && selectedCountry;
  
  // Логируем изменения фильтров
  useEffect(() => {
  }, [filters, propFilters, storeFilters, selectedCountry]);
  
  // Функция для получения дней доставки
  const getDeliveryDays = () => {
    if (!hasRequiredData) {
      return null;
    }
    
    // Получаем дни доставки напрямую из зоны для выбранной страны
    const deliveryDays = deliveryInfo.zone[`${selectedCountry}_prices`];
    console.log('🔍 DeliveryInfo - дни доставки для', selectedCountry, ':', deliveryDays);
    
    return deliveryDays;
  };
  
  const deliveryDays = getDeliveryDays();
  
  if (!deliveryInfo) return null;

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg ${className}`}>
      {/* Заголовок с кнопкой аккордеона (мобильная версия) */}
      <button
        onClick={toggleAccordion}
        className="w-full p-4 flex items-center justify-between md:hidden hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
        aria-expanded={isExpanded}
        aria-controls="delivery-accordion-content"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary text-left">
            Информация о доставке
          </h3>
        </div>
        <svg 
          className={`w-5 h-5 text-text-secondary dark:text-dark-text-secondary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Заголовок для десктопа */}
      <div className="hidden md:flex items-center space-x-2 p-4 pb-0">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
          Информация о доставке
        </h3>
      </div>

      {/* Контент аккордеона */}
      <div 
        id="delivery-accordion-content"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } md:max-h-screen md:opacity-100`}
      >
        <div className="p-4 pt-0 md:pt-4">
          {/* Информация о городе */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <dt className="text-sm text-text-secondary dark:text-dark-text-secondary">Город доставки</dt>
              <dd className="font-medium text-text-primary dark:text-dark-text-primary">
                {deliveryInfo.city.name}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm text-text-secondary dark:text-dark-text-secondary">Регион</dt>
              <dd className="font-medium text-text-primary dark:text-dark-text-primary">
                {deliveryInfo.city.region}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm text-text-secondary dark:text-dark-text-secondary">Зона доставки</dt>
              <dd className="font-medium text-text-primary dark:text-dark-text-primary">
                {deliveryInfo.zone.name}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm text-text-secondary dark:text-dark-text-secondary">Страна импорта</dt>
              <dd className="font-medium text-text-primary dark:text-dark-text-primary">
                {selectedCountry ? countryNames[selectedCountry] || selectedCountry : 'Не выбрана'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm text-text-secondary dark:text-dark-text-secondary">Срок доставки</dt>
              <dd className="font-medium text-text-primary dark:text-dark-text-primary">
                {deliveryDays ? `${deliveryDays} дней` : 'Не выбран'}
              </dd>
            </div>
          </div>

          {/* Сообщение о необходимости выбора параметров */}
          {!hasRequiredData && (
            <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-xs text-warning-700 dark:text-warning-300">
                  <p>Для расчета срока доставки необходимо выбрать:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {!deliveryInfo?.city && <li>Город доставки</li>}
                    {!selectedCountry && <li>Страну импорта в фильтрах (Китай, Япония, О.А.Э., Корея, Европа)</li>}
                    {deliveryInfo?.city && !deliveryInfo?.zone && <li>Дождаться загрузки информации о зоне доставки</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Дополнительная информация */}
          <div className="mt-4 p-3 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-info-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-info-700 dark:text-info-300">
                <p>Срок доставки может изменяться в зависимости от наличия автомобиля и текущей загрузки.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DeliveryInfo }; 