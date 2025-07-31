import { CarCard } from '../../shared/ui';
import { Loading } from '../../shared/ui';

/**
 * @typedef {import('../../shared/types/vehicle').Vehicle} Vehicle
 */

/**
 * Сетка карточек автомобилей
 * @param {Object} props
 * @param {Vehicle[]} props.vehicles - Массив автомобилей
 * @param {boolean} props.loading - Состояние загрузки
 * @param {Function} props.onVehicleClick - Обработчик клика по автомобилю
 * @param {Function} props.onSpecsClick - Обработчик просмотра характеристик
 * @param {Function} props.onFavoriteToggle - Обработчик добавления/удаления из избранного
 * @param {Function} props.onCopyLink - Обработчик копирования ссылки
 * @param {Function} props.onHistoryClick - Обработчик просмотра истории
 * @param {string[]} props.favoriteVehicleIds - Массив ID избранных автомобилей
 * @param {string} props.className - Дополнительные CSS классы
 */
const CarGrid = ({
  vehicles = [],
  loading = false,
  onVehicleClick,
  onSpecsClick,
  onFavoriteToggle,
  onCopyLink,
  onHistoryClick,
  favoriteVehicleIds = [],
  className = '',
}) => {
  const handleCopyLink = async (vehicle) => {
    try {
      // Генерируем ссылку на детальную страницу автомобиля
      const link = `${window.location.origin}/car/${vehicle.id}`;
      await navigator.clipboard.writeText(link);
      
      // Уведомляем родительский компонент
      onCopyLink?.(vehicle, link);
      
      return link;
    } catch (error) {
      console.error('Failed to copy link:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-dark-surface">
        <Loading size="lg" text="Загрузка автомобилей..." />
        <p className="text-text-secondary dark:text-dark-text-secondary">
          Пожалуйста, подождите, мы загружаем для вас лучшие предложения
        </p>
      </div>
      
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-secondary dark:bg-dark-surface-secondary rounded-full mb-4">
          <svg className="w-8 h-8 text-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 19l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
          Автомобили не найдены
        </h2>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
          Попробуйте изменить параметры поиска
        </p>
      </div>
    );
  }

  return (
    <div className={`car-grid ${className}`}>
      {/* Заголовок с количеством */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Найдено автомобилей: {vehicles.length}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Результаты поиска по вашим критериям
          </p>
        </div>
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => (
          <CarCard
            key={vehicle.id}
            vehicle={vehicle}
            isFavorite={favoriteVehicleIds.includes(vehicle.id)}
            onDetailsClick={onVehicleClick}
            onSpecsClick={onSpecsClick}
            onFavoriteToggle={onFavoriteToggle}
            onCopyLink={handleCopyLink}
            onHistoryClick={onHistoryClick}
            className="animate-fade-in"
          />
        ))}
      </div>

      {/* Пагинация будет добавлена позже */}
    </div>
  );
};

// Иконка пустого состояния
const CarEmptyIcon = () => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-full h-full"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export { CarGrid }; 