import { useEffect, useMemo } from 'react';
import { useAppParams, useAppNavigation, routes } from '../../shared/lib/navigation';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openURL, openPhoneDialer } from '../../shared/lib/platform';
import fitLogo from '../../assets/sto/service_fit.jpg';
import wash from '../../assets/wash/car_wash.png';
import prot from '../../assets/wash/car_prot.png';
import vacuum from '../../assets/wash/car_vacuum.png';
import carpet from '../../assets/wash/car_carpet.png';
import drying from '../../assets/wash/car_drying.png';

const SERVICES = [
  { key: 'wash', title: 'Мойка', description: '', logo: wash },
  { key: 'wipe', title: 'Протирка', description: '', logo: prot },
  { key: 'dry', title: 'Сушка', description: '', logo: drying },
  { key: 'vacuum', title: 'Пропылесосить', description: '500 ₽', logo: vacuum },
  { key: 'carpet', title: 'Мойка ковриков', description: '500 ₽', logo: carpet },
];

const COMPANY_META = {
  'fit-service': { name: 'FIT SERVICE', logo: fitLogo, phone: '+7-000-000-00-60', chatUrl: 'https://t.me/userinfobot' },
};

const ServiceRow = ({ service }) => (
  <div className="flex items-start gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg">
    <img src={service.logo} alt={service.title} className="w-16 h-16 object-contain rounded-md " />
    <div>
      <div className="text-base font-semibold text-text-primary dark:text-dark-text-primary">{service.title}</div>
      {service.description && (
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">{service.description}</div>
      )}
    </div>
  </div>
);

const CompanyWashServicesPage = () => {
  const { slug } = useAppParams();
  const { navigateTo } = useAppNavigation();
  const company = COMPANY_META[slug] || { name: 'Автомойка', logo: fitLogo, phone: '', chatUrl: '' };

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
            onClick={() => navigateTo(routes.wash)}
            className="flex items-center justify-between gap-3 w-full mb-4 focus:outline-none underline-offset-4 hover:underline focus:underline"
            aria-label="Вернуться к списку компаний"
          >
            <img src={company.logo} alt={company.name} className="h-16 max-w-48 m:max-w-67 object-contain rounded-md " />
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-600">назад</span>
          </button>
		  <h1 className="text-3xl font-bold text-center text-text-primary dark:text-dark-text-primary">{company.name}</h1>
        </div>

        <div className="space-y-3 mb-6">
          {SERVICES.map((s) => (
            <ServiceRow key={s.key} service={s} />
          ))}
        </div>

        <div className="p-4 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-lg text-text-secondary dark:text-dark-text-secondary">
          Для записи напишите нам через чат или позвоните.
        </div>
      </div>
    </div>
  );
};

export { CompanyWashServicesPage }; 