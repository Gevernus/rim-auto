import { useState } from 'react';
import { Popup } from '../../../shared/ui';

const PricePopup = ({ priceRange, onApply, onClose }) => {
  const [priceFrom, setPriceFrom] = useState(priceRange.from || '');
  const [priceTo, setPriceTo] = useState(priceRange.to || '');

  const handleApply = () => {
    onApply({
      from: priceFrom,
      to: priceTo
    });
  };

  const handleReset = () => {
    setPriceFrom('');
    setPriceTo('');
    onApply({
      from: '',
      to: ''
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
    <Popup isOpen={true} onClose={onClose} className="p-4 w-96" align="start">
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
          Диапазон цен
        </h4>
        
        {/* Быстрый выбор диапазонов */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
            Быстрый выбор
          </label>
          <div className="grid grid-cols-1 gap-2">
            {priceRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => selectPriceRange(range)}
                className="text-left px-3 py-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-primary dark:text-dark-text-primary border border-border dark:border-dark-border"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Ручной ввод */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
            Ручной ввод
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                От
              </label>
              <input
                type="number"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                До
              </label>
              <input
                type="number"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                placeholder="∞"
                className="w-full p-2 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
          >
            Применить
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-border dark:border-dark-border text-text-primary dark:text-dark-text-primary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>
    </Popup>
  );
};

export { PricePopup }; 