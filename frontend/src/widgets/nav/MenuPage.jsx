import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { useTelegramAuth } from '../../features/auth';
import { TelegramLoginButton, UserProfile } from '../../features/auth';

const MenuPage = () => {
  const { navigateTo } = useAppNavigation();
  const {
    isAuthenticated,
    isLoading: authLoading,
    handleTelegramWebAuth,
    isTelegramWebApp
  } = useTelegramAuth();

  const handleNavClick = (href) => {
    navigateTo(href);
  };

  const handleTelegramAuth = async (telegramData) => {
    await handleTelegramWebAuth(telegramData);
  };

  const menuItems = [
    { name: 'Автомобили', href: routes.cars, icon: '🚗' },
    { name: 'Спецтехника', href: routes.specialTech, icon: '🚜' },
    { name: 'Запчасти', href: routes.parts, icon: '🔧' },
    { name: 'Отзывы', href: routes.reviews, icon: '⭐' },
    { name: 'Мото', href: routes.moto, icon: '🏍️' },
    { name: 'Страховка', href: routes.insurance, icon: '🛡️' },
    { name: 'Кредит', href: routes.credit, icon: '💳' },
    { name: 'Лизинг', href: routes.leasing, icon: '📋' },
    { name: 'Услуги', href: routes.services, icon: '⚙️' },
    { name: 'Новости', href: routes.news, icon: '📰' },
    { name: 'О нас', href: routes.about, icon: 'ℹ️' },
	{ name: 'Админ', href: routes.admin, icon: '🔑' },
  ];

  return (
    <div className="container section-padding">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-text-primary dark:text-dark-text-primary">
          Меню
        </h1>

        {/* Авторизация */}
        <div className="mb-6 p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg">
          {isAuthenticated ? (
            <UserProfile compact={true} />
          ) : (
            <div className="text-center">
              {!isTelegramWebApp && (
                <TelegramLoginButton
                  onAuth={handleTelegramAuth}
                  disabled={authLoading}
                  buttonSize="medium"
                  compact={true}
                  className="w-full mb-2"
                />
              )}
              {isTelegramWebApp && (
                <p className="text-sm text-text-muted dark:text-dark-text-muted">
                  Авторизация через Telegram WebApp
                </p>
              )}
            </div>
          )}
        </div>

        {/* Меню в виде грид-сетки */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className="aspect-square flex flex-col items-center justify-center gap-2 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-all duration-200 hover:scale-105"
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-text-primary dark:text-dark-text-primary font-medium text-sm text-center leading-tight">
                {item.name}
              </span>
            </button>
          ))}
        </div>

        {/* Контактная информация */}
        <div className="mt-8 p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-text-primary dark:text-dark-text-primary">
            Контакты
          </h3>
          <div className="space-y-2 text-text-secondary dark:text-dark-text-secondary">
            <p>📍 г. Москва, пр. Дмитревский, 63а</p>
            <p>📞 8-905-705-24-09</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MenuPage }; 