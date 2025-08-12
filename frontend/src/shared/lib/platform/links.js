import { isTelegramWebApp } from './telegram.js';

// Открыть внешний URL платформо-независимо
export const openURL = (url, options = {}) => {
  if (!url) return;

  // Telegram WebApp
  if (isTelegramWebApp()) {
    try {
      window.Telegram.WebApp.openLink(url, { try_instant_view: false, same_window: false });
      return;
    } catch (_) {
      // fallthrough to web
    }
  }

  // Web: безопасное открытие
  if (typeof window !== 'undefined') {
    const target = options.target || '_blank';
    const newWin = window.open(url, target, 'noopener,noreferrer');
    if (newWin) newWin.opener = null;
  }
};

// Открыть телефонный наборщик
export const openPhoneDialer = (phone) => {
  if (!phone) return;
  const telUrl = `tel:${phone}`;

  // В TWA также открываем через openLink
  if (isTelegramWebApp() && typeof window !== 'undefined' && window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.openLink(telUrl, { same_window: true });
      return;
    } catch (_) {
      // fallthrough
    }
  }

  if (typeof window !== 'undefined') {
    window.location.href = telUrl;
  }
}; 