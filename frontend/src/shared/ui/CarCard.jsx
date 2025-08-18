import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { RimAutoPrice } from '../../features/calculator/RimAutoPrice';

/**
 * @typedef {import('../types/vehicle').Vehicle} Vehicle
 */

/**
 * Карточка автомобиля
 * @param {Object} props
 * @param {Vehicle} props.vehicle - Данные автомобиля
 * @param {Function} props.onDetailsClick - Обработчик нажатия "Подробнее"
 * @param {Function} props.onSpecsClick - Обработчик нажатия "Все характеристики"
 * @param {Function} props.onFavoriteToggle - Обработчик добавления/удаления из избранного
 * @param {Function} props.onCopyLink - Обработчик копирования ссылки
 * @param {Function} props.onHistoryClick - Обработчик просмотра истории
 * @param {boolean} props.isFavorite - В избранном ли автомобиль
 * @param {string} props.className - Дополнительные CSS классы
 */
const CarCard = ({
  vehicle,
  onDetailsClick,
  onSpecsClick,
  onFavoriteToggle,
  onHistoryClick,
  isFavorite = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCopyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const link = `${window.location.origin}/car/${vehicle.id}`;
      await navigator.clipboard.writeText(link);
      console.log('Ссылка скопирована:', link);
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const defaultImage = '/placeholder-car.svg';
  const imageUrl = !imageError && vehicle.images?.[0] ? vehicle.images[0] : defaultImage;

  return (
    <Card 
      className={`overflow-hidden hover-lift transition-all duration-300 cursor-pointer ${className}`}
      padding="none"
      hover={true}
      onClick={() => onDetailsClick?.(vehicle)}
    >
      {/* Изображение автомобиля */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
        <img
          src={imageUrl}
          alt={vehicle.english_title || vehicle.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {/* Бейдж с типом топлива */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={vehicle.fuel_type === 'Electric' ? 'success' : 'secondary'}
            size="sm"
          >
            {vehicle.fuel_type === 'Electric' ? 'EV' : vehicle.fuel_type}
          </Badge>
        </div>

        {/* Панель действий */}
        <div className="absolute top-3 right-3 flex gap-2">
          {/* История обновлений */}
          <button
            onClick={(e) => { e.stopPropagation(); onHistoryClick?.(vehicle); }}
            className="p-2 rounded-full hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
            title="История обновления объявления"
          >
            <HistoryIcon className="w-4 h-4 text-text-muted dark:text-dark-text-muted" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleCopyLink(e); }}
            className="p-2 rounded-full hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
            title="Скопировать ссылку"
          >
            <LinkIcon className="w-4 h-4 text-text-muted dark:text-dark-text-muted" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onFavoriteToggle?.(vehicle); }}
            className={`p-2 rounded-full hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors ${
              isFavorite 
                ? 'text-red-500' 
                : 'text-text-muted dark:text-dark-text-muted'
            }`}
            title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Основная информация */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary line-clamp-2 mb-1">
          {vehicle.english_title || vehicle.title}
        </h3>
        
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
          {vehicle.year} • {vehicle.mileage.formatted} • {vehicle.location.city}
        </p>

        {/* Цена от Рим-Авто */}
        <div className="mt-3 mb-4">
          <RimAutoPrice vehicle={vehicle} />
        </div>

        {/* Оригинальная цена (меньше и серым) */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted dark:text-dark-text-muted">
              Цена в Китае:
            </span>
            <span className="text-lg text-text-secondary dark:text-dark-text-secondary">
              {vehicle.price.formatted}
            </span>
          </div>
        </div>

        {/* Характеристики */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-dark-text-secondary">Мощность:</span>
            <span className="font-medium text-text-primary dark:text-dark-text-primary">
              {vehicle.specifications.power || '—'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-dark-text-secondary">Запас хода:</span>
            <span className="font-medium text-text-primary dark:text-dark-text-primary">
              {vehicle.specifications.range || '—'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-dark-text-secondary">КПП:</span>
            <span className="font-medium text-text-primary dark:text-dark-text-primary">
              {vehicle.transmission}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-dark-text-secondary">Цвет:</span>
            <span className="font-medium text-text-primary dark:text-dark-text-primary">
              {vehicle.specifications.color}
            </span>
          </div>
        </div>

        {/* Локация и продавец */}
        <div className="mb-4 text-sm">
          <div className="flex items-center text-text-secondary dark:text-dark-text-secondary mb-1">
            <LocationIcon className="w-4 h-4 mr-1" />
            <span>{vehicle.location.city}, {vehicle.location.region}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-text-secondary dark:text-dark-text-secondary">{vehicle.seller.english_name}</span>
              {vehicle.seller.certified && (
                <Badge variant="success" size="sm" className="ml-2">
                  Проверен
                </Badge>
              )}
            </div>
            <div className="flex items-center text-yellow-500">
              <StarIcon className="w-4 h-4" />
              <span className="ml-1 text-sm">{vehicle.seller.rating}</span>
            </div>
          </div>
        </div>

        {/* История и статус */}
        <div className="flex items-center gap-2 mb-4">
          {vehicle.history.accident_free && (
            <Badge variant="success" size="sm">
              Без аварий
            </Badge>
          )}
          
          <Badge variant="secondary" size="sm">
            {vehicle.history.owners_count} владелец{vehicle.history.owners_count > 1 ? 'а' : ''}
          </Badge>
          
          <span className="text-xs text-text-muted dark:text-dark-text-muted">
            {vehicle.market_data.days_listed} дн. в продаже
          </span>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onDetailsClick?.(vehicle);
            }}
          >
            Подробнее
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onSpecsClick?.(vehicle);
            }}
          >
            Все характеристики
          </Button>
        </div>
      </div>
    </Card>
  );
};

// SVG иконки как компоненты
const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const LinkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const HistoryIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LocationIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export { CarCard }; 