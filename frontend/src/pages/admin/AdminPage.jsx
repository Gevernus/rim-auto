import { useState, useEffect } from 'react';
import { useTelegramAuth } from '../../features/auth';
import { applicationsApi } from '../../shared/api/client';
import { reviewsApi } from '../../shared/api/client';
import { Pagination } from '../../shared/ui/Pagination';
import { Rating } from '../../shared/ui/Rating';

const AdminPage = () => {
  const { user } = useTelegramAuth();
  const [activeTab, setActiveTab] = useState('credit');
  const [creditApplications, setCreditApplications] = useState([]);
  const [leasingApplications, setLeasingApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPageSize, setReviewsPageSize] = useState(10);
  const [replyMap, setReplyMap] = useState({});
  const [editReplyMap, setEditReplyMap] = useState({});
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
      if (activeTab === 'reviews') {
        loadReviews();
      }
    // }
  }, [user, activeTab, statusFilter, telegramFilter, page, reviewsPage, reviewsPageSize]);

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
    if (activeTab === 'reviews') return;
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
      } else if (activeTab === 'leasing') {
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
      } else if (activeTab === 'leasing') {
        setLeasingApplications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewsApi.getReviews({ page: reviewsPage, page_size: reviewsPageSize });
      setReviews(res.data.data || []);
      setReviewsTotal(res.data.total || 0);
    } catch (e) {
      setError('Ошибка загрузки отзывов');
      setReviews([]);
      setReviewsTotal(0);
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

  const handleReplyChange = (reviewId, value) => {
    setReplyMap((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleReply = async (reviewId) => {
    const value = (replyMap[reviewId] || '').trim();
    if (!value) return;
    try {
      await reviewsApi.replyReview(reviewId, value);
      setReplyMap((prev) => ({ ...prev, [reviewId]: '' }));
      await loadReviews();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось отправить ответ');
    }
  };

  const handleReplyEditToggle = (reviewId, currentReply) => {
    setEditReplyMap((prev) => ({ ...prev, [reviewId]: prev[reviewId] != null ? null : (currentReply || '') }));
  };

  const handleReplySave = async (reviewId) => {
    const value = (editReplyMap[reviewId] || '').trim();
    if (!value) return;
    try {
      await reviewsApi.replyReview(reviewId, value);
      setEditReplyMap((prev) => ({ ...prev, [reviewId]: null }));
      await loadReviews();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось сохранить ответ');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      await reviewsApi.deleteReview(reviewId);
      await loadReviews();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось удалить отзыв');
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

  const renderReview = (r) => {
    return (
      <div key={r._id} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-text-primary dark:text-dark-text-primary">{r.name || 'Аноним'}</p>
            <div className="flex items-center gap-1 mt-1">
              <Rating value={r.rating || 0} editable={false} />
            </div>
          </div>
          <p className="text-xs text-text-muted dark:text-dark-text-muted">{formatDate(r.created_at)}</p>
        </div>
        <p className="mt-3 text-text-primary dark:text-dark-text-primary">{r.message}</p>

        {r.reply ? (
          <div className="mt-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/60 border border-border dark:border-dark-border">
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Ответ: {r.reply_author || 'Менеджер'}</p>
            {editReplyMap[r._id] != null ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editReplyMap[r._id]}
                  onChange={(e) => setEditReplyMap((prev) => ({ ...prev, [r._id]: e.target.value }))}
                  rows={2}
                  className="px-3 py-2 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleReplySave(r._id)} className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded">Сохранить</button>
                  <button onClick={() => handleReplyEditToggle(r._id, null)} className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded">Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-text-primary dark:text-dark-text-primary">{r.reply}</p>
                <div className="mt-2">
                  <button onClick={() => handleReplyEditToggle(r._id, r.reply)} className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded mr-2">Редактировать</button>
                  <button onClick={() => handleDelete(r._id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Удалить</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <input
              value={replyMap[r._id] || ''}
              onChange={(e) => handleReplyChange(r._id, e.target.value)}
              placeholder="Ответ менеджера..."
              className="px-3 py-2 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
            />
            <div className="flex gap-2">
              <button onClick={() => handleReply(r._id)} className="px-3 py-1 text-sm bg-info-600 hover:bg-info-700 text-white rounded">Ответить</button>
              <button onClick={() => handleDelete(r._id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Удалить</button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
        <div className="flex flex-wrap gap-2 mb-6">
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
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-primary-600 text-white'
                : 'bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface'
            }`}
          >
            Отзывы
          </button>
        </div>

        {/* Фильтры */}
        {activeTab !== 'reviews' && (
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
        )}

        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Список */}
        <div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-text-secondary dark:text-dark-text-secondary">Загрузка...</p>
            </div>
          ) : activeTab === 'credit' ? (
            creditApplications.length > 0 ? (
              creditApplications.map((app) => (
                <div key={app._id} className="mb-4">{renderCreditApplication(app)}</div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary dark:text-dark-text-secondary">Нет заявок</p>
              </div>
            )
          ) : activeTab === 'leasing' ? (
            leasingApplications.length > 0 ? (
              leasingApplications.map((app) => (
                <div key={app._id} className="mb-4">{renderLeasingApplication(app)}</div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary dark:text-dark-text-secondary">Нет заявок</p>
              </div>
            )
          ) : (
            reviews.length > 0 ? (
              <>
                <div className="flex items-center justify-end gap-2 mb-2">
                  <label className="text-sm text-text-secondary dark:text-dark-text-secondary" htmlFor="admin-reviews-page-size">Показывать</label>
                  <select
                    id="admin-reviews-page-size"
                    value={reviewsPageSize}
                    onChange={(e) => { setReviewsPageSize(Number(e.target.value) || 10); setReviewsPage(1); }}
                    className="px-2 py-1 border border-border dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
                  >
                    {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {reviews.map(renderReview)}
                <Pagination
                  currentPage={reviewsPage}
                  totalPages={Math.max(1, Math.ceil(reviewsTotal / reviewsPageSize))}
                  onPageChange={setReviewsPage}
                  loading={loading}
                  className="mt-4"
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary dark:text-dark-text-secondary">Отзывов нет</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export { AdminPage }; 