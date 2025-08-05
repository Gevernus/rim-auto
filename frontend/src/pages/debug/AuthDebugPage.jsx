/**
 * Страница отладки авторизации
 * Простая отладка с Telegram Debug Mode
 */

import { useState } from 'react';
import { useTelegramAuth } from '../../features/auth';
import { Button } from '../../shared/ui';
import { enableDebugMode, disableDebugMode } from '../../shared/lib/platform/telegram';

export const AuthDebugPage = () => {
  const {
    isAuthenticated,
    user,
    telegramUser,
    isLoading,
    isTelegramWebApp,
    userName,
    userAvatar
  } = useTelegramAuth();

  const [telegramDebugMode, setTelegramDebugMode] = useState(
    typeof window !== 'undefined' && localStorage.getItem('telegram_debug_mode') === 'true'
  );

  const toggleTelegramDebug = () => {
    if (telegramDebugMode) {
      disableDebugMode();
      setTelegramDebugMode(false);
      alert('Telegram Debug Mode выключен.\nПерезагрузите страницу для применения изменений.');
    } else {
      enableDebugMode();
      setTelegramDebugMode(true);
      alert('Telegram Debug Mode включен.\nПерезагрузите страницу для применения изменений.');
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text-primary dark:text-dark-text-primary">
          🔧 Отладка авторизации
        </h1>

        {/* Статус */}
        <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 mb-6 border border-border dark:border-dark-border">
          <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-dark-text-primary">
            Текущий статус
          </h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Авторизован:</span>
              <p className={`font-bold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? 'Да' : 'Нет'}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Telegram WebApp:</span>
              <p className={`font-bold ${isTelegramWebApp ? 'text-blue-600' : 'text-gray-600'}`}>
                {isTelegramWebApp ? 'Да' : 'Нет'}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Telegram Debug:</span>
              <p className={`font-bold ${telegramDebugMode ? 'text-orange-600' : 'text-gray-600'}`}>
                {telegramDebugMode ? 'Включен' : 'Выключен'}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-text-secondary dark:text-dark-text-secondary">Пользователь:</span>
              <p className="font-bold text-text-primary dark:text-dark-text-primary">
                {userName || 'Не найден'}
              </p>
            </div>
          </div>
          
          {/* Debug информация */}
          {telegramDebugMode && isAuthenticated && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Debug режим активен</strong> - используется локальный токен авторизации.
                Страница заказа должна открываться без проблем.
              </p>
              
              {/* Отображение debug токена */}
              <details className="mt-3">
                <summary className="text-xs text-orange-600 dark:text-orange-400 cursor-pointer">
                  Показать debug токен
                </summary>
                <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-800 rounded text-xs font-mono break-all">
                  {localStorage.getItem('authToken') || 'Токен не найден'}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Управление */}
        <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 mb-6 border border-border dark:border-dark-border">
          <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-dark-text-primary">
            Управление
          </h2>
          
          <div className="flex gap-4">
            <Button 
              onClick={toggleTelegramDebug} 
              variant={telegramDebugMode ? "outline" : "primary"}
            >
              {telegramDebugMode ? 'Выключить Telegram Debug' : 'Включить Telegram Debug'}
            </Button>
            
            {telegramDebugMode !== (localStorage.getItem('telegram_debug_mode') === 'true') && (
              <Button onClick={reloadPage} variant="outline">
                Перезагрузить страницу
              </Button>
            )}
            
            <Button 
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('telegramInitData');
                window.location.reload();
              }} 
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Очистить токены
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Telegram Debug Mode</strong> включает тестового пользователя для локальной отладки.
              После включения/выключения необходимо перезагрузить страницу.
            </p>
          </div>
        </div>

        {/* Данные пользователя */}
        {(user || telegramUser) && (
          <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 border border-border dark:border-dark-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-dark-text-primary">
              Данные пользователя
            </h2>
            
            <div className="space-y-4">
              {user && (
                <div>
                  <h3 className="font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
                    Пользователь (БД):
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
              
              {telegramUser && (
                <div>
                  <h3 className="font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
                    Telegram пользователь:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(telegramUser, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 