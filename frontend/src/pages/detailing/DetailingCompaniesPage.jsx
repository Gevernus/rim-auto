import { useAppNavigation, routes } from '../../shared/lib/navigation';
import primeWrap from '../../assets/primeWrap.png';
import { BackToMenuButton } from '../../shared/ui';
const companies = [
  {
    name: 'Prime Wrap',
    slug: 'prime-wrap',
    logo: primeWrap,
    hours: '10:00 - 20:00 (НСК)'
  },
];

const CompanyCard = ({ company, onOpen }) => {
  return (
    <button
      type="button"
      onClick={() => onOpen(company.slug)}
      className="w-full flex items-center justify-between gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
      aria-label={`Открыть ${company.name}`}
    >
      <div className="flex items-center gap-4">
        <img
          src={company.logo}
          alt={company.name}
          className="w-14 h-14 object-contain rounded-md bg-dark-surface-secondary dark:bg-dark-surface"
        />
        <div className="text-left">
          <div className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{company.name}</div>
          <div className="text-sm text-text-secondary dark:text-dark-text-secondary">Детейлинг услуги</div>
        </div>
      </div>
      <div className="shrink-0 text-sm text-text-secondary dark:text-dark-text-secondary">{company.hours}</div>
    </button>
  );
};

const DetailingCompaniesPage = () => {
  const { navigateTo } = useAppNavigation();

  const handleOpen = (slug) => {
    navigateTo(routes.detailingCompany(slug));
  };

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
		<div className="flex items-center justify-between mb-6">
        	<h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Доп. услуги — Детейлинг</h1>     	
        	<BackToMenuButton />      	
		</div>
        <div className="space-y-3">
          {companies.map((c) => (
            <CompanyCard key={c.slug} company={c} onOpen={handleOpen} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { DetailingCompaniesPage }; 