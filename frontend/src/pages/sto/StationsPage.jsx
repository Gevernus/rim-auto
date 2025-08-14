import { useAppNavigation, routes } from '../../shared/lib/navigation';
import { BackToMenuButton } from '../../shared/ui';
import fitLogo from '../../assets/sto/service_fit.jpg';

const stations = [
  { name: 'FIT SERVICE', slug: 'fit-service', logo: fitLogo, hours: '09:00 - 21:00 (ежедневно)' },
];

const StationCard = ({ station, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(station.slug)}
    className="w-full flex items-center justify-between gap-4 p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
    aria-label={`Открыть ${station.name}`}
  >
    <div className="flex items-center gap-4">
      <img src={station.logo} alt={station.name} className="w-36 h-14 object-contain rounded-md " />
      <div className="text-left">
        {/* <div className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{station.name}</div>
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">СТО услуги</div> */}
      </div>
    </div>
    <div className="shrink-0 text-sm text-text-secondary dark:text-dark-text-secondary">{station.hours}</div>
  </button>
);

const StationsPage = () => {
  const { navigateTo } = useAppNavigation();
  const handleOpen = (slug) => navigateTo(routes.stoCompany(slug));

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">СТО</h1>
          <BackToMenuButton />
        </div>
        <div className="space-y-3">
          {stations.map((s) => (
            <StationCard key={s.slug} station={s} onOpen={handleOpen} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { StationsPage }; 