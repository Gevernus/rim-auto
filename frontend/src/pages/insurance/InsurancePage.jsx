import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { BackToMenuButton } from '../../shared/ui';
import recoLogo from '../../assets/insurance/Insurance_reco.jpg';

const COMPANIES = [
  { key: 'resco', name: 'РЕСО Гарантия', logo: recoLogo },
];

const CompanyCard = ({ company, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(company.key)}
    className="w-full p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
    aria-label={`Открыть компанию ${company.name}`}
  >
    <div className="flex items-center justify-center">
      <img src={company.logo} alt={company.name} className="h-24 object-contain rounded-md bg-surface dark:bg-dark-surface" />
    </div>
  </button>
);

const InsurancePage = () => {
  const { navigateTo } = useAppNavigation();
  const handleOpen = (companyKey) => navigateTo(routes.insuranceCompany(companyKey));

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold ">Страхование</h1>
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

export { InsurancePage }; 