import { useAppNavigation, useAppLocation, routes } from '../../shared/lib/navigation';

const MobileBottomNavigation = () => {
  const { navigateTo } = useAppNavigation();
  const { pathname } = useAppLocation();

  const navigationItems = [
    {
      name: 'Поиск',
      href: routes.root,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: 'Избранное',
      href: routes.favorites,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      name: 'Чат',
      href: routes.messages,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: 'Меню',
      href: routes.menu,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
  ];

  const isActive = (href) => {
    // Вкладка "Поиск" должна быть активной на корневом и всех основных маршрутах каталога
    const mainCatalogRoutes = [
      routes.root,
      routes.cars,
      routes.specialTech,
      routes.parts,
      routes.moto,
    ];

    if (href === routes.root) {
      return mainCatalogRoutes.includes(pathname);
    }

    return pathname === href;
  };

  const handleNavClick = (href) => {
    navigateTo(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Фон с размытием и градиентом */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated/95 via-surface-elevated/90 to-surface-elevated/85 dark:from-dark-surface-elevated/95 dark:via-dark-surface-elevated/90 dark:to-dark-surface-elevated/85 backdrop-blur-2xl border-t border-border/30 dark:border-dark-border/30" />
      
      {/* Основной контейнер */}
      <div className="relative flex justify-around items-center h-20 px-4">
        {navigationItems.map((item) => {
          const active = isActive(item.href);

          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ease-out group ${
                active
                  ? 'text-primary-600'
                  : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              {/* Активный индикатор с анимацией */}
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-full shadow-lg shadow-primary-500/40 animate-pulse" />
              )}
              
              {/* Иконка с анимацией и эффектами */}
              <div className={`relative mb-1 transition-all duration-300 ${
                active 
                  ? 'scale-110 text-primary-600' 
                  : 'group-hover:scale-105'
              }`}>
                {item.icon}
                {/* Светящийся эффект для активного состояния */}
                {active && (
                  <div className="absolute inset-0 bg-primary-500/30 rounded-full blur-md scale-150 animate-pulse" />
                )}
                {/* Эффект при наведении */}
                <div className="absolute inset-0 bg-primary-500/10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300" />
              </div>
              
              {/* Текст с улучшенной типографикой */}
              <span className={`text-xs font-bold transition-all duration-300 tracking-wide ${
                active 
                  ? 'text-primary-600 scale-105' 
                  : 'group-hover:scale-105'
              }`}>
                {item.name}
              </span>
              
              {/* Подсветка при наведении */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 via-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Дополнительный эффект для активного состояния */}
              {active && (
                <div className="absolute inset-0 bg-primary-500/5 rounded-2xl animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Дополнительная тень снизу с градиентом */}
      <div className="absolute inset-x-0 -bottom-1 h-2 bg-gradient-to-t from-black/20 via-black/10 to-transparent" />
    </nav>
  );
};

export { MobileBottomNavigation }; 