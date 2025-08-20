import { useAppNavigation, routes } from '../../shared/lib/navigation';
import primeWrap from '../../assets/detailing/primeWrap.jpg';
import { BackToMenuButton } from '../../shared/ui';

const companies = [
  {
    name: 'Prime Wrap',
    slug: 'prime-wrap',
    logo: primeWrap,
    hours: '10:00 - 20:00 (МСК)',
    description: 'Профессиональные услуги детейлинга и оклейки автомобилей'
  },
];

const CompanyCard = ({ company, onOpen }) => {
  return (
    <button
      type="button"
      onClick={() => onOpen(company.slug)}
      className="w-full flex flex-col l:flex-row items-center gap-4 l:gap-10 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
      aria-label={`Открыть ${company.name}`}
    >
		<div className="flex shrink-0 items-center gap-4 w-full l:w-auto text-left">
        	<img
        	  src={company.logo}
        	  alt={company.name}
        	  className="w-20 h-20 object-contain rounded-md bg-dark-surface-elevated dark:bg-dark-surface"
        	/>
        	<div className="l:hidden text-base m:text-lg font-semibold text-text-primary dark:text-dark-text-primary">{company.name}</div>
		</div>
      <div className="flex flex-col gap-1 text-left">
	  	<div className="hidden l:block text-base m:text-lg font-semibold text-text-primary dark:text-dark-text-primary">{company.name}</div>        
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">{company.description}</div>
        <div className="shrink-0 text-sm text-text-secondary dark:text-dark-text-secondary">{company.hours}</div>        
      </div>
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
		<div className="flex flex-col-reverse m:flex-row m:items-center m:justify-between mb-6">
        	<h1 className="mt-4 m:mt-0 text-3xl font-bold text-text-primary dark:text-dark-text-primary">Доп. услуги — Детейлинг</h1>     	
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