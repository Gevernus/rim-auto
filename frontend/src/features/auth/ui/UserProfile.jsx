/**
 * Компонент профиля пользователя с выпадающим меню
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../shared/ui';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { requestUserPhone, showTelegramAlert } from '../../../shared/lib/platform/telegram.js';
import { authApi } from '../../../shared/api/client.js';

export const UserProfile = ({
  className = '',
  showLogoutButton = true,
  compact = false,
}) => {
  const {
    user,
    userName,
    userAvatar,
    logout,
    isAuthenticated,
    isTelegramWebApp,
  } = useTelegramAuth();

  const [avatarError, setAvatarError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const getAvatarUrl = () => {
    if (avatarError || !userAvatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128`;
    }
    return userAvatar;
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isOpen) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' || e.key === ' ') setIsOpen((v) => !v);
  };

  const handleRequestPhone = async () => {
    try {
      if (isTelegramWebApp) {
        const res = await requestUserPhone();
        if (res?.phone) {
          await authApi.savePhone(res.phone);
          showTelegramAlert(user?.phone ? 'Номер телефона обновлен' : 'Номер телефона сохранен');
          return;
        }
        if (res?.accepted) {
          showTelegramAlert('Подтвердите отправку номера в Telegram. Номер сохранится автоматически.');
          return;
        }
        showTelegramAlert('Не удалось запросить номер автоматически. Введите его вручную.');
      }

      const manual = window.prompt('Введите номер телефона', user?.phone || '');
      if (manual && manual.trim().length > 5) {
        await authApi.savePhone(manual.trim());
        showTelegramAlert(user?.phone ? 'Номер телефона обновлен' : 'Номер телефона сохранен');
      }
    } catch (err) {
      console.error(err);
      showTelegramAlert('Ошибка при сохранении номера');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const hasPhone = Boolean(user?.phone && String(user.phone).trim().length > 0);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 rounded-full px-2 py-1 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors ${compact ? 'text-sm' : ''}`}
      >
        <img
          src={getAvatarUrl()}
          alt={`Аватар ${userName}`}
          className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover`}
          onError={handleAvatarError}
        />
        <span className="hidden md:inline text-text-primary dark:text-dark-text-primary font-medium max-w-[160px] truncate">
          {userName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-text-secondary dark:text-dark-text-secondary"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg border border-border dark:border-dark-border bg-surface-elevated dark:bg-dark-surface-elevated shadow-lg focus:outline-none"
        >
          {/* Шапка меню с пользователем */}
          <div className="flex items-center gap-3 p-3 border-b border-border dark:border-dark-border">
            <img
              src={getAvatarUrl()}
              alt={`Аватар ${userName}`}
              className="w-10 h-10 rounded-full object-cover"
              onError={handleAvatarError}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text-primary dark:text-dark-text-primary truncate">{userName}</div>
              <div className="text-xs text-text-secondary dark:text-dark-text-secondary truncate">
                {user?.username ? `@${user.username}` : user?.telegram_id ? `ID: ${user.telegram_id}` : 'Telegram пользователь'}
              </div>
            </div>
          </div>

          {/* Информация */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary dark:text-dark-text-secondary">Телефон</span>
              <span className="text-sm text-text-primary dark:text-dark-text-primary">
                {user?.phone || 'Не добавлен'}
              </span>
            </div>
          </div>

          {/* Действия */}
          <div className="p-3 pt-0 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleRequestPhone}
            >
              {hasPhone ? 'Изменить телефон' : 'Добавить телефон'}
            </Button>

            {showLogoutButton && (
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={logout}
              >
                Выйти
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 