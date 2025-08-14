import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTelegramAuth } from '../../features/auth';
import { applicationsApi } from '../../shared/api/client';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openURL, openPhoneDialer } from '../../shared/lib/platform';
import { useAppNavigation, useAppParams, routes } from '../../shared/lib/navigation';
import karsoLogo from '../../assets/guarantee/guarantee_karso.jpg';

const COMPANY_META = {
  karso: { name: 'KARSO', logo: karsoLogo, phone: '+7-000-000-00-30', chatUrl: 'https://t.me/userinfobot' },
};

const GuaranteeCompanyPage = () => {
  const { company } = useAppParams();
  const companyInfo = COMPANY_META[company] || { name: 'Гарантия', logo: karsoLogo, phone: '', chatUrl: '' };
  const { navigateTo } = useAppNavigation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { user } = useTelegramAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

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
      const response = await applicationsApi.submitGuaranteeApplication(payload);
      console.log('Guarantee application submitted:', response.data);
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting guarantee application:', error);
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
            <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Заявка отправлена в {companyInfo.name}!</h2>
            <p className="text-text-secondary dark:text-dark-text-secondary">Наш специалист свяжется с вами в ближайшее время.</p>
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
            onClick={() => navigateTo(routes.guarantee)}
            className="flex items-center justify-between gap-3 w-full mb-4 focus:outline-none underline-offset-4 hover:underline focus:underline"
            aria-label="Вернуться к выбору организаций"
          >
            <img src={companyInfo.logo} alt={companyInfo.name} className="h-16 max-w-48 m:max-w-67	 object-contain rounded-md " />
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
                <input type="text" defaultValue={user?.first_name || ''} {...register('firstName', { required: 'Имя обязательно' })} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Введите имя" />
                {errors.firstName && (<p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Фамилия *</label>
                <input type="text" defaultValue={user?.last_name || ''} {...register('lastName', { required: 'Фамилия обязательна' })} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Введите фамилию" />
                {errors.lastName && (<p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Телефон *</label>
                <input type="tel" {...register('phone', { required: 'Телефон обязателен', pattern: { value: /^\+?[0-9\s\-\(\)]+$/, message: 'Введите корректный номер телефона' } })} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="+7 (999) 123-45-67" />
                {errors.phone && (<p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Email</label>
                <input type="email" {...register('email', { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Введите корректный email' } })} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="example@email.com" />
                {errors.email && (<p className="text-red-500 text-sm mt-1">{errors.email.message}</p>)}
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Автомобиль</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Марка *</label>
                <input type="text" {...register('brand', { required: 'Марка обязательна' })} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Toyota" />
                {errors.brand && (<p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Модель *</label>
                <input type="text" {...register('model', { required: 'Модель обязательна' })} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Camry" />
                {errors.model && (<p className="text-red-500 text-sm mt-1">{errors.model.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Год выпуска *</label>
                <input type="number" {...register('year', { required: 'Год выпуска обязателен', min: { value: 1980, message: 'Слишком старый' }, max: { value: new Date().getFullYear(), message: 'Некорректный' } })} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="2018" />
                {errors.year && (<p className="text-red-500 text-sm mt-1">{errors.year.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Пробег (км)</label>
                <input type="number" {...register('mileage')} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="65000" />
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Дополнительно</h3>
            <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Комментарий</label>
            <textarea {...register('comment')} rows="4" className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Особые условия / пожелания" />
          </div>

          <div className="flex items-center justify-center">
            <button type="submit" disabled={isSubmitting} className="bg-button-primary hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">{isSubmitting ? 'Отправка...' : `Отправить заявку в ${companyInfo.name}`}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { GuaranteeCompanyPage }; 