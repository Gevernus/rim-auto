import { useState } from 'react';
import { Popup } from '../../../shared/ui';

const ParametersPopup = ({ parameters, onApply, onClose }) => {
  const [localParameters, setLocalParameters] = useState(parameters || {
    fuelType: '',
    transmission: '',
    driveType: ''
  });

  const handleParameterChange = (key, value) => {
    setLocalParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApply(localParameters);
  };

  const handleReset = () => {
    const resetParams = {
      fuelType: '',
      transmission: '',
      driveType: ''
    };
    setLocalParameters(resetParams);
    onApply(resetParams);
  };

  const getActiveParametersCount = () => {
    return Object.values(localParameters).filter(value => value !== '').length;
  };

  // Статические опции параметров
  const fuelTypes = ['Electric', 'Petrol', 'Hybrid', 'Diesel'];
  const transmissions = ['Automatic', 'Manual', 'CVT', 'Single-speed'];
  const driveTypes = ['FWD', 'RWD', 'AWD', '4WD'];

  return (
    <Popup isOpen={true} onClose={onClose} className="p-4 min-w-80">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
            Параметры
          </h4>
          {getActiveParametersCount() > 0 && (
            <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
              {getActiveParametersCount()} выбрано
            </span>
          )}
        </div>
        
        {/* Тип топлива */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
            Тип топлива
          </label>
          <select
            value={localParameters.fuelType}
            onChange={(e) => handleParameterChange('fuelType', e.target.value)}
            className="w-full p-2 text-sm border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
          >
            <option value="">Любой</option>
            {fuelTypes.map(type => (
              <option key={type} value={type}>
                {type === 'Electric' ? 'Электрический' : 
                 type === 'Hybrid' ? 'Гибрид' :
                 type === 'Petrol' ? 'Бензин' :
                 type === 'Diesel' ? 'Дизель' : type}
              </option>
            ))}
          </select>
        </div>

        {/* Коробка передач */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
            Коробка передач
          </label>
          <select
            value={localParameters.transmission}
            onChange={(e) => handleParameterChange('transmission', e.target.value)}
            className="w-full p-2 text-sm border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
          >
            <option value="">Любая</option>
            {transmissions.map(type => (
              <option key={type} value={type}>
                {type === 'Automatic' ? 'Автоматическая' :
                 type === 'Manual' ? 'Механическая' :
                 type === 'CVT' ? 'Вариатор' :
                 type === 'Single-speed' ? 'Односкоростная' : type}
              </option>
            ))}
          </select>
        </div>

        {/* Привод */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
            Тип привода
          </label>
          <select
            value={localParameters.driveType}
            onChange={(e) => handleParameterChange('driveType', e.target.value)}
            className="w-full p-2 text-sm border border-border dark:border-dark-border rounded-md bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
          >
            <option value="">Любой</option>
            {driveTypes.map(type => (
              <option key={type} value={type}>
                {type === 'FWD' ? 'Передний' :
                 type === 'RWD' ? 'Задний' :
                 type === 'AWD' ? 'Полный' :
                 type === '4WD' ? 'Полный (4WD)' : type}
              </option>
            ))}
          </select>
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

export { ParametersPopup }; 