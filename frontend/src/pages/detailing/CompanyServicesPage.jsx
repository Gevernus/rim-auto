import { useAppParams, useAppNavigation, routes } from '../../shared/lib/navigation';
import { useEffect, useMemo } from 'react';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openURL, openPhoneDialer } from '../../shared/lib/platform';
import primeWrap from '../../assets/detailing/primeWrap.png';
import cleaning from '../../assets/detailing/cleaning.png';
import all from '../../assets/detailing/all.png';
import ppf from '../../assets/detailing/ppf.png';
import hydro from '../../assets/detailing/hydro.png';
import polish from '../../assets/detailing/polish.png';
import coatings from '../../assets/detailing/coatings.png';
import tint from '../../assets/detailing/tint.png';
import soundproof from '../../assets/detailing/soundproof.png';

const services = [
  { key: 'all', title: 'ВСЕ УСЛУГИ', description: 'Список всех услуг детейлинга.', logo: all },
  { key: 'cleaning', title: 'ХИМЧИСТКА', description: 'Полная или частичная чистка', logo: cleaning },
  { key: 'ppf', title: 'БРОНИРОВАНИЕ', description: 'Все услуги по бронированию', logo: ppf },
  { key: 'hydro', title: 'АКВАПЕЧАТЬ', description: 'Аква печать любых элементов', logo: hydro },
  { key: 'polish', title: 'ПОЛИРОВКА', description: 'Полировка кузова и элементов', logo: polish },
  { key: 'coatings', title: 'ЗАЩИТНЫЕ ПОКРЫТИЕ', description: 'Керамика, жидкое стекло, воск и т.д.', logo: coatings },
  { key: 'tint', title: 'ТОНИРОВАНИЕ', description: 'Большой выбор пленок для стекол', logo: tint },
  { key: 'soundproof', title: 'ШУМОИЗОЛЯЦИЯ', description: 'Точный расчет стоимости, гибкий выбор', logo: soundproof },
];

const COMPANY_META = {
  'prime-wrap': {
    name: 'Prime Wrap',
    logo: primeWrap,
    phone: '+7-905-705-24-09',
    chatUrl: 'https://t.me/userinfobot',
  },
};

const ServiceRow = ({ service }) => (
  <div className="flex items-start gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg">
    <img src={service.logo} alt="Логотип" className="w-10 h-10 object-contain rounded-md bg-surface dark:bg-dark-surface" />
    <div>
      <div className="text-base font-semibold text-text-primary dark:text-dark-text-primary">{service.title}</div>
      <div className="text-sm text-text-secondary dark:text-dark-text-secondary">{service.description}</div>
    </div>
  </div>
);

const CompanyServicesPage = () => {
  const { slug } = useAppParams();
  const { navigateTo } = useAppNavigation();
  const company = COMPANY_META[slug] || { name: 'Детейлинг', logo: primeWrap, phone: '', chatUrl: '' };

  const altNavConfig = useMemo(() => ({
    chat: {
      label: 'Чат',
      onClick: () => {
        if (!company.chatUrl) return;
        openURL(company.chatUrl);
      },
    },
    call: {
      label: 'Звонок',
      onClick: () => {
        if (!company.phone) return;
        openPhoneDialer(company.phone);
      },
    },
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
            onClick={() => navigateTo(routes.detailing)}
            className="flex items-center gap-3 focus:outline-none underline-offset-4 hover:underline focus:underline"
            aria-label="Вернуться к списку компаний"
          >
            <img src={company.logo} alt={company.name} className="w-16 h-16 object-contain rounded-md bg-dark-surface-secondary dark:bg-dark-surface-elevated" />
            <span className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{company.name}</span>
          </button>
        </div>

        <div className="space-y-3">
          {services.map((s) => (
            <ServiceRow key={s.key} service={s} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { CompanyServicesPage }; 