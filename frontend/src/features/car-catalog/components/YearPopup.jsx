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
    <Popup isOpen={true} onClose={onClose} className="p-4 w-96" align="start">
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
          Год выпуска
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              От
            </label>
            <select
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-full p-2 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              До
            </label>
            <select
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-full p-2 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

export { YearPopup }; 