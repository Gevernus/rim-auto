import { useState, useEffect } from 'react';
import { CarGrid } from '../../widgets/car-grid';
import { useCars, useSystemHealth } from '../../shared/hooks/useCars';
import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { VehicleFilters } from '../../features/car-catalog';
import { CitySelector, DeliveryInfo } from '../../features/delivery';
import { Pagination } from '../../shared/ui';
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
  const [currentFilters, setCurrentFilters] = useState({}); // Сохраняем текущие фильтры
  const [cacheRefreshProgress, setCacheRefreshProgress] = useState(null); // Прогресс обновления кэша
  const [abortController, setAbortController] = useState(null); // Контроллер для отмены операции
  const [customSelector, setCustomSelector] = useState(''); // Пользовательский селектор
  const [customSelectorResult, setCustomSelectorResult] = useState(null); // Результат пользовательского селектора
  const [pageSourceData, setPageSourceData] = useState(null); // Данные HTML источника
  const [showPageSourceModal, setShowPageSourceModal] = useState(false); // Показать модальное окно с HTML
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
        setPageSourceData(response.data);
        setShowPageSourceModal(true);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert('Ошибка получения HTML: ' + err.message);
    }
  };

  // Обновление кэша с перезагрузкой статистики
  const handleRefreshCache = async () => {
    if (!confirm('Вы уверены что хотите обновить кэш? Это может занять несколько минут.')) return;
    
    // Создаем новый AbortController
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      setCacheRefreshProgress({
        status: 'starting',
        message: 'Начинаем обновление кэша...'
      });
      
      // Запускаем обновление кэша с возможностью отмены
      await refreshCache(controller.signal);
      
      setCacheRefreshProgress({
        status: 'success',
        message: 'Кэш успешно обновлен!'
      });
      
      // Обновляем статистику изображений через 3 секунды
      setTimeout(() => {
        loadImageStats();
        setCacheRefreshProgress(null);
        setAbortController(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error refreshing cache:', err);
      
      // Проверяем, была ли операция отменена
      if (err.name === 'AbortError') {
        setCacheRefreshProgress({
          status: 'cancelled',
          message: 'Операция была отменена'
        });
        setTimeout(() => {
          setCacheRefreshProgress(null);
          setAbortController(null);
        }, 3000);
        return;
      }
      
      let errorMessage = 'Ошибка обновления кэша';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Операция превысила время ожидания (5 минут). Возможно, сервер перегружен.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Ошибка сервера при обновлении кэша';
      } else if (err.response?.status === 503) {
        errorMessage = 'Сервис временно недоступен';
      } else if (err.message) {
        errorMessage = `Ошибка: ${err.message}`;
      }
      
      setCacheRefreshProgress({
        status: 'error',
        message: errorMessage
      });
      
      // Сбрасываем ошибку через 10 секунд
      setTimeout(() => {
        setCacheRefreshProgress(null);
        setAbortController(null);
      }, 10000);
    }
  };

  // Отмена операции обновления кэша
  const handleCancelRefresh = () => {
    if (abortController) {
      abortController.abort();
      setCacheRefreshProgress({
        status: 'cancelling',
        message: 'Отмена операции...'
      });
    }
  };

  // Тестирование пользовательского селектора
  const handleTestCustomSelector = async () => {
    if (!customSelector.trim()) return;
    
    try {
      const response = await debugApi.testCustomSelector(customSelector);
      setCustomSelectorResult(response.data);
    } catch (err) {
      alert('Ошибка тестирования селектора: ' + err.message);
    }
  };

  useEffect(() => {
    loadImageStats();
  }, []);

  // Очистка AbortController при размонтировании
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

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

  // Обработчик изменения фильтров
  const handleFiltersChange = (filters) => {
    // Используем фильтры напрямую из VehicleFilters
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
                      {cacheRefreshProgress && (
                        <div className="mt-2">
                          <div className={`text-sm font-medium ${
                            cacheRefreshProgress.status === 'error' 
                              ? 'text-red-600 dark:text-red-400' 
                              : cacheRefreshProgress.status === 'success'
                              ? 'text-green-600 dark:text-green-400'
                              : cacheRefreshProgress.status === 'cancelled'
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {cacheRefreshProgress.message}
                          </div>
                          {cacheRefreshProgress.status === 'starting' && (
                            <div className="mt-2">
                              <div className="w-full bg-yellow-200 dark:bg-yellow-700 rounded-full h-2">
                                <div className="bg-yellow-600 dark:bg-yellow-400 h-2 rounded-full animate-pulse"></div>
                              </div>
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                Операция может занять до 5 минут...
                              </p>
                              <button
                                onClick={handleCancelRefresh}
                                className="mt-2 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                              >
                                Отменить
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleRefreshCache}
                      disabled={loading || cacheRefreshProgress?.status === 'starting'}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cacheRefreshProgress?.status === 'starting' ? 'Обновление...' : 'Обновить кэш'}
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
                  
                  {/* Тестирование пользовательского селектора */}
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900 rounded">
                    <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Тестирование пользовательского селектора:</h5>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={customSelector}
                        onChange={(e) => setCustomSelector(e.target.value)}
                        placeholder="Введите CSS селектор (например: li.cxc-card)"
                        className="flex-1 px-3 py-1 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-purple-800 text-purple-900 dark:text-purple-100"
                      />
                      <button
                        onClick={handleTestCustomSelector}
                        disabled={!customSelector.trim()}
                        className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
                      >
                        Тест
                      </button>
                    </div>
                    
                    {/* Результат пользовательского селектора */}
                    {customSelectorResult && (
                      <div className="mt-3 p-2 bg-purple-200 dark:bg-purple-700 rounded">
                        <h6 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                          Результат: {customSelectorResult.selector}
                        </h6>
                        <div className="text-xs space-y-1">
                          <p><strong>Найдено элементов:</strong> {customSelectorResult.analysis.count}</p>
                          {customSelectorResult.analysis.count > 0 && (
                            <>
                              <p><strong>ID образцов:</strong> {customSelectorResult.analysis.sample_ids.slice(0, 3).join(', ')}</p>
                              <p><strong>Классы образцов:</strong></p>
                              <div className="max-h-20 overflow-y-auto">
                                {customSelectorResult.analysis.sample_classes.slice(0, 3).map((classes, idx) => (
                                  <div key={idx} className="text-xs bg-purple-300 dark:bg-purple-600 px-1 rounded mb-1">
                                    {classes.join(', ')}
                                  </div>
                                ))}
                              </div>
                              <p><strong>Текст образцов:</strong></p>
                              <div className="max-h-20 overflow-y-auto">
                                {customSelectorResult.analysis.sample_text.slice(0, 3).map((text, idx) => (
                                  <div key={idx} className="text-xs bg-purple-300 dark:bg-purple-600 px-1 rounded mb-1">
                                    {text.substring(0, 100)}...
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {debugInfo && (
                    <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-800 rounded">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Результаты тестирования:</h4>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        <p><strong>Статус:</strong> {debugInfo.status}</p>
                        
                        {/* Анализ карточек */}
                        {debugInfo.card_analysis && (
                          <div className="mt-3 p-2 bg-purple-200 dark:bg-purple-700 rounded">
                            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Анализ карточек автомобилей:</h5>
                            <div className="text-xs space-y-1">
                              <p><strong>Найдено карточек:</strong> {debugInfo.card_analysis.total_cards}</p>
                              <p><strong>ID образца:</strong> {debugInfo.card_analysis.sample_id}</p>
                              <p><strong>Классы образца:</strong> {debugInfo.card_analysis.sample_classes?.join(', ')}</p>
                              <p><strong>Содержит ссылку:</strong> {debugInfo.card_analysis.has_link ? '✅' : '❌'}</p>
                              <p><strong>Содержит изображение:</strong> {debugInfo.card_analysis.has_image ? '✅' : '❌'}</p>
                              <p><strong>Содержит цену:</strong> {debugInfo.card_analysis.has_price ? '✅' : '❌'}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Результаты селекторов */}
                        {debugInfo.selector_results && (
                          <div className="mt-3">
                            <p><strong>Результаты селекторов:</strong></p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {Object.entries(debugInfo.selector_results).map(([selector, result]) => (
                                <div key={selector} className="flex items-center justify-between">
                                  <code className="text-xs bg-purple-200 dark:bg-purple-700 px-1 rounded flex-1 mr-2">
                                    {selector}
                                  </code>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    result.count > 0 
                                      ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200' 
                                      : 'bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200'
                                  }`}>
                                    {result.count} элементов
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Интересные классы */}
                        {debugInfo.interesting_classes && debugInfo.interesting_classes.length > 0 && (
                          <div className="mt-3">
                            <p><strong>Интересные классы ({debugInfo.interesting_classes.length}):</strong></p>
                            <div className="text-xs max-h-20 overflow-y-auto">
                              {debugInfo.interesting_classes.slice(0, 15).join(', ')}
                              {debugInfo.interesting_classes.length > 15 && '...'}
                            </div>
                          </div>
                        )}
                        
                        {/* Общая статистика */}
                        <div className="mt-3 text-xs">
                          <p><strong>Всего div/li элементов:</strong> {debugInfo.total_divs}</p>
                        </div>
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
      
      {/* Модальное окно для отображения HTML источника */}
      {showPageSourceModal && pageSourceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
            {/* Заголовок модального окна */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                HTML Source Debug ({pageSourceData.full_length} chars total)
              </h3>
              <button
                onClick={() => setShowPageSourceModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Содержимое модального окна */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto p-4">
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {pageSourceData.content}
                </pre>
              </div>
            </div>
            
            {/* Футер модального окна */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>Показано первые {pageSourceData.content.length} символов из {pageSourceData.full_length}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pageSourceData.content);
                    alert('HTML скопирован в буфер обмена');
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                  Копировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage; 