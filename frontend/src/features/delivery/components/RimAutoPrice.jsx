import { useDelivery } from '../hooks/useDelivery';

const RimAutoPrice = ({ vehicle, className = '' }) => {
  const { calculateTotalPriceInRubles, selectedCity } = useDelivery();
  
  if (!vehicle?.price?.amount || !selectedCity) return null;

  const priceInfo = calculateTotalPriceInRubles(vehicle.price.amount, 'CNY');
  
  if (!priceInfo) return null;

  return (
    <div className={`${className}`}>
      {/* Цена от Рим-Авто */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
            Цена от Рим-Авто:
          </span>
          <span className="text-xs text-text-muted dark:text-dark-text-muted">
            с доставкой в {selectedCity.name}
          </span>
        </div>
        <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
          {priceInfo.formattedTotal}
        </div>
      </div>

      {/* Детализация цены */}
      <div className="text-xs text-text-muted dark:text-dark-text-muted space-y-1">
        <div className="flex justify-between">
          <span>Стоимость авто:</span>
          <span>{priceInfo.formattedPrice}</span>
        </div>
        <div className="flex justify-between">
          <span>Доставка:</span>
          <span>{priceInfo.formattedDelivery}</span>
        </div>
        <div className="border-t border-border dark:border-dark-border pt-1 mt-1">
          <div className="flex justify-between font-medium text-text-primary dark:text-dark-text-primary">
            <span>Итого:</span>
            <span>{priceInfo.formattedTotal}</span>
          </div>
        </div>
      </div>

      {/* Бейдж "Рим-Авто" */}
      <div className="mt-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Рим-Авто
        </span>
      </div>
    </div>
  );
};

export { RimAutoPrice }; 