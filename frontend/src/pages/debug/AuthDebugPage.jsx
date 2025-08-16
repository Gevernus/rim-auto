/**
 * Страница отладки авторизации
 * Простая отладка с Telegram Debug Mode
 */

import { useState, useEffect } from 'react';
import { useTelegramAuth } from '../../features/auth';
import { Button } from '../../shared/ui';
import { enableDebugMode, disableDebugMode } from '../../shared/lib/platform/telegram';
import { getItemSync, removeItemSync } from '../../shared/lib/storage.js';
import { systemApi, imagesApi, debugApi, adminApi } from '../../shared/api/client.js';

export const AuthDebugPage = () => {
  const {
    isAuthenticated,
    user,
    telegramUser,
    isLoading,
    isTelegramWebApp,
    userName
  } = useTelegramAuth();

  const [telegramDebugMode, setTelegramDebugMode] = useState(
    typeof window !== 'undefined' && Boolean(getItemSync('telegram_debug_mode'))
  );

  // Состояния для панели разработчика
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [health, setHealth] = useState(null);
  const [imageStats, setImageStats] = useState(null);
  const [loadingImageStats, setLoadingImageStats] = useState(false);
  const [volumesStats, setVolumesStats] = useState(null);
  const [loadingVolumesStats, setLoadingVolumesStats] = useState(false);
  const [volumesApiAvailable, setVolumesApiAvailable] = useState(true);
  const [cacheRefreshProgress, setCacheRefreshProgress] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [customSelector, setCustomSelector] = useState('');
  const [customSelectorResult, setCustomSelectorResult] = useState(null);

  // Загрузка статуса системы
  const loadHealth = async () => {
    try {
      const response = await systemApi.getHealth();
      setHealth(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статуса системы:', error);
      setHealth({ 
        status: 'error', 
        message: 'API недоступен или произошла ошибка',
        error: error.message 
      });
    }
  };

  // Загрузка статистики изображений
  const loadImageStats = async () => {
    setLoadingImageStats(true);
    try {
      const response = await imagesApi.getStats();
      setImageStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики изображений:', error);
      setImageStats({ 
        status: 'error', 
        message: 'API недоступен или произошла ошибка',
        error: error.message 
      });
    } finally {
      setLoadingImageStats(false);
    }
  };

  // Загрузка статистики томов
  const loadVolumesStats = async () => {
    if (!volumesApiAvailable) return;
    
    setLoadingVolumesStats(true);
    try {
      const response = await adminApi.getVolumesStats();
      setVolumesStats(response.data);
      setVolumesApiAvailable(true);
    } catch (error) {
      console.error('Ошибка загрузки статистики томов:', error);
      
      // Пробуем fallback через прямой fetch
      try {
        const fallbackResponse = await fetch('/api/volumes/stats');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setVolumesStats(data);
          setVolumesApiAvailable(true);
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback также не сработал:', fallbackError);
      }
      
      // Если все попытки не удались, показываем ошибку
      setVolumesStats({ 
        status: 'error', 
        message: 'API volumes недоступен',
        error: 'Эндпоинт /api/volumes/stats не найден или недоступен',
        suggestion: 'Проверьте, что backend запущен и эндпоинт существует'
      });
      setVolumesApiAvailable(false);
    } finally {
      setLoadingVolumesStats(false);
    }
  };

  // Отключение API volumes
  const disableVolumesApi = () => {
    setVolumesApiAvailable(false);
    setVolumesStats(null);
  };

  // Очистка изображений
  const handleCleanupImages = async () => {
    if (!confirm('Вы уверены, что хотите очистить все изображения?')) return;
    
    try {
      await imagesApi.cleanup();
      alert('Изображения очищены');
      loadImageStats();
      if (volumesApiAvailable) {
        loadVolumesStats();
      }
    } catch (error) {
      console.error('Ошибка очистки изображений:', error);
      alert('Ошибка очистки изображений');
    }
  };

  // Очистка договоров
  const handleCleanupContracts = async () => {
    if (!confirm('Вы уверены, что хотите очистить все договоры?')) return;
    
    try {
      const response = await fetch('/api/contracts/cleanup', { method: 'POST' });
      if (response.ok) {
        alert('Договоры очищены');
        loadVolumesStats();
      } else {
        console.error('Ошибка очистки договоров:', response.status, response.statusText);
        alert('Ошибка очистки договоров');
      }
    } catch (error) {
      console.error('Ошибка очистки договоров:', error);
      alert('Ошибка очистки договоров');
    }
  };

  // Обновление кэша
  const handleRefreshCache = async () => {
    if (!confirm('Это может занять до 5 минут. Продолжить?')) return;
    
    setCacheRefreshProgress({ status: 'starting', message: 'Запуск обновления кэша...' });
    
    try {
      await adminApi.refreshCache();
      setCacheRefreshProgress({ status: 'success', message: 'Кэш успешно обновлен' });
      // Обновляем статистику после успешного обновления кэша
      loadImageStats();
      if (volumesApiAvailable) {
        loadVolumesStats();
      }
      setTimeout(() => setCacheRefreshProgress(null), 5000);
    } catch (error) {
      console.error('Ошибка обновления кэша:', error);
      setCacheRefreshProgress({ status: 'error', message: 'Ошибка обновления кэша' });
    }
  };

  // Отмена обновления кэша
  const handleCancelRefresh = async () => {
    try {
      // В backend нет эндпоинта для отмены, просто обновляем статус
      setCacheRefreshProgress({ status: 'cancelled', message: 'Обновление отменено' });
      setTimeout(() => setCacheRefreshProgress(null), 3000);
    } catch (error) {
      console.error('Ошибка отмены обновления:', error);
    }
  };

  // Тестирование селекторов
  const handleTestSelectors = async () => {
    try {
      const response = await debugApi.testSelectors();
      setDebugInfo(response.data);
    } catch (error) {
      console.error('Ошибка тестирования селекторов:', error);
      alert('Ошибка тестирования селекторов');
    }
  };

  // Просмотр исходного кода страницы
  const handleViewPageSource = async () => {
    try {
      const response = await debugApi.getPageSource();
      // Создаем текстовый файл для скачивания
      const blob = new Blob([response.data.content || 'HTML не найден'], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'page-source.html';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка получения исходного кода:', error);
      alert('Ошибка получения исходного кода');
    }
  };

  // Тестирование пользовательского селектора
  const handleTestCustomSelector = async () => {
    if (!customSelector.trim()) return;
    
    try {
      const response = await debugApi.testCustomSelector(customSelector);
      setCustomSelectorResult(response.data);
    } catch (error) {
      console.error('Ошибка тестирования селектора:', error);
      alert('Ошибка тестирования селектора');
    }
  };

  // Загрузка данных при открытии панели разработчика
  useEffect(() => {
    if (showDevPanel) {
      loadHealth();
      loadImageStats();
      loadVolumesStats();
    }
  }, [showDevPanel]);

  const toggleTelegramDebug = () => {
    if (telegramDebugMode) {
      disableDebugMode();
      setTelegramDebugMode(false);
      alert('Telegram Debug Mode выключен.\nПерезагрузите страницу для применения изменений.');
    } else {
      enableDebugMode();
      setTelegramDebugMode(true);
      alert('Telegram Debug Mode включен.\nПерезагрузите страницу для применения изменений.');
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text-primary dark:text-dark-text-primary">
          🔧 Отладка авторизации
        </h1>

        {/* Статус */}
        <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 mb-6 border border-border dark:border-dark-border">
          <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-dark-text-primary">
            Текущий статус
          </h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Авторизован:</span>
              <p className={`font-bold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? 'Да' : 'Нет'}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Telegram WebApp (симуляция в debug):</span>
              <p className={`font-bold ${isTelegramWebApp ? 'text-blue-600' : 'text-gray-600'}`}>
                {isTelegramWebApp ? 'Да' : 'Нет'}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Telegram Debug:</span>
              <p className={`font-bold ${telegramDebugMode ? 'text-orange-600' : 'text-gray-600'}`}>
                {telegramDebugMode ? 'Включен' : 'Выключен'}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Пользователь:</span>
              <p className="font-bold text-text-primary dark:text-dark-text-primary">
                {userName || 'Не найден'}
              </p>
            </div>
          </div>
          
          {/* Информация */}
          {telegramDebugMode && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Debug режим:</strong> подставляем тестовые данные Telegram (initData, user). Токен всегда получаем с backend.
              </p>
            </div>
          )}

          {/* Токен */}
          {isAuthenticated && (
            <div className="mt-4 p-3 bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg border border-border dark:border-dark-border">
              <details>
                <summary className="text-xs text-text-secondary dark:text-dark-text-secondary cursor-pointer">
                  Показать текущий токен
                </summary>
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono break-all">
                  {getItemSync('authToken') || 'Токен не найден'}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Управление */}
        <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 mb-6 border border-border dark:border-dark-border">
          <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-dark-text-primary">
            Управление
          </h2>
          
          <div className="flex gap-4">
            <Button 
              onClick={toggleTelegramDebug} 
              variant={telegramDebugMode ? "outline" : "primary"}
            >
              {telegramDebugMode ? 'Выключить Telegram Debug' : 'Включить Telegram Debug'}
            </Button>
            
            {telegramDebugMode !== Boolean(getItemSync('telegram_debug_mode')) && (
              <Button onClick={reloadPage} variant="outline">
                Перезагрузить страницу
              </Button>
            )}
            
            <Button 
              onClick={() => {
                removeItemSync('authToken');
                removeItemSync('telegramInitData');
                window.location.reload();
              }} 
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Очистить токены
            </Button>
          </div>
        </div>

        {/* Панель разработчика */}
        <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 mb-6 border border-border dark:border-dark-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
              Панель разработчика
            </h2>
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-primary-600 transition-colors"
            >
              {showDevPanel ? '🔽 Скрыть панель разработчика' : '🔧 Показать панель разработчика'}
            </button>
          </div>
          
          {showDevPanel && (
            <div className="space-y-4">
              {/* Статус системы */}
              {health && (
                <div className={`p-4 rounded-lg ${
                  health.status === 'error' 
                    ? 'bg-red-50 dark:bg-red-900' 
                    : 'bg-green-50 dark:bg-green-900'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    health.status === 'error'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-green-800 dark:text-green-200'
                  }`}>
                    Статус системы:
                  </h3>
                  <div className={`text-sm ${
                    health.status === 'error'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {health.status === 'error' ? (
                      <>
                        <p><strong>Ошибка:</strong> {health.message}</p>
                        <p><strong>Детали:</strong> {health.error}</p>
                      </>
                    ) : (
                      <>
                        <p>MongoDB: {health.services?.mongodb || 'Неизвестно'}</p>
                        <p>Selenium: {health.services?.selenium || 'Неизвестно'}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Статистика изображений */}
              {imageStats && (
                <div className={`p-4 rounded-lg ${
                  imageStats.status === 'error' 
                    ? 'bg-red-50 dark:bg-red-900' 
                    : 'bg-blue-50 dark:bg-blue-900'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold mb-2 ${
                        imageStats.status === 'error'
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-blue-800 dark:text-blue-200'
                      }`}>
                        Статистика изображений:
                      </h3>
                      <div className={`text-sm ${
                        imageStats.status === 'error'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                        {imageStats.status === 'error' ? (
                          <>
                            <p><strong>Ошибка:</strong> {imageStats.message}</p>
                            <p><strong>Детали:</strong> {imageStats.error}</p>
                          </>
                        ) : (
                          <>
                            <p>Всего изображений: {imageStats.total_images}</p>
                            <p>Размер: {imageStats.total_size_mb} MB</p>
                            <p>Статус: {imageStats.status}</p>
                          </>
                        )}
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
                      {imageStats.status !== 'error' && (
                        <button
                          onClick={handleCleanupImages}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Очистить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Статистика томов */}
              {volumesApiAvailable && (
                <div className={`p-4 rounded-lg ${
                  volumesStats?.status === 'error' 
                    ? 'bg-red-50 dark:bg-red-900' 
                    : 'bg-purple-50 dark:bg-purple-900'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold mb-2 ${
                        volumesStats?.status === 'error'
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-purple-800 dark:text-purple-200'
                      }`}>
                        Статистика томов:
                      </h3>
                      <div className={`text-sm ${
                        volumesStats?.status === 'error'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-purple-700 dark:text-purple-300'
                      }`}>
                        {!volumesStats ? (
                          <p>Загрузка статистики...</p>
                        ) : volumesStats.status === 'error' ? (
                          <>
                            <p><strong>Ошибка:</strong> {volumesStats.message}</p>
                            <p><strong>Детали:</strong> {volumesStats.error}</p>
                            {volumesStats.suggestion && (
                              <p><strong>Совет:</strong> {volumesStats.suggestion}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p>Изображения: {volumesStats.volumes?.images?.files || 0} файлов, {volumesStats.volumes?.images?.size_mb || 0} MB</p>
                            <p>Договоры: {volumesStats.volumes?.contracts?.files || 0} файлов, {volumesStats.volumes?.contracts?.size_mb || 0} MB</p>
                            <p>Статус: {volumesStats.status}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={loadVolumesStats}
                        disabled={loadingVolumesStats}
                        className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
                      >
                        {loadingVolumesStats ? 'Загрузка...' : 'Обновить'}
                      </button>
                      {volumesStats && volumesStats.status !== 'error' && (
                        <button
                          onClick={handleCleanupContracts}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Очистить договоры
                        </button>
                      )}
                      <button
                        onClick={disableVolumesApi}
                        className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                        title="Отключить API volumes если он недоступен"
                      >
                        Отключить
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Информация о недоступности API volumes */}
              {!volumesApiAvailable && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        API Volumes отключен
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Эндпоинт /api/volumes/stats недоступен. Возможно, backend не запущен или эндпоинт не существует.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setVolumesApiAvailable(true);
                        loadVolumesStats();
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Попробовать снова
                    </button>
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
                    disabled={isLoading || cacheRefreshProgress?.status === 'starting'}
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

        {/* Данные пользователя */}
        {(user || telegramUser) && (
          <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 border border-border dark:border-dark-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-dark-text-primary">
              Данные пользователя
            </h2>
            
            <div className="space-y-4">
              {user && (
                <div>
                  <h3 className="font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
                    Пользователь (БД):
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
              
              {telegramUser && (
                <div>
                  <h3 className="font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
                    Telegram пользователь:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(telegramUser, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 