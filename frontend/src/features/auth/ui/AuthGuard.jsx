/**
 * Компонент для защиты приватных роутов
 * Проверяет авторизацию и показывает соответствующий контент
 */

import { useEffect } from 'react';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { TelegramLoginButton } from './TelegramLoginButton';
import { Button } from '../../../shared/ui';

export const AuthGuard = ({ 
  children, 
  fallback = null,
  requireAuth = false,
  showLoginPrompt = true 
}) => {
  const {
    isAuthenticated,
    isLoading,
    handleTelegramWebAuth,
    validateToken,
    isTelegramWebApp
  } = useTelegramAuth();

  // Проверяем валидность токена при монтировании
  useEffect(() => {
    if (isAuthenticated) {
      validateToken();
    }
  }, [isAuthenticated, validateToken]);

  // Если идет загрузка
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary dark:text-dark-text-secondary">
            {isTelegramWebApp ? 'Авторизация через Telegram...' : 'Загрузка...'}
          </p>
        </div>
      </div>
    );
  }

  // Если требуется авторизация но пользователь не авторизован
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full p-6 bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-text-muted dark:text-dark-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">
              Требуется авторизация
            </h2>
            
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
              Для доступа к этому разделу необходимо войти в систему через Telegram
            </p>

            {showLoginPrompt && (
              <div className="space-y-4">
                <TelegramLoginButton
                  onAuth={handleTelegramWebAuth}
                  className="w-full"
                />
                
                {isTelegramWebApp && (
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">
                    Откройте приложение в Telegram для автоматической авторизации
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Если авторизация не требуется или пользователь авторизован
  return children;
};

// Компонент-обертка для страниц требующих авторизации
export const ProtectedRoute = ({ children }) => (
  <AuthGuard requireAuth={true}>
    {children}
  </AuthGuard>
);

// Компонент для отображения контента только для гостей
export const GuestOnly = ({ children, fallback = null }) => {
  const { isAuthenticated, isLoading } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return fallback;
  }

  return children;
}; 