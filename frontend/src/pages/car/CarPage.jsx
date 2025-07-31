import { useState, useEffect } from 'react';
import { useAppParams } from '../../shared/lib/navigation';
import { routes } from '../../shared/lib/navigation';
import { getVehicleById } from '../../shared/mocks/vehicleData';
import { ImageGallery, Card, Button, Badge, Loading, Breadcrumbs } from '../../shared/ui';

/**
 * @typedef {import('../../shared/types/vehicle').Vehicle} Vehicle
 */

const CarPage = () => {
  const { id } = useAppParams();
  const [vehicle, setVehicle] = useState(/** @type {Vehicle|null} */ (null));
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  // Загрузка данных автомобиля
  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      
      // Симуляция загрузки
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const vehicleData = getVehicleById(id);
      setVehicle(vehicleData);
      setLoading(false);
    };

    if (id) {
      loadVehicle();
    }
  }, [id]);

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
      href: routes.cars,
    },
    {
      label: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Загрузка...',
      active: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-dark-surface flex items-center justify-center">
        <Loading size="lg" text="Загрузка автомобиля..." />
      </div>
    );
  }

  if (!vehicle) {
    const errorBreadcrumbItems = [
      {
        label: 'Автомобили',
        href: routes.cars,
      },
      {
        label: 'Автомобиль не найден',
        active: true,
      },
    ];

    return (
      <div className="min-h-screen bg-surface dark:bg-dark-surface">
        <div className="container section-padding">
          <Breadcrumbs items={errorBreadcrumbItems} className="mb-6" />
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
              Автомобиль не найден
            </h1>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
              Автомобиль с ID #{id} не существует или был удален
            </p>
            <Button 
              variant="primary" 
              onClick={() => window.history.back()}
            >
              Вернуться назад
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface transition-colors">
    <div className="container section-padding">
        {/* Хлебные крошки */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Галерея и основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Галерея изображений */}
            <ImageGallery 
              images={vehicle.images}
              alt={vehicle.english_title || vehicle.title}
            />

            {/* Основная информация */}
            <Card>
              <div className="space-y-6">
                {/* Заголовок и цена */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">
                        {vehicle.english_title || vehicle.title}
                      </h1>
                      <div className="flex items-center gap-3 text-text-secondary dark:text-dark-text-secondary">
                        <span>{vehicle.year} год</span>
                        <span>•</span>
                        <span>{vehicle.mileage.formatted}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <LocationIcon className="w-4 h-4 mr-1" />
                          {vehicle.location.city}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleFavoriteToggle}
                        className="p-2"
                        title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                      >
                        <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleShare}
                        className="p-2"
                        title="Поделиться"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-4xl font-bold text-primary-600">
                        {vehicle.price.formatted}
                      </span>
                      {vehicle.price.negotiable && (
                        <span className="ml-2 text-text-muted dark:text-dark-text-muted">
                          (торг возможен)
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {vehicle.fuel_type === 'Electric' && (
                        <Badge variant="success">EV</Badge>
                      )}
                      {vehicle.history.accident_free && (
                        <Badge variant="success">Без аварий</Badge>
                      )}
                      {vehicle.seller.certified && (
                        <Badge variant="primary">Проверенный продавец</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Характеристики */}
                <div>
                  <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                    Основные характеристики
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SpecRow label="Год выпуска" value={vehicle.year} />
                    <SpecRow label="Пробег" value={vehicle.mileage.formatted} />
                    <SpecRow label="Тип двигателя" value={vehicle.engine} />
                    <SpecRow label="Коробка передач" value={vehicle.transmission} />
                    <SpecRow label="Тип топлива" value={vehicle.fuel_type} />
                    <SpecRow label="Цвет кузова" value={vehicle.specifications.color} />
                    
                    {vehicle.specifications.power && (
                      <SpecRow label="Мощность" value={vehicle.specifications.power} />
                    )}
                    {vehicle.specifications.range && (
                      <SpecRow label="Запас хода" value={vehicle.specifications.range} />
                    )}
                    {vehicle.specifications.acceleration && (
                      <SpecRow label="Разгон 0-100 км/ч" value={vehicle.specifications.acceleration} />
                    )}
                    {vehicle.specifications.battery_capacity && (
                      <SpecRow label="Емкость батареи" value={vehicle.specifications.battery_capacity} />
                    )}
                  </div>
                </div>

                {/* Особенности */}
                {vehicle.features && vehicle.features.length > 0 && (
                  <div>
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
                  </div>
                )}

                {/* История */}
                <div>
                  <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
                    История автомобиля
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SpecRow 
                      label="Количество владельцев" 
                      value={`${vehicle.history.owners_count} владелец${vehicle.history.owners_count > 1 ? 'а' : ''}`} 
                    />
                    <SpecRow 
                      label="Аварии" 
                      value={vehicle.history.accident_free ? 'Не было' : 'Были'} 
                    />
                    <SpecRow label="Тип ввоза" value={vehicle.history.import_type === 'domestic' ? 'Отечественный' : 'Импортный'} />
                    <SpecRow label="Гарантия" value={vehicle.history.warranty} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Правая колонка - Продавец и действия */}
          <div className="space-y-6">
            {/* Информация о продавце */}
            <Card>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                  Продавец
                </h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary dark:text-dark-text-primary">
                      {vehicle.seller.english_name}
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                      {vehicle.seller.type === 'dealer' ? 'Автосалон' : 'Частное лицо'}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <span className="ml-1 font-medium text-text-primary dark:text-dark-text-primary">
                      {vehicle.seller.rating}
                    </span>
                    <span className="ml-1 text-sm text-text-secondary dark:text-dark-text-secondary">
                      ({vehicle.seller.reviews_count} отзывов)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleContact}
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Связаться с продавцом
                  </Button>
                  
                  {contactVisible && (
                    <div className="p-3 bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg">
                      <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-2">
                        Телефон:
                      </p>
                      <p className="font-medium text-text-primary dark:text-dark-text-primary">
                        {vehicle.seller.phone}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => console.log('Написать сообщение')}
                  >
                    <MessageIcon className="w-5 h-5 mr-2" />
                    Написать сообщение
                  </Button>
                </div>
              </div>
            </Card>

            {/* Статистика */}
            <Card>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                  Статистика объявления
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary dark:text-dark-text-secondary">Дней в продаже:</span>
                    <span className="font-medium text-text-primary dark:text-dark-text-primary">
                      {vehicle.market_data.days_listed}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary dark:text-dark-text-secondary">Просмотров:</span>
                    <span className="font-medium text-text-primary dark:text-dark-text-primary">
                      {vehicle.market_data.views}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary dark:text-dark-text-secondary">Тренд цены:</span>
                    <span className={`font-medium ${
                      vehicle.market_data.price_trend === 'rising' ? 'text-red-600' :
                      vehicle.market_data.price_trend === 'declining' ? 'text-green-600' :
                      'text-text-primary dark:text-dark-text-primary'
                    }`}>
                      {vehicle.market_data.price_trend === 'rising' ? 'Растет' :
                       vehicle.market_data.price_trend === 'declining' ? 'Снижается' :
                       'Стабильна'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Местоположение */}
            <Card>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                  Местоположение
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <LocationIcon className="w-5 h-5 text-text-muted dark:text-dark-text-muted mr-2" />
                    <span className="text-text-primary dark:text-dark-text-primary">
                      {vehicle.location.city}, {vehicle.location.region}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary ml-7">
                    {vehicle.location.address}
                  </p>
                </div>
                
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => console.log('Показать на карте')}
                >
                  <MapIcon className="w-5 h-5 mr-2" />
                  Показать на карте
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для строки характеристики
const SpecRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border dark:border-dark-border last:border-b-0">
    <span className="text-text-secondary dark:text-dark-text-secondary">{label}:</span>
    <span className="font-medium text-text-primary dark:text-dark-text-primary text-right">{value}</span>
  </div>
);

// SVG иконки
const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
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

const PhoneIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MessageIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const MapIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

export { CarPage }; 