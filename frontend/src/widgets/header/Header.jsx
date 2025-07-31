import { useState } from 'react';
import { Button, ThemeToggle } from '../../shared/ui';
import { useAppNavigation, useAppLocation, routes } from '../../shared/lib/navigation';
import logo from '../../assets/logo.jpg';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { navigateTo } = useAppNavigation();
  const { pathname } = useAppLocation();

  // Основное меню
  const mainNavigation = [
    { name: 'Автомобили', href: routes.cars },
    { name: 'Спецтехника', href: routes.specialTech },
    { name: 'Запчасти', href: routes.parts },
    { name: 'Мото', href: routes.moto },
  ];

  // Дополнительное меню
  const secondaryNavigation = [
    { name: 'Новости', href: routes.news },
    { name: 'Дополнительные услуги', href: routes.services },
    { name: 'Отзывы', href: routes.reviews },
    { name: 'О нас', href: routes.about },
    { name: 'Страховка', href: routes.insurance },
    { name: 'Кредит получить', href: routes.credit },
    { name: 'Лизинг получить', href: routes.leasing },
  ];

  const isActive = (href) => pathname === href;

  const handleLogoClick = () => {
    // Перенаправляем на первый пункт основного меню вместо домашней страницы
    navigateTo(routes.cars);
  };

  const handleNavClick = (href) => {
    navigateTo(href);
    setIsMobileMenuOpen(false);
  };

  const handleOrderClick = () => {
    navigateTo(routes.order);
  };

  return (
    <header className="bg-surface-elevated dark:bg-dark-surface-elevated shadow-sm border-b border-border dark:border-dark-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div 
            className="flex items-center cursor-pointer gap-2"
            onClick={handleLogoClick}
          >
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Рим - Авто</span>
          </div>

          {/* Основная навигация (десктоп) */}
          <nav className="hidden xl:flex space-x-6">
            {mainNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Информация о компании */}
          <div className="hidden lg:flex flex-col items-start gap-1">
            <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
              г. Москва, пр. Дмитревский, 63а
            </span>
            <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
              8-905-705-24-09
            </span>
          </div>

          {/* Десктопные действия */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />
            <Button onClick={handleOrderClick}>
              Заказать авто
            </Button>
          </div>

          {/* Мобильное меню */}
          <div className="flex xl:hidden items-center space-x-2">
            <ThemeToggle className="scale-75" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Открыть меню</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Дополнительная навигация (десктоп) */}
        <div className="hidden xl:block border-t border-border dark:border-dark-border">
          <nav className="flex space-x-6 py-2">
            {secondaryNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary-600'
                    : 'text-text-muted dark:text-dark-text-muted hover:text-text-secondary dark:hover:text-dark-text-secondary'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Мобильное выпадающее меню */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-border dark:border-dark-border animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Основное меню */}
              <div className="mb-4">
                <h3 className="px-3 py-2 text-sm font-semibold text-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                  Основное меню
                </h3>
                {mainNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className={`block px-3 py-2 text-base font-medium w-full text-left rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Дополнительное меню */}
              <div className="mb-4">
                <h3 className="px-3 py-2 text-sm font-semibold text-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                  Дополнительно
                </h3>
                {secondaryNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className={`block px-3 py-2 text-sm font-medium w-full text-left rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-text-muted dark:text-dark-text-muted hover:text-text-secondary dark:hover:text-dark-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Информация о компании в мобильном меню */}
              <div className="px-3 py-2 border-t border-border dark:border-dark-border">
                <div className="flex flex-col gap-1 mb-3">
                  <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    г. Москва, пр. Дмитревский, 63а
                  </span>
                  <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    8-905-705-24-09
                  </span>
                </div>
                <Button className="w-full" onClick={handleOrderClick}>
                  Заказать авто
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header }; 