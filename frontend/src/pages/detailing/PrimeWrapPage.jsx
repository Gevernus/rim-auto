import { useAppParams, useAppNavigation, routes } from '../../shared/lib/navigation';
import { useEffect, useMemo } from 'react';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import primeWrap from '../../assets/detailing/primeWrap.jpg';
import { BackToMenuButton, ArrowRight } from '../../shared/ui';

const services = [
  { 
    key: 'armor-film', 
    title: 'Оклейка в броне плёнку', 
    description: 'Защита кузова от сколов и царапин', 
    slug: 'armor-film'
  },
  { 
    key: 'vinyl-wrap', 
    title: 'Оклейка в виниловую пленку', 
    description: 'Изменение цвета и дизайна автомобиля', 
    slug: 'vinyl-wrap'
  },
  { 
    key: 'polish-ceramic', 
    title: 'Полировка/Керамика', 
    description: 'Восстановление блеска и защитное покрытие', 
    slug: 'polish-ceramic'
  },
  { 
    key: 'windshield-protection', 
    title: 'Бронирование лобового стекла', 
    description: 'Защита от трещин и сколов', 
    slug: 'windshield-protection'
  },
  { 
    key: 'soundproofing', 
    title: 'Шумоизоляция', 
    description: 'Снижение уровня шума в салоне', 
    slug: 'soundproofing'
  },
  { 
    key: 'wheel-painting', 
    title: 'Окрас дисков/Суппортов', 
    description: 'Изменение цвета колесных дисков и тормозных суппортов', 
    slug: 'wheel-painting'
  },
  { 
    key: 'door-closers', 
    title: 'Установка доводчиков', 
    description: 'Плавное закрытие дверей автомобиля', 
    slug: 'door-closers'
  },
  { 
    key: 'anti-chrome', 
    title: 'Анти хром', 
    description: 'Удаление хромированных элементов', 
    slug: 'anti-chrome'
  },
];

const COMPANY_META = {
    name: 'Prime Wrap',
    logo: primeWrap,
    phone: '+7 (965) 285-58-04',
    whatsAppUrl: 'https://wa.me/79652855804',
    telegramUrl: 'https://t.me/79652855804',
    description: 'Профессиональные услуги детейлинга и оклейки автомобилей в Москве. Более 5 лет опыта в сфере тюнинга и защиты автомобилей.',
    address: 'г. Москва, Дмитровское шоссе, 163А к1',
    workingHours: 'Пн-Вс: 10:00 - 22:00'
};

const ServiceCard = ({ service, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(service.slug)}
    className="group w-full flex flex-col l:flex-row items-start gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors text-left"
    aria-label={`Подробнее о ${service.title}`}
  >
    <div className="flex-1">
      <div className="text-base m:text-lg font-semibold text-text-primary dark:text-dark-text-primary l:mb-2" >{service.title}</div>
      <div className="text-sm m:text-base text-text-secondary dark:text-text-secondary">{service.description}</div>
    </div>
    <div className="flex items-center gap-2 text-primary-700 dark:text-primary-600">
      <span className="text-sm font-medium">Подробнее</span>
      <ArrowRight 
        size={16} 
        color="currentColor" 
        className="transition-transform group-hover:translate-x-1" 
      />
    </div>
  </button>
);

const PrimeWrapPage = () => {
  const { slug } = useAppParams();
  const { navigateTo } = useAppNavigation();
  const company = COMPANY_META;

  const altNavConfig = useMemo(() => ({
    chat: { label: 'Чат', telegramUrl: COMPANY_META.telegramUrl, whatsAppUrl: COMPANY_META.whatsAppUrl, managerName: COMPANY_META.managerName },
    call: { label: 'Звонок', phone: COMPANY_META.phone },
  }), []);

  const { activate, deactivate } = useAltBottomNav(altNavConfig);

  useEffect(() => {
    activate();
    return () => deactivate();
  }, [slug, activate, deactivate]);

  const handleServiceOpen = (serviceSlug) => {
    navigateTo(routes.detailingService(slug, serviceSlug));
  };

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigateTo(routes.detailing)}
          className="w-full flex justify-between items-center gap-3 mb-6 focus:outline-none underline-offset-4 hover:underline focus:underline"
          aria-label="Вернуться к списку компаний"
        >
          <img src={company.logo} alt={company.name} className="w-16 h-16 object-contain rounded-md bg-dark-surface-secondary dark:bg-dark-surface-elevated" />
          <span className="text-2xl m:text-3xl font-bold text-text-primary dark:text-dark-text-primary">{company.name}</span>
		  <span className="ml-auto text-xl m:text-2xl font-bold text-primary-700 dark:text-primary-600">назад</span>
        </button>

       

        {company.description && (
          <div className="mb-6 p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg">
            <p className="text-sm m:text-base text-text-secondary dark:text-text-secondary mb-2">{company.description}</p>
            <div className="text-sm text-text-secondary dark:text-text-secondary">
              <div>{company.address}</div>
              <div>{company.workingHours}</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {services.map((service) => (
            <ServiceCard key={service.key} service={service} onOpen={handleServiceOpen} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { PrimeWrapPage }; 