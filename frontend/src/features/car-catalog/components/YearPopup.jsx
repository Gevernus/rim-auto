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
    <Popup 
      isOpen={true} 
      onClose={onClose} 
      className="md:p-4 md:w-96 w-full h-full md:h-auto md:rounded-lg rounded-none" 
      align="start"
      mobileFullScreen={true}
    >
      <div className="space-y-4 h-full md:h-auto flex flex-col">
        {/* Заголовок с кнопкой закрытия для мобильных */}
        <div className="flex items-center justify-between md:hidden border-b border-border dark:border-dark-border pb-4 mb-4">
          <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
            Год выпуска
          </h4>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 md:flex-none">
          <h4 className="font-medium text-text-primary dark:text-dark-text-primary hidden md:block">
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
                className="w-full p-3 md:p-2 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full p-3 md:p-2 border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
        </div>
        
        {/* Кнопки действий */}
        <div className="flex gap-2 pt-4 md:pt-2 mt-auto md:mt-0">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 md:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
          >
            Применить
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-3 md:py-2 border border-border dark:border-dark-border text-text-primary dark:text-dark-text-primary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>
    </Popup>
  );
};

export { YearPopup }; 