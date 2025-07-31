import { useState, useEffect } from 'react';
import { CarGrid } from '../../widgets/car-grid';
import { useCars, useSystemHealth } from '../../shared/hooks/useCars';
import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { VehicleFilters } from '../../features/car-catalog';
import { CitySelector, DeliveryInfo } from '../../features/delivery';
import { imagesApi, debugApi } from '../../shared/api/client.js';

const CatalogPage = () => {
  const { vehicles, loading, error, pagination, filterCars, refreshCache } = useCars();
  const { health } = useSystemHealth();
  const [favoriteVehicleIds, setFavoriteVehicleIds] = useState([]);
  const [selectedDeliveryCity, setSelectedDeliveryCity] = useState(null);
  const [imageStats, setImageStats] = useState(null);
  const [loadingImageStats, setLoadingImageStats] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { navigateTo } = useAppNavigation();

  // Загружаем статистику изображений
  const loadImageStats = async () => {
    try {
      setLoadingImageStats(true);
      const response = await imagesApi.getStats();
      setImageStats(response.data);
    } catch (err) {
      console.error('Error loading image stats:', err);
    } finally {
      setLoadingImageStats(false);
    }
  };

  // Очистка изображений
  const handleCleanupImages = async () => {
    if (!confirm('Вы уверены что хотите удалить все изображения?')) return;
    
    try {
      const response = await imagesApi.cleanup();
      alert(response.data.message);
      loadImageStats(); // Обновляем статистику
    } catch (err) {
      alert('Ошибка очистки: ' + err.message);
    }
  };

  // Отладка парсинга
  const handleTestSelectors = async () => {
    try {
      const response = await debugApi.testSelectors();
      setDebugInfo(response.data);
      console.log('Selector test results:', response.data);
    } catch (err) {
      alert('Ошибка тестирования селекторов: ' + err.message);
    }
  };

  const handleViewPageSource = async () => {
    try {
      const response = await debugApi.getPageSource();
      if (response.data.status === 'ok') {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head><title>Page Source Debug</title></head>
            <body>
              <h2>HTML Source (${response.data.full_length} chars total, showing first 50KB)</h2>
              <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${response.data.content}</pre>
            </body>
          </html>
        `);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert('Ошибка получения HTML: ' + err.message);
    }
  };

  // Обновление кэша с перезагрузкой статистики
  const handleRefreshCache = () => {
    refreshCache();
    setTimeout(loadImageStats, 3000); // Обновляем статистику после парсинга
  };

  useEffect(() => {
    loadImageStats();
  }, []);

  // Обработчик изменения фильтров
  const handleFiltersChange = (filters) => {
    // Преобразуем frontend фильтры в backend параметры
    const backendFilters = {
      page: 1, // Сбрасываем страницу при изменении фильтров
      page_size: 12
    };

    // Добавляем фильтры если они заданы
    if (filters.brand) {
      backendFilters.title = filters.brand;
    }
    
    if (filters.priceRange?.from) {
      backendFilters.price_from = filters.priceRange.from / 10000; // Конвертируем в 万
    }
    
    if (filters.priceRange?.to) {
      backendFilters.price_to = filters.priceRange.to / 10000; // Конвертируем в 万
    }

    filterCars(backendFilters);
  };

  // Обработчик клика на автомобиль
  const handleVehicleClick = (vehicleId) => {
    navigateTo(routes.car.path.replace(':id', vehicleId));
  };

  // Обработчик добавления/удаления из избранного
  const handleFavoriteToggle = (vehicleId) => {
    setFavoriteVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
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
      <div className="container section-padding">
        {/* Заголовок и информация о доставке */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
                Каталог автомобилей из Китая
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary">
                Найдено {pagination.total} автомобилей
              </p>
            </div>
            
            {/* Выбор города доставки */}
            <div className="lg:w-96">
              <CitySelector 
                onCitySelect={handleDeliveryCitySelect}
                selectedCity={selectedDeliveryCity}
              />
            </div>
          </div>

          {/* Панель разработчика */}
          <div className="mt-6">
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="text-xs text-text-secondary dark:text-dark-text-secondary hover:text-primary-600 transition-colors"
            >
              {showDevPanel ? '🔽 Скрыть панель разработчика' : '🔧 Показать панель разработчика'}
            </button>
            
            {showDevPanel && (
              <div className="mt-4 space-y-4">
                {/* Статус системы */}
                {health && (
                  <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Статус системы:</h3>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p>MongoDB: {health.services?.mongodb || 'Неизвестно'}</p>
                      <p>Selenium: {health.services?.selenium || 'Неизвестно'}</p>
                    </div>
                  </div>
                )}

                {/* Статистика изображений */}
                {imageStats && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Статистика изображений:</h3>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <p>Всего изображений: {imageStats.total_images}</p>
                          <p>Размер: {imageStats.total_size_mb} MB</p>
                          <p>Статус: {imageStats.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={loadImageStats}
                          disabled={loadingImageStats}
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {loadingImageStats ? 'Загрузка...' : 'Обновить'}
                        </button>
                        <button
                          onClick={handleCleanupImages}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Очистить
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Управление кэшем */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Управление данными:</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Перепарсить автомобили и скачать новые изображения
                      </p>
                    </div>
                    <button
                      onClick={handleRefreshCache}
                      disabled={loading}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Парсинг...' : 'Обновить кэш'}
                    </button>
                  </div>
                </div>

                {/* Отладка парсинга */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Отладка парсинга:</h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                        Инструменты для диагностики проблем с парсингом che168.com
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleTestSelectors}
                        className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        Тест селекторов
                      </button>
                      <button
                        onClick={handleViewPageSource}
                        className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        Просмотр HTML
                      </button>
                    </div>
                  </div>
                  
                  {debugInfo && (
                    <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-800 rounded">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Результаты тестирования:</h4>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        <p><strong>Статус:</strong> {debugInfo.status}</p>
                        {debugInfo.selector_results && (
                          <div className="mt-2">
                            <p><strong>Результаты селекторов:</strong></p>
                            <div className="max-h-40 overflow-y-auto">
                              {Object.entries(debugInfo.selector_results).map(([selector, result]) => (
                                <div key={selector} className="mt-1">
                                  <code className="text-xs bg-purple-200 dark:bg-purple-700 px-1 rounded">
                                    {selector}
                                  </code>
                                  : {result.count} элементов
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {debugInfo.interesting_classes && debugInfo.interesting_classes.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Интересные классы:</strong></p>
                            <div className="text-xs">
                              {debugInfo.interesting_classes.slice(0, 10).join(', ')}
                              {debugInfo.interesting_classes.length > 10 && '...'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
				<DeliveryInfo city={selectedDeliveryCity} />
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
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary dark:text-dark-text-secondary">
                Страница {pagination.page} из {Math.ceil(pagination.total / pagination.page_size)}
              </span>
              {/* TODO: Добавить кнопки пагинации когда backend поддержит их */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage; 