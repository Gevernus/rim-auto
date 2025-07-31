import { useState, useEffect } from 'react';
import { CarGrid } from '../../widgets/car-grid';
import { mockVehicles } from '../../shared/mocks/vehicleData';
import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { VehicleFilters } from '../../features/car-catalog';
import { CitySelector, DeliveryInfo } from '../../features/delivery';

const CatalogPage = () => {
  const [allVehicles] = useState(mockVehicles); // Все автомобили
  const [filteredVehicles, setFilteredVehicles] = useState([]); // Отфильтрованные автомобили
  const [loading, setLoading] = useState(true);
  const [favoriteVehicleIds, setFavoriteVehicleIds] = useState([]);
  const [selectedDeliveryCity, setSelectedDeliveryCity] = useState(null);
  const { navigateTo } = useAppNavigation();

  // Имитация загрузки данных
  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      
      // Симуляция задержки API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Изначально показываем все автомобили
      setFilteredVehicles(allVehicles);
      setLoading(false);
    };

    loadVehicles();
  }, [allVehicles]);

  // Обработчик изменения фильтров
  const handleFiltersChange = (filters) => {
    console.log('Применены фильтры:', filters);
    
    let filtered = [...allVehicles];

    // Фильтр по странам
    if (filters.countries.length > 0 && !filters.countries.includes('all')) {
      const BRAND_TO_COUNTRY = {
        'Toyota': 'japan', 'Honda': 'japan', 'Nissan': 'japan', 'Mazda': 'japan', 'Subaru': 'japan', 'Lexus': 'japan',
        'Hyundai': 'korea', 'KIA': 'korea', 'Genesis': 'korea',
        'Tesla': 'usa',
        'BMW': 'germany', 'Mercedes-Benz': 'germany', 'Audi': 'germany', 'Volkswagen': 'germany',
        'BYD': 'china', 'NIO': 'china', 'XPeng': 'china', 'Li Auto': 'china', 'Geely': 'china'
      };
      
      filtered = filtered.filter(vehicle => {
        const vehicleCountry = BRAND_TO_COUNTRY[vehicle.brand] || 'other';
        return filters.countries.includes(vehicleCountry);
      });
    }

    // Фильтр по состоянию (новые/с пробегом)
    if (filters.vehicleCondition !== 'all') {
      filtered = filtered.filter(vehicle => {
        const isNew = vehicle.mileage.value < 1000;
        if (filters.vehicleCondition === 'new') return isNew;
        if (filters.vehicleCondition === 'used') return !isNew;
        return true;
      });
    }

    // Фильтр по марке
    if (filters.brand) {
      filtered = filtered.filter(vehicle => vehicle.brand === filters.brand);
    }

    // Фильтр по модели
    if (filters.model) {
      filtered = filtered.filter(vehicle => vehicle.model === filters.model);
    }

    // Фильтр по году
    if (filters.yearRange.from) {
      filtered = filtered.filter(vehicle => vehicle.year >= parseInt(filters.yearRange.from));
    }
    if (filters.yearRange.to) {
      filtered = filtered.filter(vehicle => vehicle.year <= parseInt(filters.yearRange.to));
    }

    // Фильтр по цене
    if (filters.priceRange.from) {
      filtered = filtered.filter(vehicle => vehicle.price.amount >= parseInt(filters.priceRange.from));
    }
    if (filters.priceRange.to) {
      filtered = filtered.filter(vehicle => vehicle.price.amount <= parseInt(filters.priceRange.to));
    }

    // Фильтр по параметрам
    if (filters.parameters.fuelType) {
      filtered = filtered.filter(vehicle => vehicle.fuel_type === filters.parameters.fuelType);
    }
    if (filters.parameters.transmission) {
      filtered = filtered.filter(vehicle => vehicle.transmission === filters.parameters.transmission);
    }

    setFilteredVehicles(filtered);
  };

  // Обработчики действий с автомобилями
  const handleVehicleClick = (vehicle) => {
    console.log('Переход к автомобилю:', vehicle.english_title);
    navigateTo(routes.car(vehicle.id));
  };

  const handleSpecsClick = (vehicle) => {
    console.log('Показать все характеристики:', vehicle.english_title);
    navigateTo(routes.car(vehicle.id));
  };

  const handleFavoriteToggle = (vehicle) => {
    setFavoriteVehicleIds(prev => {
      const isCurrentlyFavorite = prev.includes(vehicle.id);
      
      if (isCurrentlyFavorite) {
        console.log('Удален из избранного:', vehicle.english_title);
        return prev.filter(id => id !== vehicle.id);
      } else {
        console.log('Добавлен в избранное:', vehicle.english_title);
        return [...prev, vehicle.id];
      }
    });
  };

  const handleCopyLink = (vehicle, link) => {
    console.log('Ссылка скопирована:', link);
  };

  const handleHistoryClick = (vehicle) => {
    console.log('История обновлений для:', vehicle.english_title);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface transition-colors">
      <div className="container section-padding">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            Каталог автомобилей
          </h1>
          <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-2xl">
            Найдите свой идеальный автомобиль из нашего обширного каталога. 
            Мы предлагаем широкий выбор автомобилей с полным описанием и характеристиками.
          </p>
        </div>


        {/* Блок с фильтрами и доставкой */}
        
          
          {/* Компонент выбора города доставки */}       
            <CitySelector 
              onCitySelect={setSelectedDeliveryCity}
              className="mb-4 max-w-sm"
            />
            
        

        {/* Фильтры автомобилей */}
        <div className="flex flex-col lg:flex-row gap-4">
            <VehicleFilters className="flex-2/3" onFiltersChange={handleFiltersChange} />
            {/* Информация о доставке */}
            {selectedDeliveryCity && (
              <DeliveryInfo 
                vehiclePrice={filteredVehicles.length > 0 ? filteredVehicles[0]?.price?.amount || 0 : 0}
                className="flex-1/3"
              />
            )}
        </div>

        {/* Статистика и результаты */}
        {/* <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
            Найдено автомобилей: <span className="font-semibold text-text-primary dark:text-dark-text-primary">{filteredVehicles.length}</span> из {allVehicles.length}
          </div>
        </div> */}

        {/* Сетка автомобилей */}
        <CarGrid
          vehicles={filteredVehicles}
          loading={loading}
          favoriteVehicleIds={favoriteVehicleIds}
          onVehicleClick={handleVehicleClick}
          onSpecsClick={handleSpecsClick}
          onFavoriteToggle={handleFavoriteToggle}
          onCopyLink={handleCopyLink}
          onHistoryClick={handleHistoryClick}
        />

      </div>
    </div>
  );
};

export { CatalogPage }; 