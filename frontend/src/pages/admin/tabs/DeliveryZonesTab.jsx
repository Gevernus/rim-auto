import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { Badge } from '../../../shared/ui/Badge';
import { Loading } from '../../../shared/ui/Loading';
import { deliveryZonesApi } from '../../../shared/api/client';

const DeliveryZonesTab = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    china_prices: '',
    japan_prices: '',
    uae_prices: '',
    korea_prices: '',
    europe_prices: '',
    is_active: true
  });
  const countries = [
    { key: 'china_prices', label: 'Китай' },
    { key: 'japan_prices', label: 'Япония' },
    { key: 'uae_prices', label: 'ОАЭ' },
    { key: 'korea_prices', label: 'Корея' },
    { key: 'europe_prices', label: 'Европа' }
  ];

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await deliveryZonesApi.getDeliveryZones({ limit: 1000 });
      setZones(response.data);
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Обновляем только дни доставки, не трогаем название и описание
      const updateData = {
        china_prices: formData.china_prices,
        japan_prices: formData.japan_prices,
        uae_prices: formData.uae_prices,
        korea_prices: formData.korea_prices,
        europe_prices: formData.europe_prices
      };
      
      await deliveryZonesApi.updateDeliveryZone(editingZone.id, updateData);
      
      setShowModal(false);
      setEditingZone(null);
      resetForm();
      fetchZones();
    } catch (error) {
      console.error('Error updating delivery zone:', error);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description,
      china_prices: zone.china_prices || '',
      japan_prices: zone.japan_prices || '',
      uae_prices: zone.uae_prices || '',
      korea_prices: zone.korea_prices || '',
      europe_prices: zone.europe_prices || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      china_prices: '',
      japan_prices: '',
      uae_prices: '',
      korea_prices: '',
      europe_prices: '',
      is_active: true
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingZone(null);
  };



  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
           Зоны доставки
        </h2>
		{zones.length === 0 &&

           <Button 
             onClick={() => deliveryZonesApi.initializeDeliveryZones()} 
             className="bg-yellow-600 hover:bg-yellow-700 text-white"
           >
             Инициализировать
           </Button>
		}

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
            <tbody className="bg-surface dark:bg-dark-surface divide-y divide-border dark:divide-dark-border">
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
                       onClick={() => handleEdit(zone)}
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

             <Modal isOpen={showModal} onClose={closeModal} title="Изменить дни доставки">
                 <form onSubmit={handleSubmit} className="space-y-3">
           <div className="text-center mb-4">
             <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
               {editingZone?.name}
             </h3>
             <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
               {editingZone?.description}
             </p>
           </div>

          {/* Дни доставки по странам */}
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
                    value={formData[country.key] || ''}
                    onChange={(e) => setFormData({...formData, [country.key]: e.target.value})}
                    placeholder="30-40"
                    className="text-sm flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeModal} variant="outline" className="text-xs px-3 py-1">
              Отмена
            </Button>
            <Button type="submit" variant="primary" className="text-xs px-3 py-1">
              {editingZone ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DeliveryZonesTab;
