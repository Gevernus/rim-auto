import { useState } from 'react';
import { useTelegramAuth } from '../../features/auth';
import { 
  CreditTab, 
  LeasingTab, 
  ReviewsTab, 
  ContractsTab, 
  DeliveryManagementTab, 
  DirectLeasingTab, 
  CarcadeLeasingTab,
  OTPCreditTab,
  AlfaCreditTab,
  RSHBCreditTab,
  UralCreditTab,
  RenesansCreditTab
} from './tabs';

const AdminPage = () => {
  const { user } = useTelegramAuth();
  const [activeTab, setActiveTab] = useState('delivery');

  // Конфигурация табов с заделом под права (пока доступны всем)
  const permissions = user?.permissions || [];
  const canSeeCredit = permissions.includes('admin:credit:view') || true;
  const canSeeLeasing = permissions.includes('admin:leasing:view') || true;
  const canSeeDirectLeasing = permissions.includes('admin:direct-leasing:view') || true;
  const canSeeCarcadeLeasing = permissions.includes('admin:carcade-leasing:view') || true;
  const canSeeReviews = permissions.includes('admin:reviews:view') || true;
  const canSeeContracts = permissions.includes('admin:contracts:view') || true;
  const canSeeDelivery = permissions.includes('admin:delivery:view') || true;

  const tabsConfig = [
    canSeeCredit && { key: 'credit', label: 'Кредитные заявки' },
    canSeeCredit && { key: 'otp-credit', label: 'ОТП кредит' },
    canSeeCredit && { key: 'alfa-credit', label: 'Альфа кредит' },
    canSeeCredit && { key: 'rshb-credit', label: 'РСХБ кредит' },
    canSeeCredit && { key: 'ural-credit', label: 'Уралсиб кредит' },
    canSeeCredit && { key: 'renesans-credit', label: 'Ренессанс кредит' },
    canSeeLeasing && { key: 'leasing', label: 'Лизинговые заявки' },
    canSeeDirectLeasing && { key: 'direct-leasing', label: 'Direct лизинг' },
    canSeeCarcadeLeasing && { key: 'carcade-leasing', label: 'Каркаде лизинг' },
    canSeeReviews && { key: 'reviews', label: 'Отзывы' },
    canSeeContracts && { key: 'contracts', label: 'Договора' },
    canSeeDelivery && { key: 'delivery', label: 'Управление доставкой' }
  ].filter(Boolean);

  return (
    <div className="container section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Админ панель</h1>
          <p className="text-text-secondary dark:text-dark-text-secondary">Управление заявками и отзывами</p>
        </div>

        {/* Табы */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabsConfig.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === t.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-primary-400 dark:hover:bg-primary-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Контент табов */}
        <div>
          {activeTab === 'credit' && <CreditTab />}
          {activeTab === 'otp-credit' && <OTPCreditTab />}
          {activeTab === 'alfa-credit' && <AlfaCreditTab />}
          {activeTab === 'rshb-credit' && <RSHBCreditTab />}
          {activeTab === 'ural-credit' && <UralCreditTab />}
          {activeTab === 'renesans-credit' && <RenesansCreditTab />}
          {activeTab === 'leasing' && <LeasingTab />}
          {activeTab === 'direct-leasing' && <DirectLeasingTab />}
          {activeTab === 'carcade-leasing' && <CarcadeLeasingTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'contracts' && <ContractsTab />}
          {activeTab === 'delivery' && <DeliveryManagementTab />}
        </div>
      </div>
    </div>
  );
};

export { AdminPage }; 