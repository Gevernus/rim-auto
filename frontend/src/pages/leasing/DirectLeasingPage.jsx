import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTelegramAuth } from '../../features/auth';
import { applicationsApi } from '../../shared/api/client';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openPhoneDialer } from '../../shared/lib/platform';
import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { DesktopContactBar } from '../../shared/ui';
import directLogo from '../../assets/leasing/leasing_direct.jpg';

const COMPANY_META = {
  name: 'Директ лизинг',
  logo: directLogo,
  phone: '+7 925 467-29-38',
  whatsAppUrl: 'https://wa.me/7 925 467-29-38',
  telegramUrl: 'https://t.me/7 925 467-29-38'
};

// Нормализацию перенесли в AlternateBottomNavigation

const DirectLeasingPage = () => {
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
    chat: { label: 'Чат', telegramUrl: COMPANY_META.telegramUrl, whatsAppUrl: COMPANY_META.whatsAppUrl, phone: COMPANY_META.phone },
    call: { label: 'Звонок', onClick: () => { if (COMPANY_META.phone) openPhoneDialer(COMPANY_META.phone); }, phone: COMPANY_META.phone },
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
      const formData = new FormData();
      
      // Добавляем основные данные формы
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      // Добавляем документы
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        if (input.files && input.files.length > 0) {
          const fieldName = input.getAttribute('data-field-name') || input.name;
          Array.from(input.files).forEach((file) => {
            formData.append(`documents.${fieldName}`, file);
          });
        }
      });

      // Добавляем информацию о пользователе
      if (user) {
        formData.append('telegramUser', JSON.stringify({
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
        }));
      }

      formData.append('company', 'direct');

      // Отладочная информация
      console.log('📤 Отправляемые данные:');
      for (let [key, value] of formData.entries()) {
        console.log(`   ${key}:`, value);
      }

      const response = await applicationsApi.submitDirectLeasingApplication(formData);
      console.log('Direct leasing application submitted:', response.data);
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting direct leasing application:', error);
      setSubmitError(error.response?.data?.detail || error.message || 'Произошла ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Устанавливаем атрибут для идентификации поля
      e.target.setAttribute('data-field-name', fieldName);
      e.target.setAttribute('data-file-name', file.name);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container section-padding">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8">
            <div className="text-green-600 dark:text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
              Заявка отправлена в {COMPANY_META.name}!
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
            <img src={COMPANY_META.logo} alt={COMPANY_META.name} className="h-16 max-w-48 m:max-w-67 object-contain rounded-md " />
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-600">назад</span>
          </button>
          <h1 className="text-3xl font-bold text-center text-text-primary dark:text-dark-text-primary">{COMPANY_META.name}</h1>
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
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Стоимость имущества (₽) *</label>
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
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ООО Компания"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">ИНН</label>
                <input
                  type="text"
                  {...register('inn', { pattern: { value: /^\d{10,12}$/, message: 'ИНН должен содержать 10 или 12 цифр' } })}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1234567890"
                />
                {errors.inn && (<p className="text-red-500 text-sm mt-1">{errors.inn.message}</p>)}
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Список ТС</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  1. Анкета; Карточка (реквизиты) компании
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileChange(e, 'anketa')}
                  data-field-name="anketa"
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Скан копия</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  2. Копия паспорта Руководителя организации, Учредителей (страницы 2,3,5,6,14,19)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileChange(e, 'passport')}
                  data-field-name="passport"
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Скан копия</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Финансовые документы</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  3. Бухгалтерская отчетность (форма №1 и форма №2)
                </label>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
                  За 2024 г., за 1 кв. 2025 г., за 2 кв. 2024г. и за 3 кв. 2024 г.
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileChange(e, 'accounting')}
                  data-field-name="accounting"
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Скан копия</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  4. Карточка счета 51 (развернутый по субсчетам и банкам) за последние три месяца
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileChange(e, 'account51')}
                  data-field-name="account51"
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">В формате Excel</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                  5. Справки из обслуживающих банков об ежемесячных оборотах по Р/С за последние 12 месяцев
                </label>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
                  О наличии/отсутствии ссудной задолженности и наличии/отсутствии картотеки №2
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileChange(e, 'bankStatements')}
                  data-field-name="bankStatements"
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-secondary dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Скан копия</p>
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
              {isSubmitting ? 'Отправка...' : `Отправить заявку в ${COMPANY_META.name}`}
            </button>
          </div>
        </form>
        {/* Контакты для десктопа */}
        <DesktopContactBar
          telegramUrl={COMPANY_META.telegramUrl}
          whatsAppUrl={COMPANY_META.whatsAppUrl}
          phone={COMPANY_META.phone}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export { DirectLeasingPage };
