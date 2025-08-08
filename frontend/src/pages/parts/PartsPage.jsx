import { MobileTopNav } from '../../widgets/nav';

const PartsPage = () => {
  return (
    <div>
      <MobileTopNav />
      <div className="container section-padding">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary dark:text-dark-text-primary">Запчасти</h1>
        <p className="text-text-secondary dark:text-dark-text-secondary">Раздел находится в разработке.</p>
      </div>
    </div>
  );
};

export default PartsPage;


