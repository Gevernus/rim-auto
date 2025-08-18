import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { Badge } from '../../../shared/ui/Badge';
import { Loading } from '../../../shared/ui/Loading';
import { citiesApi, deliveryZonesApi } from '../../../shared/api/client';

const DeliveryManagementTab = () => {
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [cityFormData, setCityFormData] = useState({
    name: '',
    region: '',
    delivery_zone: 'Запад',
    is_active: true
  });
  const [zoneFormData, setZoneFormData] = useState({
    china_prices: '',
    japan_prices: '',
    uae_prices: '',
    korea_prices: '',
    europe_prices: ''
  });

  const deliveryZones = {
    'Запад': { name: 'Запад', color: 'bg-blue-100 text-blue-800' },
    'Урал': { name: 'Урал', color: 'bg-green-100 text-green-800' },
    'Сибирь': { name: 'Сибирь', color: 'bg-yellow-100 text-yellow-800' },
    'Дальний Восток': { name: 'Дальний Восток', color: 'bg-red-100 text-red-800' }
  };

  const countries = [
    { key: 'china_prices', label: 'Китай' },
    { key: 'japan_prices', label: 'Япония' },
    { key: 'uae_prices', label: 'ОАЭ' },
    { key: 'korea_prices', label: 'Корея' },
    { key: 'europe_prices', label: 'Европа' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesResponse, zonesResponse] = await Promise.all([
        citiesApi.getCities({ limit: 1000 }),
        deliveryZonesApi.getDeliveryZones({ limit: 1000 })
      ]);
      setCities(citiesResponse.data);
      setZones(zonesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Города
  const handleCitySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCity) {
        await citiesApi.updateCity(editingCity.id, cityFormData);
      } else {
        await citiesApi.createCity(cityFormData);
      }
      
      setShowCityModal(false);
      setEditingCity(null);
      resetCityForm();
      fetchData();
    } catch (error) {
      console.error('Error saving city:', error);
    }
  };

  const handleCityEdit = (city) => {
    setEditingCity(city);
    setCityFormData({
      name: city.name,
      region: city.region,
      delivery_zone: city.delivery_zone,
      is_active: city.is_active
    });
    setShowCityModal(true);
  };

  const handleCityDelete = async (cityId) => {
    if (!confirm('Вы уверены, что хотите удалить этот город?')) return;
    
    try {
      await citiesApi.deleteCity(cityId);
      fetchData();
    } catch (error) {
      console.error('Error deleting city:', error);
    }
  };

  const resetCityForm = () => {
    setCityFormData({
      name: '',
      region: '',
      delivery_zone: 'Запад',
      is_active: true
    });
  };

  const openCreateCityModal = () => {
    setEditingCity(null);
    resetCityForm();
    setShowCityModal(true);
  };

  const closeCityModal = () => {
    setShowCityModal(false);
    setEditingCity(null);
    resetCityForm();
  };

  // Зоны доставки
  const handleZoneSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        china_prices: zoneFormData.china_prices,
        japan_prices: zoneFormData.japan_prices,
        uae_prices: zoneFormData.uae_prices,
        korea_prices: zoneFormData.korea_prices,
        europe_prices: zoneFormData.europe_prices
      };
      
      await deliveryZonesApi.updateDeliveryZone(editingZone.id, updateData);
      
      setShowZoneModal(false);
      setEditingZone(null);
      resetZoneForm();
      fetchData();
    } catch (error) {
      console.error('Error updating delivery zone:', error);
    }
  };

  const handleZoneEdit = (zone) => {
    setEditingZone(zone);
    setZoneFormData({
      china_prices: zone.china_prices || '',
      japan_prices: zone.japan_prices || '',
      uae_prices: zone.uae_prices || '',
      korea_prices: zone.korea_prices || '',
      europe_prices: zone.europe_prices || ''
    });
    setShowZoneModal(true);
  };

  const resetZoneForm = () => {
    setZoneFormData({
      china_prices: '',
      japan_prices: '',
      uae_prices: '',
      korea_prices: '',
      europe_prices: ''
    });
  };

  const closeZoneModal = () => {
    setShowZoneModal(false);
    setEditingZone(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">

	        {/* Зоны доставки */}
			<div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            Зоны доставки
          </h2>
          {zones.length === 0 && (
            <Button 
              onClick={() => deliveryZonesApi.initializeDeliveryZones()} 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Инициализировать
            </Button>
          )}
        </div>

        <div className="bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Зона
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Дни доставки
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface dark:bg-dark-surface divide-y divide-border dark:border-dark-border">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                        {zone.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-secondary dark:text-dark-text-secondary max-w-xs">
                        {zone.description}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs space-y-0.5">
                        {countries.map(country => (
                          <div key={country.key} className="flex justify-between">
                            <span className="font-medium text-text-primary dark:text-dark-text-primary">
                              {country.label}
                            </span>
                            <span className="text-text-secondary dark:text-dark-text-secondary">
                              {zone[country.key] || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => handleZoneEdit(zone)}
                        variant="info"
                        className="text-xs px-3 py-1"
                      >
                        Изменить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Города доставки */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            Города доставки
          </h2>
          <div className="space-x-2">
            {cities.length === 0 && <Button 
              onClick={() => citiesApi.initializeCities()} 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Инициализировать
            </Button>}
            <Button onClick={openCreateCityModal} variant="info">
              Добавить город
            </Button>
          </div>
        </div>

        <div className="bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Город
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Регион
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Зона
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface dark:bg-dark-surface divide-y divide-border dark:divide-dark-border">
                {cities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                        {city.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        {city.region}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={deliveryZones[city.delivery_zone]?.color}>
                        {deliveryZones[city.delivery_zone]?.name}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={city.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {city.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => handleCityEdit(city)}
                        variant="info"
                        className="mr-2 text-xs px-3 py-1"
                      >
                        Изменить
                      </Button>
                      <Button
                        onClick={() => handleCityDelete(city.id)}
                        variant="danger"
                        className="text-xs px-3 py-1"
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* Модальное окно для городов */}
      <Modal isOpen={showCityModal} onClose={closeCityModal} title={editingCity ? 'Изменить город' : 'Добавить город'}>
        <form onSubmit={handleCitySubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                Название города
              </label>
              <Input
                value={cityFormData.name}
                onChange={(e) => setCityFormData({...cityFormData, name: e.target.value})}
                required
                placeholder="Москва"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                Регион
              </label>
              <Input
                value={cityFormData.region}
                onChange={(e) => setCityFormData({...cityFormData, region: e.target.value})}
                required
                placeholder="Москва"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                Зона доставки
              </label>
              <select
                value={cityFormData.delivery_zone}
                onChange={(e) => setCityFormData({...cityFormData, delivery_zone: e.target.value})}
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
              >
                <option value="Запад">Запад</option>
                <option value="Урал">Урал</option>
                <option value="Сибирь">Сибирь</option>
                <option value="Дальний Восток">Дальний Восток</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={cityFormData.is_active}
                  onChange={(e) => setCityFormData({...cityFormData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-text-primary dark:text-dark-text-primary">
                  Активен
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeCityModal} className="bg-gray-500 hover:bg-gray-600 text-white">
              Отмена
            </Button>
            <Button type="submit" className="bg-button-primary text-white">
              {editingCity ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модальное окно для зон доставки */}
      <Modal isOpen={showZoneModal} onClose={closeZoneModal} title="Изменить дни доставки">
        <form onSubmit={handleZoneSubmit} className="space-y-3">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
              {editingZone?.name}
            </h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {editingZone?.description}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
              Дни доставки
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {countries.map(country => (
                <div key={country.key} className="flex items-center space-x-3">
                  <label className="w-20 text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    {country.label}:
                  </label>
                  <Input
                    value={zoneFormData[country.key] || ''}
                    onChange={(e) => setZoneFormData({...zoneFormData, [country.key]: e.target.value})}
                    placeholder="30-40"
                    className="text-sm flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeZoneModal} variant="outline" className="text-xs px-3 py-1">
              Отмена
            </Button>
            <Button type="submit" variant="primary" className="text-xs px-3 py-1">
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DeliveryManagementTab;
