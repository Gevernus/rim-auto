import { useState } from 'react';
import { Popup } from '../../../shared/ui';

const ParametersPopup = ({ filters, onUpdate, onClose, options }) => {
  const [parameters, setParameters] = useState(filters.parameters || {
    fuelType: '',
    transmission: '',
    bodyType: '',
    driveType: ''
  });

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onUpdate({ parameters });
    onClose();
  };

  const handleReset = () => {
    const resetParams = {
      fuelType: '',
      transmission: '',
      bodyType: '',
      driveType: ''
    };
    setParameters(resetParams);
    onUpdate({ parameters: resetParams });
  };

  const getActiveParametersCount = () => {
    return Object.values(parameters).filter(value => value !== '').length;
  };

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
            value={parameters.fuelType}
            onChange={(e) => handleParameterChange('fuelType', e.target.value)}
            className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
          >
            <option value="">Любой</option>
            {options.fuelTypes.map(type => (
              <option key={type} value={type}>
                {type === 'Electric' ? 'Электрический' : 
                 type === 'Hybrid' ? 'Гибрид' :
                 type === 'Gasoline' ? 'Бензин' :
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
            value={parameters.transmission}
            onChange={(e) => handleParameterChange('transmission', e.target.value)}
            className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
          >
            <option value="">Любая</option>
            {options.transmissions.map(transmission => (
              <option key={transmission} value={transmission}>
                {transmission === 'Single-speed' ? 'Односкоростная' :
                 transmission === 'Automatic' ? 'Автоматическая' :
                 transmission === 'Manual' ? 'Механическая' :
                 transmission === 'CVT' ? 'Вариатор' : transmission}
              </option>
            ))}
          </select>
        </div>

        {/* Тип кузова */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
            Тип кузова
          </label>
          <select
            value={parameters.bodyType}
            onChange={(e) => handleParameterChange('bodyType', e.target.value)}
            className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
          >
            <option value="">Любой</option>
            <option value="sedan">Седан</option>
            <option value="suv">Внедорожник</option>
            <option value="hatchback">Хэтчбек</option>
            <option value="coupe">Купе</option>
            <option value="wagon">Универсал</option>
            <option value="crossover">Кроссовер</option>
          </select>
        </div>

        {/* Тип привода */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
            Тип привода
          </label>
          <select
            value={parameters.driveType}
            onChange={(e) => handleParameterChange('driveType', e.target.value)}
            className="w-full p-2 text-sm border border-form-border dark:border-dark-form-border rounded-md bg-form-bg dark:bg-dark-form-bg text-form-text dark:text-dark-form-text"
          >
            <option value="">Любой</option>
            <option value="fwd">Передний</option>
            <option value="rwd">Задний</option>
            <option value="awd">Полный</option>
            <option value="4wd">Подключаемый полный</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border dark:border-dark-border">
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

export { ParametersPopup }; 