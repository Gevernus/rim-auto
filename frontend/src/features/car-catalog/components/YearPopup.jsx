import { useState } from 'react';
import { Popup } from '../../../shared/ui';

const YearPopup = ({ yearRange, onApply, onClose }) => {
  const [yearFrom, setYearFrom] = useState(yearRange.from || '');
  const [yearTo, setYearTo] = useState(yearRange.to || '');

  const handleApply = () => {
    onApply({
      from: yearFrom,
      to: yearTo
    });
  };

  const handleReset = () => {
    setYearFrom('');
    setYearTo('');
    onApply({
      from: '',
      to: ''
    });
  };

  // Генерируем список годов
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year);
  }

  return (
    <Popup isOpen={true} onClose={onClose} className="p-4">
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
          Год выпуска
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
              От
            </label>
            <select
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-full p-2 text-sm border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
            >
              <option value="">Любой</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
              До
            </label>
            <select
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-full p-2 text-sm border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
            >
              <option value="">Любой</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Быстрый выбор диапазонов */}
        <div className="space-y-2">
          <label className="block text-xs text-text-secondary dark:text-dark-text-secondary">
            Быстрый выбор
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Новые (2022-2024)', from: '2022', to: currentYear.toString() },
              { label: 'Свежие (2020-2021)', from: '2020', to: '2021' },
              { label: 'Современные (2018-2019)', from: '2018', to: '2019' },
              { label: 'Доступные (до 2017)', from: '', to: '2017' }
            ].map((range, index) => (
              <button
                key={index}
                onClick={() => {
                  setYearFrom(range.from);
                  setYearTo(range.to);
                }}
                className="text-left px-2 py-1 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-primary dark:text-dark-text-primary border border-border dark:border-dark-border"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

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

export { YearPopup }; 