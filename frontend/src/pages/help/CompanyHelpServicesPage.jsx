import { useEffect, useMemo } from 'react';
import { useAppParams, useAppNavigation, routes } from '../../shared/lib/navigation';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openURL, openPhoneDialer } from '../../shared/lib/platform';
import fitLogo from '../../assets/sto/service_fit.jpg';
import towTruck from '../../assets/companyHelp/towTruck.png';
import gasoline from '../../assets/companyHelp/Gasoline.png';
import carHelp from '../../assets/companyHelp/car_help.png';

const SERVICES = [
  { key: 'tow', title: 'Эвакуатор', description: 'от 1500 ₽/час', logo: towTruck },
  { key: 'gas', title: 'Подвезти бензин', description: 'Экстренная доставка топлива', logo: gasoline },
  { key: 'help', title: 'Помощь', description: 'Помощь в запуске машины', logo: carHelp },
];

const COMPANY_META = {
  'fit-service': { name: 'FIT SERVICE', logo: fitLogo, phone: '+7-000-000-00-50', chatUrl: 'https://t.me/userinfobot' },
};

const ServiceRow = ({ service }) => (
  <div className="flex items-start gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg">
    <img src={service.logo} alt={service.title} className="w-16 h-16 object-contain rounded-md bg-surface dark:bg-surface" />
    <div>
      <div className="text-base font-semibold text-text-primary dark:text-dark-text-primary">{service.title}</div>
      <div className="text-sm text-text-secondary dark:text-dark-text-secondary">{service.description}</div>
    </div>
  </div>
);

const CompanyHelpServicesPage = () => {
  const { slug } = useAppParams();
  const { navigateTo } = useAppNavigation();
  const company = COMPANY_META[slug] || { name: 'Тех. помощь', logo: carHelp, phone: '', chatUrl: '' };

  const altNavConfig = useMemo(() => ({
    chat: { label: 'Чат', onClick: () => { if (company.chatUrl) openURL(company.chatUrl); } },
    call: { label: 'Звонок', onClick: () => { if (company.phone) openPhoneDialer(company.phone); } },
  }), [company.chatUrl, company.phone]);

  const { activate, deactivate } = useAltBottomNav(altNavConfig);

  useEffect(() => {
    activate();
    return () => deactivate();
  }, [slug]);

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigateTo(routes.help)}
            className="flex items-center justify-between gap-3 w-full mb-4 focus:outline-none underline-offset-4 hover:underline focus:underline"
            aria-label="Вернуться к списку компаний"
          >
            <img src={company.logo} alt={company.name} className="h-16 max-w-48 m:max-w-67 object-contain rounded-md " />
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-600">назад</span>
          </button>
		  <h1 className="text-3xl font-bold text-center text-text-primary dark:text-dark-text-primary">{company.name}</h1>
        </div>

        <div className="space-y-3">
          {SERVICES.map((s) => (
            <ServiceRow key={s.key} service={s} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { CompanyHelpServicesPage }; 