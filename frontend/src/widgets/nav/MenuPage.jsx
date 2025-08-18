import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { useTelegramAuth } from '../../features/auth';
import { TelegramLoginButton, UserProfile } from '../../features/auth';
import aboutImg from '../../assets/menu-page/about.png';
import creditImg from '../../assets/menu-page/credit.png';
import stoImg from '../../assets/menu-page/sto.png';
import reviewsImg from '../../assets/menu-page/reviews.png';
import leasingImg from '../../assets/menu-page/leasing.png';
import helpImg from '../../assets/menu-page/help1.png';
import contractsImg from '../../assets/menu-page/contracts.png';
import insuranceImg from '../../assets/menu-page/insurance.png';
import washImg from '../../assets/menu-page/wash.png';
import detailingImg from '../../assets/menu-page/detailing.png';
import guaranteeImg from '../../assets/menu-page/guarantee.png';
import tireImg from '../../assets/menu-page/tire.png';

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
    { name: 'О нас', href: routes.about, image: aboutImg },
    { name: 'Кредит', href: routes.credit, image: creditImg },
    { name: 'СТО', href: routes.sto, image: stoImg },
    { name: 'Отзывы', href: routes.reviews, image: reviewsImg },
    { name: 'Лизинг', href: routes.leasing, image: leasingImg },
    { name: 'Тех. помощь', href: routes.help, image: helpImg },
    { name: 'Договора', href: routes.contracts, image: contractsImg },
    { name: 'Страховка', href: routes.insurance, image: insuranceImg },
    { name: 'Автомойка', href: routes.wash, image: washImg },
    { name: 'Детейлинг', href: routes.detailing, image: detailingImg },
    { name: 'Гарантия', href: routes.guarantee, image: guaranteeImg },
    { name: 'Шиномонтаж', href: routes.tire, image: tireImg },
    { name: 'Админ', href: routes.admin, icon: '🔑' }
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
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className="aspect-square flex flex-col items-center justify-center gap-2 p-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-all duration-200 hover:scale-105"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-12 m:w-16 h-12 m:h-16 object-contain" loading="lazy" />
              ) : (
                <span className="text-3xl">{item.icon}</span>
              )}
              <span className="text-text-primary dark:text-dark-text-primary font-medium text-[11px] m:text-[14px] text-center leading-tight">
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
            <p>📍 г.Москва Дмитровское шоссе, 163А к1</p>
            <p>📞 8-905-705-24-09</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MenuPage }; 