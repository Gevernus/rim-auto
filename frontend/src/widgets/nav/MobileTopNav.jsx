import { useAppNavigation, useAppLocation, routes } from '../../shared/lib/navigation';
import carIcon from '../../assets/car.svg';
import techIcon from '../../assets/tech.svg';
import partsIcon from '../../assets/parts.svg';
import motoIcon from '../../assets/moto2.svg';

const MobileTopNav = () => {
  const { navigateTo } = useAppNavigation();
  const { pathname } = useAppLocation();

  const items = [
    { key: 'cars', href: routes.cars, icon: carIcon, label: 'Автомобили' },
    { key: 'specialTech', href: routes.specialTech, icon: techIcon, label: 'Спецтехника' },
    { key: 'parts', href: routes.parts, icon: partsIcon, label: 'Запчасти' },
    { key: 'moto', href: routes.moto, icon: motoIcon, label: 'Мото' },
  ];

  const isActive = (href) => pathname === href;
  const handleClick = (href) => navigateTo(href);

  return (
    <div className="md:hidden bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border z-10">
      <div className="container">
        <nav className="flex justify-center gap-8 py-3 overflow-x-auto scrollbar-hide">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.key}
                onClick={() => handleClick(item.href)}
                className={`flex-shrink-0 w-12 h-12 rounded-full grid place-items-center transition-all duration-200 border ${
                  active
                    ? 'bg-primary-600 border-primary-600 shadow-md'
                    : 'bg-surface-secondary dark:bg-dark-surface-elevated border-border dark:border-dark-border hover:bg-surface-elevated dark:hover:bg-dark-surface-elevated'
                }`}
                aria-label={item.label}
                title={item.label}
              >
                <img src={item.icon} alt="" className={`w-9 h-9 ${active ? 'invert-0' : ''}`} />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export { MobileTopNav }; 