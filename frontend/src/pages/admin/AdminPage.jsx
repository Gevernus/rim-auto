import { useState, useEffect } from 'react';
import { useTelegramAuth } from '../../features/auth';
import { applicationsApi } from '../../shared/api/client';

const AdminPage = () => {
  const { user } = useTelegramAuth();
  const [activeTab, setActiveTab] = useState('credit');
  const [creditApplications, setCreditApplications] = useState([]);
  const [leasingApplications, setLeasingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});

  // Фильтры
  const [statusFilter, setStatusFilter] = useState('all');
  const [telegramFilter, setTelegramFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Отладочная информация
  console.log('Admin: User authenticated:', user);
  console.log('Admin: Auth token:', user?.token);

  useEffect(() => {
    // Временно отключаем проверку авторизации для разработки
    // if (user) {
      loadStats();
      loadApplications();
    // }
  }, [user, activeTab, statusFilter, telegramFilter, page]);

  const loadStats = async () => {
    try {
      const response = await applicationsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Временно показываем тестовые данные при ошибке
      setStats({
        total_applications: 0,
        credit: { total: 0, new: 0, processing: 0, approved: 0, rejected: 0 },
        leasing: { total: 0, new: 0, processing: 0, approved: 0, rejected: 0 }
      });
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        page_size: pageSize
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      let response;
      if (activeTab === 'credit') {
        response = await applicationsApi.getCreditApplications(params);
        let applications = response.data.data;
        
        // Фильтруем по Telegram на клиенте
        if (telegramFilter === 'telegram') {
          applications = applications.filter(app => app.telegram_data);
        } else if (telegramFilter === 'no-telegram') {
          applications = applications.filter(app => !app.telegram_data);
        }
        
        setCreditApplications(applications);
      } else {
        response = await applicationsApi.getLeasingApplications(params);
        let applications = response.data.data;
        
        // Фильтруем по Telegram на клиенте
        if (telegramFilter === 'telegram') {
          applications = applications.filter(app => app.telegram_data);
        } else if (telegramFilter === 'no-telegram') {
          applications = applications.filter(app => !app.telegram_data);
        }
        
        setLeasingApplications(applications);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Ошибка загрузки заявок');
      // Временно показываем пустые массивы при ошибке
      if (activeTab === 'credit') {
        setCreditApplications([]);
      } else {
        setLeasingApplications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await applicationsApi.updateApplicationStatus(activeTab, applicationId, newStatus);
      
      // Перезагружаем заявки
      loadApplications();
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.detail || 'Ошибка обновления статуса');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Новая' },
      processing: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'В обработке' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Одобрена' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Отклонена' }
    };
    
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const renderCreditApplication = (app) => (
    <div key={app._id} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
            {app.personal_data.first_name} {app.personal_data.last_name}
          </h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            {app.personal_data.phone}
          </p>
          {app.personal_data.email && (
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {app.personal_data.email}
            </p>
          )}
        </div>
        <div className="text-right">
          {getStatusBadge(app.status)}
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            {formatDate(app.created_at)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Сумма кредита</p>
          <p className="text-lg font-bold text-primary-600">{formatPrice(app.credit_data.amount)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Срок</p>
          <p className="text-text-primary dark:text-dark-text-primary">{app.credit_data.term} месяцев</p>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Ежемесячный доход</p>
          <p className="text-text-primary dark:text-dark-text-primary">{formatPrice(app.credit_data.monthly_income)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Первоначальный взнос</p>
          <p className="text-text-primary dark:text-dark-text-primary">
            {app.credit_data.down_payment ? formatPrice(app.credit_data.down_payment) : 'Не указан'}
          </p>
        </div>
      </div>
      
      {app.comment && (
        <div className="mb-3">
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Комментарий</p>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{app.comment}</p>
        </div>
      )}
      
      {app.telegram_data && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Telegram: @{app.telegram_data.username}
          </p>
          {app.telegram_data.first_name && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Имя: {app.telegram_data.first_name} {app.telegram_data.last_name || ''}
            </p>
          )}
          <p className="text-xs text-blue-600 dark:text-blue-400">
            ID: {app.telegram_data.user_id}
          </p>
          <button
            onClick={() => window.open(`https://t.me/${app.telegram_data.username}`, '_blank')}
            className="mt-2 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Написать в Telegram
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        {app.status === 'new' && (
          <>
            <button
              onClick={() => updateApplicationStatus(app._id, 'processing')}
              className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            >
              В обработку
            </button>
            <button
              onClick={() => updateApplicationStatus(app._id, 'approved')}
              className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Одобрить
            </button>
            <button
              onClick={() => updateApplicationStatus(app._id, 'rejected')}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Отклонить
            </button>
          </>
        )}
        {app.status === 'processing' && (
          <>
            <button
              onClick={() => updateApplicationStatus(app._id, 'approved')}
              className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Одобрить
            </button>
            <button
              onClick={() => updateApplicationStatus(app._id, 'rejected')}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Отклонить
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderLeasingApplication = (app) => (
    <div key={app._id} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
            {app.personal_data.first_name} {app.personal_data.last_name}
          </h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            {app.personal_data.phone}
          </p>
          {app.personal_data.email && (
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {app.personal_data.email}
            </p>
          )}
        </div>
        <div className="text-right">
          {getStatusBadge(app.status)}
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            {formatDate(app.created_at)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Тип лизинга</p>
          <p className="text-text-primary dark:text-dark-text-primary">
            {app.leasing_data.leasing_type === 'operational' ? 'Операционный' :
             app.leasing_data.leasing_type === 'financial' ? 'Финансовый' :
             app.leasing_data.leasing_type === 'return' ? 'Возвратный' : app.leasing_data.leasing_type}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Стоимость имущества</p>
          <p className="text-lg font-bold text-primary-600">{formatPrice(app.leasing_data.property_value)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Срок лизинга</p>
          <p className="text-text-primary dark:text-dark-text-primary">{app.leasing_data.term} месяцев</p>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Первоначальный взнос</p>
          <p className="text-text-primary dark:text-dark-text-primary">
            {app.leasing_data.down_payment ? formatPrice(app.leasing_data.down_payment) : 'Не указан'}
          </p>
        </div>
      </div>
      
      {app.company_data.company_name && (
        <div className="mb-3">
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Компания</p>
          <p className="text-text-primary dark:text-dark-text-primary">{app.company_data.company_name}</p>
          {app.company_data.inn && (
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">ИНН: {app.company_data.inn}</p>
          )}
        </div>
      )}
      
      {app.comment && (
        <div className="mb-3">
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Комментарий</p>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{app.comment}</p>
        </div>
      )}
      
      {app.telegram_data && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Telegram: @{app.telegram_data.username}
          </p>
          {app.telegram_data.first_name && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Имя: {app.telegram_data.first_name} {app.telegram_data.last_name || ''}
            </p>
          )}
          <p className="text-xs text-blue-600 dark:text-blue-400">
            ID: {app.telegram_data.user_id}
          </p>
          <button
            onClick={() => window.open(`https://t.me/${app.telegram_data.username}`, '_blank')}
            className="mt-2 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Написать в Telegram
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        {app.status === 'new' && (
          <>
            <button
              onClick={() => updateApplicationStatus(app._id, 'processing')}
              className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            >
              В обработку
            </button>
            <button
              onClick={() => updateApplicationStatus(app._id, 'approved')}
              className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Одобрить
            </button>
            <button
              onClick={() => updateApplicationStatus(app._id, 'rejected')}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Отклонить
            </button>
          </>
        )}
        {app.status === 'processing' && (
          <>
            <button
              onClick={() => updateApplicationStatus(app._id, 'approved')}
              className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Одобрить
            </button>
            <button
              onClick={() => updateApplicationStatus(app._id, 'rejected')}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Отклонить
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Временно отключаем проверку авторизации для разработки
  // if (!user) {
  //   return (
  //     <div className="container section-padding">
  //       <div className="max-w-4xl mx-auto text-center">
  //         <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
  //           Доступ запрещен
  //         </h1>
  //         <p className="text-text-secondary dark:text-dark-text-secondary">
  //           Для доступа к админ панели необходимо авторизоваться через Telegram
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="container section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            Админ панель
          </h1>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Управление заявками на кредит и лизинг
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Всего заявок</h3>
            <p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              {stats.total_applications || 0}
            </p>
          </div>
          <div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">В обработке</h3>
            <p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              {(stats.credit?.processing || 0) + (stats.leasing?.processing || 0)}
            </p>
          </div>
          <div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Кредитные заявки</h3>
            <p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              {stats.credit?.total || 0}
            </p>
            <p className="mb-0 text-sm text-text-secondary dark:text-dark-text-secondary">
              Новых: {stats.credit?.new || 0}
            </p>
          </div>
          <div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Лизинговые заявки</h3>
            <p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              {stats.leasing?.total || 0}
            </p>
            <p className="mb-0 text-sm text-text-secondary dark:text-dark-text-secondary">
              Новых: {stats.leasing?.new || 0}
            </p>
          </div>
        </div>

        {/* Статистика по Telegram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Telegram пользователи</h3>
            <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              {creditApplications.filter(app => app.telegram_data).length + leasingApplications.filter(app => app.telegram_data).length}
            </p>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
              С привязкой к Telegram
            </p>
          </div>
          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Обычные заявки</h3>
            <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              {creditApplications.filter(app => !app.telegram_data).length + leasingApplications.filter(app => !app.telegram_data).length}
            </p>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
              Без Telegram
            </p>
          </div>
        </div>

        {/* Табы */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('credit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'credit'
                ? 'bg-primary-600 text-white'
                : 'bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface'
            }`}
          >
            Кредитные заявки ({stats.credit?.total || 0})
          </button>
          <button
            onClick={() => setActiveTab('leasing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'leasing'
                ? 'bg-primary-600 text-white'
                : 'bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface'
            }`}
          >
            Лизинговые заявки ({stats.leasing?.total || 0})
          </button>
        </div>

        {/* Фильтры */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="processing">В обработке</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
          
          <select
            value={telegramFilter}
            onChange={(e) => setTelegramFilter(e.target.value)}
            className="px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
          >
            <option value="all">Все заявки</option>
            <option value="telegram">С Telegram</option>
            <option value="no-telegram">Без Telegram</option>
          </select>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Список заявок */}
        <div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-text-secondary dark:text-dark-text-secondary">Загрузка...</p>
            </div>
          ) : activeTab === 'credit' ? (
            creditApplications.length > 0 ? (
              creditApplications.map(renderCreditApplication)
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary dark:text-dark-text-secondary">Нет заявок</p>
              </div>
            )
          ) : (
            leasingApplications.length > 0 ? (
              leasingApplications.map(renderLeasingApplication)
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary dark:text-dark-text-secondary">Нет заявок</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export { AdminPage }; 