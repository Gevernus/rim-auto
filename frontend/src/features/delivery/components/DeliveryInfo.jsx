import { useDelivery } from '../hooks/useDelivery';

const DeliveryInfo = ({ vehiclePrice = 0, className = '' }) => {
  const { deliveryInfo, calculateDeliveryCost } = useDelivery();

  if (!deliveryInfo) return null;

  const costInfo = calculateDeliveryCost(vehiclePrice);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
          Информация о доставке
        </h3>
      </div>

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
          <dt className="text-sm text-text-secondary dark:text-dark-text-secondary">Срок доставки</dt>
          <dd className="font-medium text-text-primary dark:text-dark-text-primary">
            {deliveryInfo.estimated_days} дней
          </dd>
        </div>
      </div>

      {/* Расчет стоимости */}
      {costInfo && (
        <div className="border-t border-border dark:border-dark-border pt-4">
          <h4 className="font-medium text-text-primary dark:text-dark-text-primary mb-3">
            Расчет стоимости доставки
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary dark:text-dark-text-secondary">
                Базовая стоимость ({deliveryInfo.zone.name})
              </span>
              <span className="text-text-primary dark:text-dark-text-primary">
                {formatPrice(costInfo.base_cost)}
              </span>
            </div>
            
            {costInfo.vehicle_factor > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-dark-text-secondary">
                  Надбавка за стоимость авто (1%)
                </span>
                <span className="text-text-primary dark:text-dark-text-primary">
                  {formatPrice(costInfo.vehicle_factor)}
                </span>
              </div>
            )}
            
            <div className="border-t border-border dark:border-dark-border pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-text-primary dark:text-dark-text-primary">
                  Итого доставка
                </span>
                <span className="text-primary-600 dark:text-primary-400">
                  {formatPrice(costInfo.total_cost)}
                </span>
              </div>
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
            <p>Стоимость доставки рассчитана приблизительно. Точная стоимость будет указана при оформлении заказа.</p>
            <p className="mt-1">Срок доставки может изменяться в зависимости от наличия автомобиля и текущей загрузки.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DeliveryInfo }; 