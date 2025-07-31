import React, { useState } from 'react';
import { useCars, useSystemHealth } from '../../shared/hooks/useCars.js';

const TestApiPage = () => {
  const { cars, loading, error, pagination, refreshCache, searchCars } = useCars();
  const { health, loading: healthLoading } = useSystemHealth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    searchCars(searchQuery);
  };

  const handleRefresh = () => {
    refreshCache();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-dark-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-text-primary dark:text-dark-text-primary">Загрузка автомобилей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            Тест API - Рим Авто
          </h1>
          
          {/* Статус системы */}
          {health && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Статус системы:</h3>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p>MongoDB: {health.services?.mongodb || 'Неизвестно'}</p>
                <p>Selenium: {health.services?.selenium || 'Неизвестно'}</p>
              </div>
            </div>
          )}

          {/* Поиск и управление */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск автомобилей..."
                  className="flex-1 px-4 py-2 border border-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Поиск
                </button>
              </div>
            </form>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-6 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Обновление...' : 'Обновить кэш'}
            </button>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <p className="text-red-800 dark:text-red-200">Ошибка: {error}</p>
          </div>
        )}

        {/* Список автомобилей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Изображение */}
              {car.image_url && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={car.image_url}
                    alt={car.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Нет+фото';
                    }}
                  />
                </div>
              )}
              
              {/* Информация */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-text-primary dark:text-dark-text-primary mb-2 line-clamp-2">
                  {car.title}
                </h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {car.price}
                  </span>
                  
                  {car.volume && (
                    <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
                      {car.volume}L
                    </span>
                  )}
                </div>
                
                {car.brandName && (
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-2">
                    {car.brandName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Пагинация */}
        {pagination.total > 0 && (
          <div className="mt-8 text-center">
            <p className="text-text-secondary dark:text-dark-text-secondary">
              Показано {cars.length} из {pagination.total} автомобилей
            </p>
          </div>
        )}

        {/* Пустое состояние */}
        {!loading && cars.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-text-secondary dark:text-dark-text-secondary text-lg">
              Автомобили не найдены
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Обновить данные
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestApiPage; 