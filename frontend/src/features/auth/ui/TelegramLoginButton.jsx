/**
 * Компонент кнопки авторизации через Telegram
 * Для веб-пользователей (не Telegram WebApp)
 */

import { useEffect, useRef } from 'react';
import { Button } from '../../../shared/ui';
import { useTelegramAuth } from '../hooks/useTelegramAuth';

export const TelegramLoginButton = ({ 
  onAuth, 
  buttonSize = 'large',
  cornerRadius = 8,
  className = '',
  disabled = false,
  compact = false // Новый проп для компактного режима
}) => {
  const containerRef = useRef(null);
  const { isAuthenticated, isTelegramWebApp: inTelegramWebApp } = useTelegramAuth();

  // Важные значения окружения
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const authUrl = `${apiBase.replace(/\/$/, '')}/auth/telegram`;
  console.log('🔍 botUsername:', botUsername);

  useEffect(() => {
    // Не показываем виджет если внутри Telegram WebApp или если disabled
    if (inTelegramWebApp || disabled) return;

    // Без bot username виджет не будет работать
    if (!botUsername) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[TelegramLoginButton] Missing VITE_TELEGRAM_BOT_USERNAME. Configure your bot username in .env');
      }
      return;
    }

    // Создаем скрипт для Telegram Login Widget
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-corner-radius', cornerRadius.toString());
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    // Настраиваем серверную валидацию подписи через backend
    script.setAttribute('data-auth-url', authUrl);
    script.async = true;

    // Обработчик авторизации (fallback, если не используем data-auth-url)
    window.onTelegramAuth = (user) => {
      if (onAuth) {
        onAuth(user);
      }
    };

    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    // Добавляем скрипт в контейнер
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Dev-подсказка по ошибке Bot domain invalid
    if (import.meta.env.DEV) {
      const host = window.location.hostname;
      // eslint-disable-next-line no-console
      console.info('[TelegramLoginButton] Current host:', host, 'Auth URL:', authUrl);
      // eslint-disable-next-line no-console
      console.info('[TelegramLoginButton] If you see "Bot domain invalid": add your domain to BotFather → Bot Settings → Domain for Login. Use HTTPS public domain (or ngrok) in dev.');
    }

    // Очистка при размонтировании
    return () => {
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script);
      }
      delete window.onTelegramAuth;
    };
  }, [onAuth, buttonSize, cornerRadius, disabled, inTelegramWebApp, botUsername, authUrl]);

  // Если это Telegram WebApp и пользователь авторизован
  if (inTelegramWebApp && isAuthenticated) {
    return (
      <div className={`text-center p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg ${compact ? 'text-xs' : 'text-sm'}`}>
        <p className="text-text-secondary dark:text-dark-text-secondary">
          {compact ? 'Авторизован' : 'Вы авторизованы через Telegram WebApp'}
        </p>
      </div>
    );
  }

  // Если это Telegram WebApp и пользователь НЕ авторизован — предлагаем открыть бота
  if (inTelegramWebApp && !isAuthenticated) {
    const fallbackUsername = botUsername || 'rim_auto_bot';
    return (
      <Button 
        variant="outline"
        size={compact ? 'sm' : 'md'}
        className={`flex items-center gap-2 ${className} ${compact ? 'text-xs px-3 py-1.5' : ''}`}
        disabled={disabled}
        onClick={() => {
          window.open(`https://t.me/${fallbackUsername}`, '_blank');
        }}
      >
        <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.379 2.655-1.407 3.119-2.29 3.119-.751 0-1.29-.387-1.29-1.119 0-.453.129-.813.129-1.413 0-1.633-1.149-2.273-2.59-2.273-1.441 0-2.59.64-2.59 2.273 0 .6.129.96.129 1.413 0 .732-.539 1.119-1.29 1.119-.883 0-1.911-.464-2.29-3.119 0 0-.727-4.87-.896-6.728-.133-1.467.393-2.16 1.799-2.16h6.45c1.406 0 1.932.693 1.799 2.16z"/>
        </svg>
        {compact ? 'Открыть в Telegram' : 'Открыть бота в Telegram'}
      </Button>
    );
  }

  // Обычный веб — рендерим виджет Telegram Login
  // Если нет botUsername — подсказка в dev
  if (!botUsername && import.meta.env.DEV) {
    return (
      <div className={`text-xs text-error-600 ${className}`}>
        Укажите VITE_TELEGRAM_BOT_USERNAME в .env для Login Widget
      </div>
    );
  }

  return (
    <div className={`telegram-login-container ${className} ${compact ? 'scale-90' : ''}`}>
      {/* Контейнер для Telegram Widget */}
      <div ref={containerRef} className="telegram-widget-container" />
      {disabled && (
        <div className="absolute inset-0 bg-surface dark:bg-dark-surface opacity-50 rounded-lg" />
      )}
    </div>
  );
}; 