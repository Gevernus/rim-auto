import { useState, useEffect } from 'react';
import { CarGrid } from '../../widgets/car-grid';
import { useCars } from '../../shared/hooks/useCars';
import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { VehicleFilters } from '../../features/car-catalog';
import { CitySelector, DeliveryInfo } from '../../features/delivery';
import { Pagination } from '../../shared/ui';
import { MobileTopNav } from '../../widgets/nav';
import { VideoCarousel, VideoPlayer } from '../../shared/ui';
import primeWrapVideo from '../../assets/home/video_12.mp4';
import primeWrapVideo2 from '../../assets/home/video_2.mp4';
import primeWrap from '../../assets/detailing/primeWrap.jpg';

const CatalogPage = () => {
  const { vehicles, loading, error, pagination, filterCars } = useCars();
  const { navigateTo } = useAppNavigation();
  const [favoriteVehicleIds, setFavoriteVehicleIds] = useState([]);
  const [selectedDeliveryCity, setSelectedDeliveryCity] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({}); // Сохраняем текущие фильтры

  // Отладочная информация
  useEffect(() => {
    if (vehicles.length > 0) {
      console.log('📋 Доступные автомобили в каталоге:', vehicles.map(v => ({
        id: v.id,
        title: v.title,
        english_title: v.english_title
      })));
    }
  }, [vehicles]);

  const service = {
    title: 'Prime Wrap',
    videos: [primeWrapVideo, primeWrapVideo2],
  };

  // Обработчик ошибок видео
  const handleVideoError = (videoIndex, errorData) => {
    console.warn(`Video error in catalog at index ${videoIndex}:`, errorData);
    // Можно добавить логику для замены поврежденного видео
  };

  // Fallback контент для поврежденных видео
  const renderVideoFallback = (item) => (
    <div className="aspect-video bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg flex items-center justify-center">
      <div className="text-center text-text-secondary p-4">
        <p className="mb-2 font-medium">Видео недоступно</p>
        <p className="text-sm mb-3">Попробуйте другое видео</p>
        {item.poster && (
          <img 
            src={item.poster} 
            alt={item.title || 'Poster'} 
            className="max-w-full max-h-32 object-contain rounded"
          />
        )}
      </div>
    </div>
  );

  // Обработчик изменения фильтров
  const handleFiltersChange = (filters) => {
    // Используем фильтры напрямую из VehicleFilters
    // Фильтр стран работает для UI и расчета доставки, но не влияет на API фильтрацию
    console.log('🔍 Получены фильтры от VehicleFilters:', filters);
    
    // Сохраняем текущие фильтры для пагинации
    setCurrentFilters(filters);
    filterCars(filters);
  };

  // Обработчик изменения страницы
  const handlePageChange = (page) => {
    const filtersWithPage = {
      ...currentFilters,
      page: page
    };
    
    console.log('📄 Переход на страницу:', page, 'с фильтрами:', filtersWithPage);
    filterCars(filtersWithPage);
  };

  // Обработчик клика на автомобиль
  const handleVehicleClick = (vehicle) => {
    console.log('🚗 Клик на автомобиль:', {
      id: vehicle.id,
      title: vehicle.title,
      english_title: vehicle.english_title
    });
    navigateTo(routes.car(vehicle.id));
  };

  // Обработчик добавления/удаления из избранного
  const handleFavoriteToggle = (vehicle) => {
    setFavoriteVehicleIds(prev => {
      if (prev.includes(vehicle.id)) {
        return prev.filter(id => id !== vehicle.id);
      } else {
        return [...prev, vehicle.id];
      }
    });
  };

  // Обработчик выбора города доставки
  const handleDeliveryCitySelect = (city) => {
    setSelectedDeliveryCity(city);
  };

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
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface transition-colors">
      {/* Мобильная навигация под шапкой (стиль дром) */}
      <MobileTopNav />

      <div className="container section-padding">
        {/* Заголовок и информация о доставке */}
        <div className="mb-8">
          <div className="">
              {/* <h1 className=" text-2xl m:text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
			  Автомобили под заказ.
              </h1> */}
            {/* <div>
              <p className="text-text-secondary dark:text-dark-text-secondary">
                Найдено {pagination.total} автомобилей
              </p>
            </div> */}
			{/* Видео */}
        	{/* Видео */}
        	{(service.videos?.length > 0) && (
        	  <div className="mb-8 max-w-5xl mx-auto">
        	    {service.videos?.length > 0 ? (
        	      <VideoCarousel
        	        items={service.videos.map((src) => ({ src, poster: primeWrap, title: service.title }))}
        	        autoPlayActive={true}
        	        muted={true}
        	        onVideoError={handleVideoError}
        	        fallbackContent={renderVideoFallback}
        	        autoAdvance={true}
        	        showNavigation={true}
        	        showPagination={true}
        	        className="catalog-video-carousel"
        	      />
        	    ) : (
        	      <VideoPlayer
        	        src={service.video}
        	        poster={primeWrap}
        	        title={service.title}
        	        onError={handleVideoError}
        	        fallbackContent={renderVideoFallback}
        	      />
        	    )}
        	  </div>
        	)}
            
            {/* Выбор города доставки */}
            <div className="lg:w-96">
              <CitySelector 
                onCitySelect={handleDeliveryCitySelect}
                selectedCity={selectedDeliveryCity}
              />
            </div>
          </div>


        </div>

        {/* Фильтры в верхней части */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <VehicleFilters className="flex-2/3"
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
          {/* Информация о доставке */}
          {selectedDeliveryCity && (
            <div className="flex-1/3">
              <DeliveryInfo city={selectedDeliveryCity} filters={currentFilters} />
            </div>
          )}
        </div>

        {/* Основной контент с карточками */}
        <div className="mb-8">
          <CarGrid
            vehicles={vehicles}
            loading={loading}
            favoriteVehicleIds={favoriteVehicleIds}
            onVehicleClick={handleVehicleClick}
            onFavoriteToggle={handleFavoriteToggle}
            selectedDeliveryCity={selectedDeliveryCity}
          />
        </div>

        {/* Пагинация */}
        {pagination.total > pagination.page_size && (
          <div className="flex flex-col items-center gap-4">
            {/* Информация о результатах */}
            <div className="text-center">
              <p className="text-text-secondary dark:text-dark-text-secondary">
                Показано {((pagination.page - 1) * pagination.page_size) + 1}-{Math.min(pagination.page * pagination.page_size, pagination.total)} из {pagination.total} автомобилей
              </p>
            </div>
            
            {/* Кнопки пагинации */}
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.page_size)}
              onPageChange={handlePageChange}
              loading={loading}
              className="mb-4"
            />
          </div>
        )}
      </div>
      

    </div>
  );
};

export default CatalogPage; 