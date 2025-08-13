import { useEffect, useMemo } from 'react';
import { useAppParams, useAppNavigation, routes } from '../../shared/lib/navigation';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openURL, openPhoneDialer } from '../../shared/lib/platform';
import fitLogo from '../../assets/sto/service_fit.jpg';
import addon from '../../assets/sto/addon.png';
import bodyRepair from '../../assets/sto/bodyRepair.png';
import carService from '../../assets/sto/carService.png';
import diagnostics from '../../assets/sto/diagnostics.png';

const SERVICES = [
  { key: 'service', title: 'АВТОСЕРВИС', description: 'Техническое обслуживание и ремонт', logo: carService },
  { key: 'diagnostics', title: 'ДИАГНОСТИКА', description: 'Комплексная диагностика', logo: diagnostics },
  { key: 'addon', title: 'ДОП. ОБОРУДОВАНИЕ', description: 'Установка доп. оборудования', logo: addon },
  { key: 'body', title: 'КУЗОВНОЙ РЕМОНТ', description: 'Ремонт и покраска', logo: bodyRepair },
];

const COMPANY_META = {
  'fit-service': { name: 'FIT SERVICE', logo: fitLogo, phone: '+7-000-000-00-40', chatUrl: 'https://t.me/userinfobot' },
};

const ServiceRow = ({ service }) => (
  <div className="flex items-start gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg">
    <img src={service.logo} alt={service.title} className="w-16 h-16 object-contain rounded-md bg-surface dark:bg-dark-surface" />
    <div>
      <div className="text-base font-semibold text-text-primary dark:text-dark-text-primary">{service.title}</div>
      <div className="text-sm text-text-secondary dark:text-dark-text-secondary">{service.description}</div>
    </div>
  </div>
);

const StationServicesPage = () => {
  const { slug } = useAppParams();
  const { navigateTo } = useAppNavigation();
  const company = COMPANY_META[slug] || { name: 'СТО', logo: fitLogo, phone: '', chatUrl: '' };

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
            onClick={() => navigateTo(routes.sto)}
            className="flex items-center gap-3 focus:outline-none underline-offset-4 hover:underline focus:underline"
            aria-label="Вернуться к списку СТО"
          >
            <img src={company.logo} alt={company.name} className="h-16 object-contain rounded-md bg-dark-surface-secondary dark:bg-dark-surface-elevated" />
            <span className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{company.name}</span>
          </button>
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

export { StationServicesPage }; 