import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { Badge } from '../../../shared/ui/Badge';
import { Loading } from '../../../shared/ui/Loading';
import { citiesApi } from '../../../shared/api/client';

const CitiesTab = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    delivery_zone: 'Запад',
    is_active: true
  });

  const deliveryZones = {
    'Запад': { name: 'Запад', color: 'bg-blue-100 text-blue-800' },
    'Урал': { name: 'Урал', color: 'bg-green-100 text-green-800' },
    'Сибирь': { name: 'Сибирь', color: 'bg-yellow-100 text-yellow-800' },
    'Дальний Восток': { name: 'Дальний Восток', color: 'bg-red-100 text-red-800' }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await citiesApi.getCities({ limit: 1000 });
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCity) {
        await citiesApi.updateCity(editingCity.id, formData);
      } else {
        await citiesApi.createCity(formData);
      }
      
      setShowModal(false);
      setEditingCity(null);
      resetForm();
      fetchCities();
    } catch (error) {
      console.error('Error saving city:', error);
    }
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      region: city.region,
      delivery_zone: city.delivery_zone,
      is_active: city.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (cityId) => {
    if (!confirm('Вы уверены, что хотите удалить этот город?')) return;
    
    try {
      await citiesApi.deleteCity(cityId);
      fetchCities();
    } catch (error) {
      console.error('Error deleting city:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      delivery_zone: 'Запад',
      is_active: true
    });
  };

  const openCreateModal = () => {
    setEditingCity(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCity(null);
    resetForm();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
              <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            Управление городами доставки
          </h2>
          <div className="space-x-2">
            {cities.length === 0 && <Button 
              onClick={() => citiesApi.initializeCities()} 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Инициализировать
            </Button>}
            <Button onClick={openCreateModal} variant="info">
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
                      onClick={() => handleEdit(city)}
					  variant="info"
                      className="mr-2 text-xs px-3 py-1"
                    >
                      Изменить
                    </Button>
                    <Button
                      onClick={() => handleDelete(city.id)}
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

      <Modal isOpen={showModal} onClose={closeModal} title={editingCity ? 'Изменить город' : 'Добавить город'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                Название города
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Москва"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-1">
                Регион
              </label>
              <Input
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
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
                value={formData.delivery_zone}
                onChange={(e) => setFormData({...formData, delivery_zone: e.target.value})}
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
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-text-primary dark:text-dark-text-primary">
                  Активен
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeModal} className="bg-gray-500 hover:bg-gray-600 text-white">
              Отмена
            </Button>
            <Button type="submit" className="bg-button-primary text-white">
              {editingCity ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CitiesTab;
