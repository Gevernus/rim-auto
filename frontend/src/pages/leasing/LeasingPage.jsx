import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { BackToMenuButton } from '../../shared/ui';
import aspectLogo from '../../assets/leasing/leasing_aspect.jpg';
import directLogo from '../../assets/leasing/leasing_direct.jpg';
import carcadeLogo from '../../assets/leasing/leasing_carcade.jpg';

const COMPANIES = [
  { key: 'aspect', name: 'Аспект лизинг', logo: aspectLogo, route: routes.aspectLeasing },
  { key: 'direct', name: 'Директ лизинг', logo: directLogo, route: routes.directLeasing },
  { key: 'carcade', name: 'Каркаде', logo: carcadeLogo, route: routes.carcadeLeasing },
];

const CompanyCard = ({ company, onOpen }) => {
  return (
    <button
      type="button"
      onClick={() => onOpen(company.route)}
      className="w-full p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
      aria-label={`Открыть компанию ${company.name}`}
    >
      <div className="flex items-center justify-center">
        <img src={company.logo} alt={company.name} className="h-24 object-contain rounded-md " />
      </div>
    </button>
  );
};

const LeasingPage = () => {
  const { navigateTo } = useAppNavigation();

  const handleOpen = (route) => {
    navigateTo(route);
  };

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Лизинг</h1>
          <BackToMenuButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPANIES.map((c) => (
            <CompanyCard key={c.key} company={c} onOpen={handleOpen} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { LeasingPage }; 