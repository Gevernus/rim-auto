/**
 * Компонент профиля пользователя
 * Отображает информацию о пользователе и кнопку выхода
 */

import { useState } from 'react';
import { Button } from '../../../shared/ui';
import { useTelegramAuth } from '../hooks/useTelegramAuth';

export const UserProfile = ({ 
  className = '',
  showLogoutButton = true,
  compact = false 
}) => {
  const { 
    user, 
    telegramUser, 
    userName, 
    userAvatar, 
    logout, 
    isAuthenticated 
  } = useTelegramAuth();

  const [avatarError, setAvatarError] = useState(false);

  // Fallback аватар если основное изображение не загружается
  const getAvatarUrl = () => {
    if (avatarError || !userAvatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128`;
    }
    return userAvatar;
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className} ${compact ? 'text-sm' : ''}`}>
      {/* Аватар пользователя */}
      <div className="flex-shrink-0">
        <img
          src={getAvatarUrl()}
          alt={`Аватар ${userName}`}
          className={`rounded-full object-cover ${
            compact ? 'w-8 h-8' : 'w-10 h-10'
          }`}
          onError={handleAvatarError}
        />
      </div>

      {/* Информация о пользователе */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary dark:text-dark-text-primary truncate">
          {userName}
        </div>
        
        {!compact && (
          <div className="text-xs text-text-secondary dark:text-dark-text-secondary">
            {user?.telegram_id ? `ID: ${user.telegram_id}` : 'Telegram пользователь'}
          </div>
        )}
      </div>
      {console.log('🔍 showLogoutButton:', showLogoutButton)}
      {/* Кнопка выхода */}
      {showLogoutButton && (
        <Button
          variant="outline"
          size={compact ? 'sm' : 'md'}
          onClick={logout}
          className={`${compact ? 'text-xs px-2 py-1' : ''}`}
        >
          {compact ? 'Выйти' : 'Выйти'}
        </Button>
      )}
    </div>
  );
}; 