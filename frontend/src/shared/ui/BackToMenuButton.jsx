import { useAppNavigation, routes } from '../lib/navigation';

const BackToMenuButton = ({ className = '' }) => {
  const { navigateTo } = useAppNavigation();

  const handleClick = () => {
    navigateTo(routes.menu);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Вернуться в меню"
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border dark:border-dark-border bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-sm font-medium">Меню</span>
    </button>
  );
};

export { BackToMenuButton }; 