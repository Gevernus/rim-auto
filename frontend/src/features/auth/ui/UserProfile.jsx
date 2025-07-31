/**
 * Компонент профиля пользователя
 * Показывает аватар, имя и кнопку выхода
 */

import { useState } from 'react';
import { Button } from '../../../shared/ui';

export const UserProfile = ({ 
  user, 
  telegramUser, 
  onLogout, 
  className = '' 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = user?.name || telegramUser?.first_name || 'Пользователь';
  const displayLastName = user?.lastName || telegramUser?.last_name || '';
  const fullName = displayLastName ? `${displayName} ${displayLastName}` : displayName;
  const avatar = user?.avatar || telegramUser?.photo_url;
  const username = telegramUser?.username;

  const handleLogout = () => {
    setIsMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Аватар и имя пользователя */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
      >
        {/* Аватар */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          {avatar ? (
            <img 
              src={avatar} 
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback если аватар не загружается
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback аватар с инициалами */}
          <span 
            className="text-sm font-medium text-primary-600 dark:text-primary-400"
            style={{ display: avatar ? 'none' : 'flex' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Имя пользователя */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
            {displayName}
          </p>
          {username && (
            <p className="text-xs text-text-muted dark:text-dark-text-muted">
              @{username}
            </p>
          )}
        </div>

        {/* Стрелка вниз */}
        <svg 
          className={`w-4 h-4 text-text-secondary dark:text-dark-text-secondary transition-transform ${
            isMenuOpen ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isMenuOpen && (
        <>
          {/* Overlay для закрытия меню */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Меню */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-surface dark:bg-dark-surface rounded-lg shadow-lg border border-border dark:border-dark-border z-20">
            {/* Информация о пользователе */}
            <div className="p-4 border-b border-border dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-primary-600 dark:text-primary-400">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-text-primary dark:text-dark-text-primary">
                    {fullName}
                  </p>
                  {username && (
                    <p className="text-sm text-text-muted dark:text-dark-text-muted">
                      @{username}
                    </p>
                  )}
                  {telegramUser?.is_premium && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Действия */}
            <div className="p-2">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Выйти
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 