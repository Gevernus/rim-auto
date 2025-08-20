import { useAppNavigation, routes } from '../../shared/lib/navigation';
import otpLogo from '../../assets/credit/bank_otp.jpg';
import alfaLogo from '../../assets/credit/bank_alfa.jpg';
import rshbLogo from '../../assets/credit/bank_rshb.jpg';
import uralLogo from '../../assets/credit/bank_ural.jpg';
import renesansLogo from '../../assets/credit/bank_renesans.jpg';
import { BackToMenuButton } from '../../shared/ui';

const BANKS = [
  { key: 'otp', name: 'ОТП банк', logo: otpLogo },
  { key: 'alfa', name: 'Альфа банк', logo: alfaLogo },
  { key: 'rshb', name: 'Россельхоз Банк', logo: rshbLogo },
  { key: 'ural', name: 'Уралсиб банк', logo: uralLogo },
  { key: 'renesans', name: 'Ренессанс кредит', logo: renesansLogo },
];

const BankCard = ({ bank, onOpen }) => {
  return (
    <button
      type="button"
      onClick={() => onOpen(bank.key)}
      className="w-full p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
      aria-label={`Открыть банк ${bank.name}`}
    >
      <div className="flex items-center justify-center">
        <img src={bank.logo} alt={bank.name} className=" h-24 object-contain rounded-md " />
      </div>
    </button>
  );
};

const CreditPage = () => {
  const { navigateTo } = useAppNavigation();

  const handleOpen = (bankKey) => {
    navigateTo(routes.creditBank(bankKey));
  };

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Кредит</h1>
          <BackToMenuButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BANKS.map((b) => (
            <BankCard key={b.key} bank={b} onOpen={handleOpen} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { CreditPage }; 