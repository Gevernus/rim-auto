import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { BackToMenuButton } from '../../shared/ui';
import fitLogo from '../../assets/sto/service_fit.jpg';

const companies = [
  { name: 'FIT SERVICE', slug: 'fit-service', logo: fitLogo, hours: '08:00 - 22:00' },
];

const CompanyCard = ({ company, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(company.slug)}
    className="w-full flex items-center justify-between gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
    aria-label={`Открыть ${company.name}`}
  >
    <div className="flex items-center gap-4">
      <img src={company.logo} alt={company.name} className="w-36 h-14 object-contain rounded-md bg-dark-surface-secondary dark:bg-dark-surface" />
      <div className="text-left" />
    </div>
    <div className="shrink-0 text-sm text-text-secondary dark:text-dark-text-secondary">{company.hours}</div>
  </button>
);

const WashCompaniesPage = () => {
  const { navigateTo } = useAppNavigation();
  const handleOpen = (slug) => navigateTo(routes.washCompany(slug));

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Автомойка</h1>
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

export { WashCompaniesPage }; 