import { useState } from 'react';
import { Popup } from '../../../shared/ui';

const YearPopup = ({ filters, onUpdate, onClose, options }) => {
  const [yearFrom, setYearFrom] = useState(filters.yearRange.from || '');
  const [yearTo, setYearTo] = useState(filters.yearRange.to || '');

  const handleApply = () => {
    onUpdate({
      yearRange: {
        from: yearFrom,
        to: yearTo
      }
    });
    onClose();
  };

  const handleReset = () => {
    setYearFrom('');
    setYearTo('');
    onUpdate({
      yearRange: {
        from: '',
        to: ''
      }
    });
  };

  return (
    <Popup isOpen={true} onClose={onClose} className="p-4">
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
          Год выпуска
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
              От
            </label>
            <select
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
            >
              <option value="">Любой</option>
              {options.years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
              До
            </label>
            <select
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
            >
              <option value="">Любой</option>
              {options.years.map(year => (
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

export { YearPopup }; 