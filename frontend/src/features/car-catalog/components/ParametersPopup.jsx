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
            Параметры
          </h4>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 md:flex-none">
          <div className="flex items-center justify-between hidden md:flex">
            <h4 className="font-medium text-text-primary dark:text-dark-text-primary">
              Параметры
            </h4>
            {getActiveParametersCount() > 0 && (
              <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
                {getActiveParametersCount()} выбрано
              </span>
            )}
          </div>
          
          {/* Тип топлива */}
          <div className="mt-4 md:mt-0">
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              Тип топлива
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fuelTypes.map(type => (
                <label key={type} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="fuelType"
                    value={type}
                    checked={localParameters.fuelType === type}
                    onChange={() => handleParameterChange('fuelType', type)}
                    className="w-4 h-4 text-primary-600 bg-white dark:bg-dark-surface border-border dark:border-dark-border focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-text-primary dark:text-dark-text-primary">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Коробка передач */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              Коробка передач
            </label>
            <div className="grid grid-cols-2 gap-2">
              {transmissions.map(type => (
                <label key={type} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="transmission"
                    value={type}
                    checked={localParameters.transmission === type}
                    onChange={() => handleParameterChange('transmission', type)}
                    className="w-4 h-4 text-primary-600 bg-white dark:bg-dark-surface border-border dark:border-dark-border focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-text-primary dark:text-dark-text-primary">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Привод */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              Привод
            </label>
            <div className="grid grid-cols-2 gap-2">
              {driveTypes.map(type => (
                <label key={type} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="driveType"
                    value={type}
                    checked={localParameters.driveType === type}
                    onChange={() => handleParameterChange('driveType', type)}
                    className="w-4 h-4 text-primary-600 bg-white dark:bg-dark-surface border-border dark:border-dark-border focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-text-primary dark:text-dark-text-primary">
                    {type}
                  </span>
                </label>
              ))}
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

export { ParametersPopup }; 