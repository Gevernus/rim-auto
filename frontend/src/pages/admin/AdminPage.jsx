import { useState } from 'react';
import { useTelegramAuth } from '../../features/auth';
import { CreditTab, LeasingTab, ReviewsTab, ContractsTab } from './tabs';

const AdminPage = () => {
  const { user } = useTelegramAuth();
  const [activeTab, setActiveTab] = useState('credit');

  // Конфигурация табов с заделом под права (пока доступны всем)
  const permissions = user?.permissions || [];
  const canSeeCredit = permissions.includes('admin:credit:view') || true;
  const canSeeLeasing = permissions.includes('admin:leasing:view') || true;
  const canSeeReviews = permissions.includes('admin:reviews:view') || true;
  const canSeeContracts = permissions.includes('admin:contracts:view') || true;

  const tabsConfig = [
    canSeeCredit && { key: 'credit', label: 'Кредитные заявки' },
    canSeeLeasing && { key: 'leasing', label: 'Лизинговые заявки' },
    canSeeReviews && { key: 'reviews', label: 'Отзывы' },
    canSeeContracts && { key: 'contracts', label: 'Договора' }
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
                  : 'bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-surface dark:hover:bg-dark-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Контент табов */}
        <div>
          {activeTab === 'credit' && <CreditTab />}
          {activeTab === 'leasing' && <LeasingTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'contracts' && <ContractsTab />}
        </div>
      </div>
    </div>
  );
};

export { AdminPage }; 