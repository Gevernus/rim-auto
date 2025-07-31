import { useState } from 'react';
import { Popup } from '../../../shared/ui';

const PricePopup = ({ filters, onUpdate, onClose, options }) => {
  const [priceFrom, setPriceFrom] = useState(filters.priceRange.from || '');
  const [priceTo, setPriceTo] = useState(filters.priceRange.to || '');

  const handleApply = () => {
    onUpdate({
      priceRange: {
        from: priceFrom,
        to: priceTo
      }
    });
    onClose();
  };

  const handleReset = () => {
    setPriceFrom('');
    setPriceTo('');
    onUpdate({
      priceRange: {
        from: '',
        to: ''
      }
    });
  };

  // Предустановленные диапазоны цен
  const priceRanges = [
    { label: 'До ¥200,000', from: '', to: '200000' },
    { label: '¥200,000 - ¥300,000', from: '200000', to: '300000' },
    { label: '¥300,000 - ¥400,000', from: '300000', to: '400000' },
    { label: '¥400,000 - ¥500,000', from: '400000', to: '500000' },
    { label: 'Свыше ¥500,000', from: '500000', to: '' }
  ];

  const selectPriceRange = (range) => {
    setPriceFrom(range.from);
    setPriceTo(range.to);
  };

  const formatPrice = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Popup isOpen={true} onClose={onClose} className="p-4 min-w-80">
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
          Цена
        </h4>
        
        {/* Быстрый выбор диапазонов */}
        <div className="space-y-2">
          <label className="block text-xs text-text-secondary dark:text-dark-text-secondary">
            Быстрый выбор
          </label>
          <div className="grid grid-cols-1 gap-1">
            {priceRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => selectPriceRange(range)}
                className="text-left px-2 py-1 text-sm rounded hover:bg-surface dark:hover:bg-dark-surface transition-colors text-text-primary dark:text-dark-text-primary"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ручной ввод */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
              От (¥)
            </label>
            <input
              type="number"
              placeholder="0"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
            />
          </div>
          
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
              До (¥)
            </label>
            <input
              type="number"
              placeholder="∞"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
            />
          </div>
        </div>

        {/* Информация о диапазоне в данных */}
        <div className="text-xs text-text-muted dark:text-dark-text-muted">
          Диапазон в каталоге: {formatPrice(options.minPrice)} - {formatPrice(options.maxPrice)}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Применить
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>
    </Popup>
  );
};

export { PricePopup }; 