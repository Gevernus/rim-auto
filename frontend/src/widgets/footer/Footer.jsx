import { useAppNavigation, routes } from "../../shared/lib/navigation";
import logo from "../../assets/logo.jpg";
const Footer = () => {
  const { navigateTo } = useAppNavigation();

  const handleNavClick = (href) => {
    navigateTo(href);
  };

  const handleLogoClick = () => {
    // Перенаправляем на первый пункт основного меню вместо домашней страницы
    navigateTo(routes.cars);
  };

  // Основное меню
  const mainNavigation = [
    { name: "Автомобили", href: routes.cars },
    { name: "Спецтехника", href: routes.specialTech },
    { name: "Запчасти", href: routes.parts },
    { name: "Мото", href: routes.moto },
  ];

  // Дополнительное меню
  const secondaryNavigation = [
	{ name: "О нас", href: routes.about },
    { name: "Новости", href: routes.news },
    { name: "Дополнительные услуги", href: routes.services },
    { name: "Отзывы", href: routes.reviews },

  ];

  //Услуги
  const servicesNavigation = [
    { name: "Страховка", href: routes.insurance },
    { name: "Кредит получить", href: routes.credit },
    { name: "Лизинг получить", href: routes.leasing },
  ];

  return (
    <footer className="hidden md:block bg-footer-bg dark:bg-dark-footer-bg text-footer-text dark:text-dark-footer-text">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row gap-8 ">
          {/* Логотип и описание */}
          <div className="col-span-1 flex-1">
		  <div 
            className="flex items-center cursor-pointer gap-2"
            onClick={handleLogoClick}
          >
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-footer-text dark:text-dark-footer-text">Рим - Авто</span>
          </div>
            <p className="text-footer-text-secondary dark:text-dark-footer-text-secondary mb-6 max-w-md">
              Специализируемся на поставке автомобилей из Китая. 
              Полное сопровождение сделки от заказа до постановки на учет.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-footer-text-muted dark:text-dark-footer-text-muted hover:text-footer-text dark:hover:text-dark-footer-text transition-colors"
              >
                <span className="sr-only">Telegram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.2-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-footer-text-muted dark:text-dark-footer-text-muted hover:text-footer-text dark:hover:text-dark-footer-text transition-colors"
              >
                <span className="sr-only">WhatsApp</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm4.52 7.04c.18-.42.18-.79.12-1.13-.06-.32-.27-.58-.54-.78-.3-.24-.66-.38-1.05-.44-.39-.05-.79-.02-1.17.08-.36.1-.7.26-.99.48-.54.41-.97.96-1.24 1.58-.27.61-.38 1.29-.33 1.97.06.68.27 1.33.62 1.9l.01.01c.01.02.01.03.02.04.53.89 1.26 1.66 2.15 2.19.02.01.04.02.05.03.89.53 1.89.85 2.92.92.68.05 1.37-.06 2.01-.32.62-.27 1.17-.7 1.58-1.24.22-.29.38-.63.48-.99.1-.38.13-.78.08-1.17-.06-.39-.2-.75-.44-1.05-.2-.27-.46-.48-.78-.54z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Контакты */}
          <div >
            <h3 className="text-lg font-semibold mb-4 text-footer-text dark:text-dark-footer-text">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-footer-text-muted dark:text-dark-footer-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-footer-text-secondary dark:text-dark-footer-text-secondary">
                  8-905-705-24-09
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-footer-text-muted dark:text-dark-footer-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-footer-text-secondary dark:text-dark-footer-text-secondary">
                  info@rimavto.ru
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 mr-2 mt-1 text-footer-text-muted dark:text-dark-footer-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-footer-text-secondary dark:text-dark-footer-text-secondary">
					г.Москва Дмитровское шоссе, 163А к1
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Навигация */}
        <div className="border-t border-footer-border dark:border-dark-footer-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Основное меню */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4 text-footer-text dark:text-dark-footer-text">Основное меню</h3>
              <ul className="space-y-3">
                {mainNavigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="text-footer-text-secondary dark:text-dark-footer-text-secondary hover:text-footer-text dark:hover:text-dark-footer-text transition-colors text-left"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
			{/*Услуги*/}
			<div className="flex-1">
				<h3 className="text-lg font-semibold mb-4 text-footer-text dark:text-dark-footer-text">Услуги</h3>
				<ul className="space-y-3">
					{servicesNavigation.map((item) => (
						<li key={item.name}>
							<button
								onClick={() => handleNavClick(item.href)}
								className="text-footer-text-secondary dark:text-dark-footer-text-secondary hover:text-footer-text dark:hover:text-dark-footer-text transition-colors text-left"
							>
								{item.name}
							</button>
						</li>	
					))}
				</ul>
			</div>

            {/* Дополнительное меню */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-footer-text dark:text-dark-footer-text">Дополнительно</h3>
              <ul className="space-y-3">
                {secondaryNavigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="text-footer-text-secondary dark:text-dark-footer-text-secondary hover:text-footer-text dark:hover:text-dark-footer-text transition-colors text-left"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-footer-border dark:border-dark-footer-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-footer-text-muted dark:text-dark-footer-text-muted text-sm">
              © 2024 Рим Авто. Все права защищены.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-footer-text-muted dark:text-dark-footer-text-muted hover:text-footer-text dark:hover:text-dark-footer-text text-sm transition-colors"
              >
                Политика конфиденциальности
              </a>
              <a
                href="#"
                className="text-footer-text-muted dark:text-dark-footer-text-muted hover:text-footer-text dark:hover:text-dark-footer-text text-sm transition-colors"
              >
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
