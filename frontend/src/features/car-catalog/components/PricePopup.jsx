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
    <Popup isOpen={true} onClose={onClose} className="p-4">
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
                className="text-left px-2 py-1 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-primary dark:text-dark-text-primary border border-border dark:border-dark-border"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ручной ввод */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
              От (¥)
            </label>
            <input
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder="0"
              className="w-full p-2 text-sm border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
              До (¥)
            </label>
            <input
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              placeholder="∞"
              className="w-full p-2 text-sm border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
            />
          </div>
        </div>

        {/* Предпросмотр выбранного диапазона */}
        {(priceFrom || priceTo) && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
              Диапазон: {formatPrice(priceFrom) || '¥0'} - {formatPrice(priceTo) || '∞'}
            </span>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-between pt-3 border-t border-border dark:border-dark-border">
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary"
          >
            Сбросить
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm border border-border dark:border-dark-border rounded text-text-primary dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Отмена
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export { PricePopup }; 