import { useBottomNav } from '../../shared/lib/bottom-nav/context';

const AlternateBottomNavigation = () => {
  const { config } = useBottomNav();
  if (!config) return null;

  const {
    chat: { onClick: onChatClick, label: chatLabel = 'Чат', icon: chatIcon } = {},
    call: { onClick: onCallClick, label: callLabel = 'Звонок', icon: callIcon } = {},
  } = config;

  const Button = ({ onClick, icon, label }) => (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ease-out group text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary"
    >
      {/* Индикатор сверху при наведении */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-full shadow-lg shadow-primary-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Иконка с эффектами */}
      <div className="relative mb-1 transition-all duration-300 group-hover:scale-105">
        {icon ?? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {/* Светящийся эффект */}
        <div className="absolute inset-0 bg-primary-500/10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300" />
      </div>

      {/* Текст */}
      <span className="text-xs font-bold transition-all duration-300 tracking-wide group-hover:scale-105">
        {label}
      </span>

      {/* Подсветка при наведении */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 via-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Фон с размытием и градиентом */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated/95 via-surface-elevated/90 to-surface-elevated/85 dark:from-dark-surface-elevated/95 dark:via-dark-surface-elevated/90 dark:to-dark-surface-elevated/85 backdrop-blur-2xl border-t border-border/30 dark:border-dark-border/30" />

      {/* Основной контейнер */}
      <div className="relative flex justify-around items-center h-20 px-4 gap-4">
        <Button onClick={onChatClick} icon={chatIcon ?? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )} label={chatLabel} />

        <Button onClick={onCallClick} icon={callIcon ?? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.7 2.8a2 2 0 01-.52 1.938l-1.3 1.3a16 16 0 006.364 6.364l1.3-1.3a2 2 0 011.938-.52l2.8.7A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.82 23 1 14.18 1 4V3a2 2 0 012-2h2z" />
          </svg>
        )} label={callLabel} />
      </div>

      {/* Дополнительная тень снизу с градиентом */}
      <div className="absolute inset-x-0 -bottom-1 h-2 bg-gradient-to-t from-black/20 via-black/10 to-transparent" />
    </nav>
  );
};

export { AlternateBottomNavigation }; 