import { useState, useEffect } from 'react';
import { useAppParams } from '../../shared/lib/navigation';
import { routes } from '../../shared/lib/navigation';
import { useVehicle } from '../../shared/hooks/useCars';
import { ImageGallery, Card, Button, Badge, Loading, Breadcrumbs } from '../../shared/ui';

/**
 * @typedef {import('../../shared/types/vehicle').Vehicle} Vehicle
 */

const CarPage = () => {
  const { id } = useAppParams();
  const { vehicle, loading, error } = useVehicle(id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite(prev => !prev);
    console.log(isFavorite ? 'Удален из избранного' : 'Добавлен в избранного');
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      console.log('Ссылка скопирована:', url);
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const handleContact = () => {
    setContactVisible(true);
    console.log('Показать контакты продавца');
  };

  // Создаем хлебные крошки
  const breadcrumbItems = [
    {
      label: 'Автомобили',
      href: routes.catalog.path
    },
    {
      label: vehicle?.brand || 'Загрузка...',
      href: routes.catalog.path
    },
    {
      label: vehicle?.title || 'Загрузка...',
      href: null // Текущая страница
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-dark-surface">
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface dark:bg-dark-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            Ошибка загрузки
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
            {error}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-surface dark:bg-dark-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            Автомобиль не найден
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
            Автомобиль с ID {id} не найден
          </p>
          <Button 
            onClick={() => window.history.back()}
            variant="secondary"
          >
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <div className="container mx-auto px-4 py-6">
        {/* Хлебные крошки */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Изображения */}
          <div className="lg:col-span-2">
            <ImageGallery 
              images={vehicle.images} 
              alt={vehicle.title}
              className="mb-6"
            />

            {/* Описание и характеристики */}
            <div className="space-y-6">
              {/* Основная информация */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                  Основная информация
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary dark:text-dark-text-secondary">Бренд:</span>
                    <span className="ml-2 text-text-primary dark:text-dark-text-primary">{vehicle.brand}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary dark:text-dark-text-secondary">Модель:</span>
                    <span className="ml-2 text-text-primary dark:text-dark-text-primary">{vehicle.model}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary dark:text-dark-text-secondary">Год:</span>
                    <span className="ml-2 text-text-primary dark:text-dark-text-primary">{vehicle.year}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary dark:text-dark-text-secondary">Пробег:</span>
                    <span className="ml-2 text-text-primary dark:text-dark-text-primary">{vehicle.mileage.formatted}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary dark:text-dark-text-secondary">Тип топлива:</span>
                    <span className="ml-2 text-text-primary dark:text-dark-text-primary">{vehicle.fuel_type}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary dark:text-dark-text-secondary">Коробка передач:</span>
                    <span className="ml-2 text-text-primary dark:text-dark-text-primary">{vehicle.transmission}</span>
                  </div>
                </div>
              </Card>

              {/* Характеристики */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                  Технические характеристики
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(vehicle.specifications).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-text-secondary dark:text-dark-text-secondary">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="ml-2 text-text-primary dark:text-dark-text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Особенности */}
              {vehicle.features.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                    Особенности
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Правая колонка - Информация о продавце и цене */}
          <div className="space-y-6">
            {/* Цена и основные действия */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {vehicle.price.formatted}
                </div>
                {vehicle.price.negotiable && (
                  <Badge variant="success">Цена договорная</Badge>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                  onClick={handleContact}
                >
                  Связаться с продавцом
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full"
                  onClick={handleFavoriteToggle}
                >
                  {isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={handleShare}
                >
                  Поделиться
                </Button>
              </div>
            </Card>

            {/* Информация о продавце */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                Продавец
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-text-primary dark:text-dark-text-primary">
                    {vehicle.seller.name}
                  </div>
                  <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    {vehicle.seller.english_name}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Рейтинг:</span>
                  <Badge variant={vehicle.seller.rating >= 4.5 ? 'success' : 'warning'}>
                    ⭐ {vehicle.seller.rating}
                  </Badge>
                </div>
                
                <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  {vehicle.seller.reviews_count} отзывов
                </div>
                
                {vehicle.seller.certified && (
                  <Badge variant="primary">✓ Проверенный продавец</Badge>
                )}
              </div>

              {contactVisible && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-text-primary dark:text-dark-text-primary mb-2">
                      Контактная информация:
                    </div>
                    <div className="text-text-secondary dark:text-dark-text-secondary">
                      Телефон: {vehicle.seller.phone}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Местоположение */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                Местоположение
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-text-primary dark:text-dark-text-primary font-medium">
                  {vehicle.location.city}
                </div>
                <div className="text-text-secondary dark:text-dark-text-secondary">
                  {vehicle.location.region}
                </div>
                <div className="text-text-secondary dark:text-dark-text-secondary">
                  {vehicle.location.address}
                </div>
              </div>
            </Card>

            {/* История автомобиля */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                История автомобиля
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Без аварий:</span>
                  <Badge variant={vehicle.history.accident_free ? 'success' : 'warning'}>
                    {vehicle.history.accident_free ? '✓ Да' : '✗ Нет'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Владельцев:</span>
                  <span className="text-text-primary dark:text-dark-text-primary">
                    {vehicle.history.owners_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Тип:</span>
                  <span className="text-text-primary dark:text-dark-text-primary">
                    {vehicle.history.import_type === 'domestic' ? 'Местный' : 'Импортный'}
                  </span>
                </div>
                <div className="text-text-secondary dark:text-dark-text-secondary">
                  Гарантия: {vehicle.history.warranty}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarPage; 