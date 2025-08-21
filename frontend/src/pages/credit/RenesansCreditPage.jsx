import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTelegramAuth } from '../../features/auth';
import { applicationsApi } from '../../shared/api/client';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { useAppNavigation, routes } from '../../shared/lib/navigation';
import renesansLogo from '../../assets/credit/bank_renesans.jpg';

const BANK_META = {
  name: 'Ренессанс кредит',
  logo: renesansLogo,
  phone: '+7 951 600-83-47',
  whatsAppUrl: 'https://wa.me/7 951 600-83-47'
};

const RenesansCreditPage = () => {
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
    chat: { label: 'Чат', telegramUrl: BANK_META.telegramUrl, whatsAppUrl: BANK_META.whatsAppUrl, managerName: BANK_META.managerName },
    call: { label: 'Звонок', phone: BANK_META.phone },
  }), []);

  const { activate, deactivate } = useAltBottomNav(altNavConfig);

  useEffect(() => {
    activate();
    return () => deactivate();
  }, [activate, deactivate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const applicationData = {
        bank: 'renesans',
        ...data,
        telegramUser: user ? {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
        } : null,
      };
      const response = await applicationsApi.submitRenesansCreditApplication(applicationData);
      console.log('Renesans Credit application submitted:', response.data);
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting Renesans credit application:', error);
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
              Заявка отправлена в {BANK_META.name}!
            </h2>
            <p className="text-text-secondary dark:text-dark-text-secondary">
              Наш специалист свяжется с вами в ближайшее время.
            </p>
            {user && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Заявка привязана к вашему Telegram аккаунту
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      <div className="max-w-2xl mx-auto">

        <button
          type="button"
          onClick={() => navigateTo(routes.credit)}
          aria-label="Вернуться к выбору банков"
          className="flex items-center justify-between gap-3 w-full mb-6 focus:outline-none underline-offset-4 hover:underline focus:underline"
        >
          <img src={BANK_META.logo} alt={BANK_META.name} className=" h-16 max-w-48 m:max-w-67 object-contain rounded-md " />
          <span className="mr-4 text-2xl font-bold text-primary-700 dark:text-primary-600">назад</span>
        </button>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">
              Личные данные
            </h3>
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
                  {...register('phone', { required: 'Телефон обязателен', pattern: { value: /^\+?[0-9\s\-()]+$/, message: 'Введите корректный номер телефона' } })}
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
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Информация о кредите</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Сумма кредита (₽) *</label>
                <input
                  type="number"
                  {...register('amount', { required: 'Сумма обязательна', min: { value: 100000, message: 'Минимальная сумма 100,000 ₽' }, max: { value: 10000000, message: 'Максимальная сумма 10,000,000 ₽' } })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="500000"
                />
                {errors.amount && (<p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Срок кредита (месяцев) *</label>
                <select
                  {...register('term', { required: 'Срок кредита обязателен' })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Ежемесячный доход (₽) *</label>
                <input
                  type="number"
                  {...register('monthlyIncome', { required: 'Ежемесячный доход обязателен', min: { value: 30000, message: 'Минимальный доход 30,000 ₽' } })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="80000"
                />
                {errors.monthlyIncome && (<p className="text-red-500 text-sm mt-1">{errors.monthlyIncome.message}</p>)}
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
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Дополнительная информация о вашей заявке..."
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-button-primary hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Отправка...' : `Отправить заявку в ${BANK_META.name}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { RenesansCreditPage };
