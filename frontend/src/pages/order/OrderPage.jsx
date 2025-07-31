import { ProtectedRoute } from '../../features/auth';
import { useTelegramAuth } from '../../features/auth';

const OrderContent = () => {
  const { user, telegramUser, userName } = useTelegramAuth();

  return (
    <div className="container section-padding">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text-primary dark:text-dark-text-primary">
          Оформить заказ
        </h1>

        {/* Приветствие пользователя */}
        <div className="bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-text-primary dark:text-dark-text-primary">
            Добро пожаловать, {userName}!
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Вы успешно авторизованы через Telegram. Теперь вы можете оформить заказ автомобиля.
          </p>
          
          {telegramUser?.username && (
            <p className="text-sm text-text-muted dark:text-dark-text-muted mt-2">
              Telegram: @{telegramUser.username}
            </p>
          )}
        </div>

        {/* Форма заказа */}
        <div className="bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-dark-text-primary">
            Форма заказа
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                Марка и модель автомобиля
              </label>
              <input 
                type="text" 
                placeholder="Например: Toyota Camry"
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                Бюджет (млн руб.)
              </label>
              <input 
                type="number" 
                placeholder="От 1 до 10"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                Комментарии к заказу
              </label>
              <textarea 
                rows="4"
                placeholder="Укажите дополнительные пожелания..."
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Отправить заказ
            </button>
          </div>
        </div>

        {/* Информация о процессе */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-text-primary dark:text-dark-text-primary mb-2">1. Заявка</h4>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Заполните форму с требованиями к автомобилю</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-text-primary dark:text-dark-text-primary mb-2">2. Поиск</h4>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Мы найдем подходящие варианты в Китае</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h4 className="font-semibold text-text-primary dark:text-dark-text-primary mb-2">3. Доставка</h4>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Полное сопровождение до получения ключей</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderPage = () => {
  return (
    <ProtectedRoute>
      <OrderContent />
    </ProtectedRoute>
  );
};

export { OrderPage }; 