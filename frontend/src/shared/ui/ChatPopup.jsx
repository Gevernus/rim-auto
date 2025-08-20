import { Popup } from './Popup';
import { openURL } from '../lib/platform';

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.878 7.646c-.184 2.066-1.006 7.082-1.425 9.39-.176.945-.523 1.263-.859 1.295-.729.067-1.282-.482-1.987-.946-1.104-.727-1.727-1.179-2.796-1.885-1.237-.814-.435-1.262.27-1.991.185-.193 3.393-3.111 3.456-3.379.007-.033.014-.155-.058-.22-.072-.064-.178-.042-.255-.025-.108.024-1.832 1.166-5.167 3.424-.49.336-.934.5-1.33.49-.438-.01-1.28-.247-1.906-.451-.767-.249-1.374-.381-1.322-.803.027-.222.334-.45.918-.685 3.6-1.566 6-2.597 7.2-3.092 3.43-1.425 4.142-1.671 4.607-1.679.102-.002.33.023.478.142.125.1.162.236.179.366.015.118.04.371.006.645z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.62-6.003C.122 5.281 5.403 0 12.057 0c3.17 0 6.155 1.237 8.4 3.482A11.79 11.79 0 0123.514 12c0 6.654-5.281 11.936-11.936 11.936h-.006a11.9 11.9 0 01-6.002-1.62L.057 24zm6.597-3.807c1.72 1.02 3.68 1.558 5.708 1.559h.005c5.448 0 9.886-4.434 9.893-9.885.003-2.64-1.026-5.122-2.895-6.99A9.82 9.82 0 0012.06 1.04c-5.45 0-9.885 4.434-9.885 9.884a9.84 9.84 0 001.555 5.652l-.999 3.648 3.923-1.011zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.03-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.521.074-.793.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.41.248-.694.248-1.29.173-1.41z"/>
  </svg>
);

const ChatPopup = ({
  isOpen,
  onClose,
  telegramUrl,
  whatsAppUrl,
  title = 'Связаться',
}) => {
  const handleOpen = (url) => {
    if (!url) return;
    openURL(url);
    onClose?.();
  };

  return (
    <Popup 
      isOpen={isOpen}
      onClose={onClose}
      align="center"
      mobileFullScreen={true}
    >
      <div className="space-y-4 h-full md:h-auto flex flex-col">
        <div className="flex items-center justify-between md:hidden border-b border-border dark:border-dark-border pb-4 mb-4">
          <h4 className="font-medium text-text-primary dark:text-dark-text-primary">{title}</h4>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 md:flex-none">
          <h4 className="font-medium text-text-primary dark:text-dark-text-primary hidden md:block">{title}</h4>
          <div className={`grid ${telegramUrl && whatsAppUrl ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mt-2`}>
            {telegramUrl && (
              <button
                type="button"
                onClick={() => handleOpen(telegramUrl)}
                className="flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-md border border-blue-500/50 dark:border-blue-500/20 text-text-primary dark:text-dark-text-primary bg-surface-elevated dark:bg-dark-surface-elevated hover:bg-blue-500/50 dark:hover:bg-blue-500/20"
              >
                <TelegramIcon />
                <span>Telegram</span>
              </button>
            )}
            {whatsAppUrl && (
              <button
                type="button"
                onClick={() => handleOpen(whatsAppUrl)}
                className="flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-md border border-green-500/50 dark:border-green-500/20 text-text-primary dark:text-dark-text-primary bg-surface-elevated dark:bg-dark-surface-elevated hover:bg-green-500/50 dark:hover:bg-green-500/20"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 md:pt-2 md:hidden">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 md:py-2 border border-primary-800 dark:border-primary-500 text-primary-600 hover:text-text-primary hover:dark:text-dark-text-primary rounded-md bg-surface-elevated dark:bg-dark-surface-elevated hover:bg-primary-500 dark:hover:bg-primary-900/20 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Popup>
  );
};

export { ChatPopup };


