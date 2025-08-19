import { openURL, openPhoneDialer, buildTelegramUrl, buildWhatsAppUrl } from '../lib/platform';

const DesktopContactBar = ({ telegramUrl, whatsAppUrl, phone, className = '' }) => {
  const normalizedWhatsApp = whatsAppUrl ? buildWhatsAppUrl(whatsAppUrl) : '';
  const normalizedTelegram = telegramUrl ? buildTelegramUrl(telegramUrl) : '';

  const handleOpen = (url) => {
    if (!url) return;
    openURL(url);
  };

  const handleCall = (tel) => {
    if (!tel) return;
    openPhoneDialer(tel);
  };

  return (
    <div className={`hidden md:flex items-center justify-center gap-3 ${className}`}>
      {normalizedTelegram && (
        <button
          type="button"
          onClick={() => handleOpen(normalizedTelegram)}
          className="px-5 py-3 rounded-lg border border-blue-500/50 dark:border-blue-500/20 text-text-primary dark:text-dark-text-primary bg-surface-elevated dark:bg-dark-surface-elevated hover:bg-blue-500/50 dark:hover:bg-blue-500/20 transition-colors"
        >
          Написать в Telegram
        </button>
      )}
      {normalizedWhatsApp && (
        <button
          type="button"
          onClick={() => handleOpen(normalizedWhatsApp)}
          className="px-5 py-3 rounded-lg border border-green-500/50 dark:border-green-500/20 text-text-primary dark:text-dark-text-primary bg-surface-elevated dark:bg-dark-surface-elevated hover:bg-green-500/50 dark:hover:bg-green-500/20 transition-colors"
        >
          Написать в WhatsApp
        </button>
      )}
      {phone && (
        <button
          type="button"
          onClick={() => handleCall(phone)}
          className="px-5 py-3 rounded-lg border border-orange-500/50 dark:border-orange-500/20 text-text-primary dark:text-dark-text-primary bg-surface-elevated dark:bg-dark-surface-elevated hover:bg-orange-400/50 dark:hover:bg-orange-500/20 transition-colors"
        >
          Позвонить
        </button>
      )}
    </div>
  );
};

export { DesktopContactBar };


