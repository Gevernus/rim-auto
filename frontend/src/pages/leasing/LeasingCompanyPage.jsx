import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTelegramAuth } from '../../features/auth';
import { applicationsApi } from '../../shared/api/client';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openURL, openPhoneDialer } from '../../shared/lib/platform';
import { useAppNavigation, useAppParams, routes } from '../../shared/lib/navigation';
import aspectLogo from '../../assets/leasing/leasing_aspect.jpg';
import directLogo from '../../assets/leasing/leasing_direct.jpg';
import carcadeLogo from '../../assets/leasing/leasing_carcade.jpg';

const COMPANY_META = {
  aspect: { name: 'Аспект лизинг', logo: aspectLogo, phone: '+7-000-000-00-10', chatUrl: 'https://t.me/userinfobot' },
  direct: { name: 'Директ лизинг', logo: directLogo, phone: '+7-000-000-00-11', chatUrl: 'https://t.me/userinfobot' },
  carcade: { name: 'Каркаде', logo: carcadeLogo, phone: '+7-000-000-00-12', chatUrl: 'https://t.me/userinfobot' },
};

const LeasingCompanyPage = () => {
  const { company } = useAppParams();
  const companyInfo = COMPANY_META[company] || { name: 'Компания', logo: aspectLogo, phone: '', chatUrl: '' };
  const { navigateTo } = useAppNavigation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { user } = useTelegramAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const altNavConfig = useMemo(() => ({
    chat: { label: 'Чат', onClick: () => { if (companyInfo.chatUrl) openURL(companyInfo.chatUrl); } },
    call: { label: 'Звонок', onClick: () => { if (companyInfo.phone) openPhoneDialer(companyInfo.phone); } },
  }), [companyInfo.chatUrl, companyInfo.phone]);

  const { activate, deactivate } = useAltBottomNav(altNavConfig);

  useEffect(() => {
    activate();
    return () => deactivate();
  }, [company]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        company,
        ...data,
        telegramUser: user ? {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
        } : null,
      };
      const response = await applicationsApi.submitLeasingApplication(payload);
      console.log('Leasing application submitted:', response.data);
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting leasing application:', error);
      setSubmitError(error.response?.data?.detail || error.message || 'Произошла ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container section-padding">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8">
            <div className="text-green-600 dark:text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
              Заявка отправлена в {companyInfo.name}!
            </h2>
            <p className="text-text-secondary dark:text-dark-text-secondary">
              Наш специалист свяжется с вами в ближайшее время.
            </p>
            {user && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">Заявка привязана к вашему Telegram аккаунту</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigateTo(routes.leasing)}
            className="flex items-center justify-between gap-3 w-full mb-4 focus:outline-none underline-offset-4 hover:underline focus:underline"
            aria-label="Вернуться к выбору компаний"
          >
            <img src={companyInfo.logo} alt={companyInfo.name} className="h-16 max-w-48 m:max-w-67 object-contain rounded-md " />
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-600">назад</span>
          </button>
		  <h1 className="text-3xl font-bold text-center text-text-primary dark:text-dark-text-primary">{companyInfo.name}</h1>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Личные данные</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Имя *</label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Имя обязательно' })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Введите имя"
                  defaultValue={user?.first_name || ''}
                />
                {errors.firstName && (<p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Фамилия *</label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Фамилия обязательна' })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Введите фамилию"
                  defaultValue={user?.last_name || ''}
                />
                {errors.lastName && (<p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Телефон *</label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Телефон обязателен', pattern: { value: /^\+?[0-9\s\-\(\)]+$/, message: 'Введите корректный номер телефона' } })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
                {errors.phone && (<p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Email</label>
                <input
                  type="email"
                  {...register('email', { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Введите корректный email' } })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
                {errors.email && (<p className="text-red-500 text-sm mt-1">{errors.email.message}</p>)}
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Информация о лизинге</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Тип лизинга *</label>
                <select
                  {...register('leasingType', { required: 'Тип лизинга обязателен' })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Выберите тип лизинга</option>
                  <option value="operational">Операционный лизинг</option>
                  <option value="financial">Финансовый лизинг</option>
                  <option value="return">Возвратный лизинг</option>
                </select>
                {errors.leasingType && (<p className="text-red-500 text-sm mt-1">{errors.leasingType.message}</p>)}
              </div>
              <div>
                <label className="block text_sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Стоимость имущества (₽) *</label>
                <input
                  type="number"
                  {...register('propertyValue', { required: 'Стоимость обязательна', min: { value: 100000, message: 'Минимальная стоимость 100,000 ₽' }, max: { value: 50000000, message: 'Максимальная стоимость 50,000,000 ₽' } })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="2000000"
                />
                {errors.propertyValue && (<p className="text-red-500 text-sm mt-1">{errors.propertyValue.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Срок лизинга (месяцев) *</label>
                <select
                  {...register('term', { required: 'Срок лизинга обязателен' })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-сurface-secondary dark:bg-dark-сurface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Выберите срок</option>
                  <option value="12">12 месяцев</option>
                  <option value="24">24 месяца</option>
                  <option value="36">36 месяцев</option>
                  <option value="48">48 месяцев</option>
                  <option value="60">60 месяцев</option>
                </select>
                {errors.term && (<p className="text-red-500 text-sm mt-1">{errors.term.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Первоначальный взнос (₽)</label>
                <input
                  type="number"
                  {...register('downPayment')}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-сurface-secondary dark:bg-dark-сurface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="200000"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Информация о компании</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Название компании</label>
                <input
                  type="text"
                  {...register('companyName')}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-сurface-secondary dark:bg-dark-сurface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ООО Компания"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">ИНН</label>
                <input
                  type="text"
                  {...register('inn', { pattern: { value: /^\d{10,12}$/, message: 'ИНН должен содержать 10 или 12 цифр' } })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-сurface-secondary dark:bg-dark-сurface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1234567890"
                />
                {errors.inn && (<p className="text-red-500 text-sm mt-1">{errors.inn.message}</p>)}
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Дополнительная информация</h3>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Комментарий</label>
              <textarea
                {...register('comment')}
                rows="4"
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-сurface-secondary dark:bg-dark-сurface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Дополнительная информация о вашей заявке на лизинг..."
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-button-primary hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Отправка...' : `Отправить заявку в ${companyInfo.name}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { LeasingCompanyPage }; 