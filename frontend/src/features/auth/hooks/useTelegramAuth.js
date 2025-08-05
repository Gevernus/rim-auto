/**
 * Хук для работы с Telegram авторизацией
 * Обрабатывает бесшовную авторизацию из WebApp и веб-авторизацию
 */

import { useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '../../../shared/api/client';
import { 
  isTelegramWebApp, 
  getTelegramInitData, 
  getTelegramUser, 
  showTelegramAlert,
  enableDebugMode,
  disableDebugMode
} from '../../../shared/lib/platform/telegram';

export const useTelegramAuth = () => {
  const auth = useAuth();

  // Бесшовная авторизация при загрузке для Telegram WebApp
  const initTelegramAuth = async () => {
    if (!isTelegramWebApp()) return;

    try {
      auth.setLoading(true);
      
      const initData = getTelegramInitData();
      const telegramUser = getTelegramUser();
      
      if (!initData || !telegramUser) {
        console.log('Нет данных инициализации Telegram');
        return;
      }

      // Сохраняем данные Telegram пользователя
      auth.setTelegramUser(telegramUser, initData);

      // Проверяем debug режим
      const isDebugMode = import.meta.env.DEV && localStorage.getItem('telegram_debug_mode') === 'true';
      
      if (isDebugMode) {
        // В debug режиме создаем локальный токен без обращения к backend
        const debugUser = {
          id: telegramUser.id,
          name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`,
          username: telegramUser.username,
          avatar: telegramUser.photo_url,
          telegram_id: telegramUser.id,
          is_debug: true
        };
        
        // Создаем debug токен с правильным base64 кодированием
        const debugTokenData = {
          user: debugUser,
          debug: true,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        };
        
        const debugToken = btoa(unescape(encodeURIComponent(JSON.stringify(debugTokenData))));
        
        // Устанавливаем debug пользователя и токен
        auth.setUser(debugUser, debugToken);
        console.log('✅ Debug авторизация успешна:', debugUser);
        return;
      }

      // Отправляем данные на backend для проверки и получения токена
      const response = await apiClient.post('/auth/telegram-webapp', {
        initData,
        user: telegramUser,
      });

      if (response.data.success) {
        // Устанавливаем пользователя и токен
        auth.setUser(response.data.user, response.data.token);
        showTelegramAlert('Добро пожаловать!');
      } else {
        console.error('Ошибка авторизации:', response.data.message);
      }

    } catch (error) {
      console.error('Ошибка Telegram авторизации:', error);
    } finally {
      auth.setLoading(false);
    }
  };

  // Веб-авторизация через Telegram Login Widget
  const handleTelegramWebAuth = useCallback(async (telegramData) => {
    try {
      auth.setLoading(true);

      // Отправляем данные с Telegram Login Widget на backend
      const response = await apiClient.post('/auth/telegram-web', telegramData);

      if (response.data.success) {
        // Устанавливаем пользователя и токен
        auth.setUser(response.data.user, response.data.token);
        auth.setTelegramUser(telegramData);
        
        console.log('✅ Авторизация успешна:', response.data);
        
        // Проверяем состояние после небольшой задержки
        setTimeout(() => {
          console.log('✅ Состояние auth после авторизации:', {
            isAuthenticated: auth.isAuthenticated,
            user: auth.user,
            token: auth.authToken
          });
        }, 200);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Ошибка авторизации' 
        };
      }

    } catch (error) {
      console.error('Ошибка веб-авторизации:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Ошибка подключения' 
      };
    } finally {
      auth.setLoading(false);
    }
  }, [auth]);

  // Инициализация авторизации
  const initialize = () => {
    // Инициализируем auth store
    auth.initialize();
    
    // Если это Telegram WebApp - пытаемся авторизоваться
    if (isTelegramWebApp()) {
      initTelegramAuth();
    }
  };

  // Проверка валидности токена
  const validateToken = useCallback(async () => {
    if (!auth.authToken) return false;

    try {
      // Проверяем debug режим
      const isDebugMode = import.meta.env.DEV && localStorage.getItem('telegram_debug_mode') === 'true';
      
      if (isDebugMode) {
        // В debug режиме проверяем токен локально
        try {
          // Безопасное декодирование base64
          const decodedToken = decodeURIComponent(escape(atob(auth.authToken)));
          const tokenData = JSON.parse(decodedToken);
          
          // Проверяем структуру токена
          if (!tokenData.user || !tokenData.debug || !tokenData.exp) {
            console.error('❌ Неверная структура debug токена');
            auth.logout();
            return false;
          }
          
          const isExpired = tokenData.exp < Math.floor(Date.now() / 1000);
          
          if (isExpired) {
            console.log('❌ Debug токен истек');
            auth.logout();
            return false;
          }
          
          console.log('✅ Debug токен валиден');
          return true;
        } catch (error) {
          console.error('❌ Ошибка парсинга debug токена:', error);
          // Если токен поврежден - выходим
          auth.logout();
          return false;
        }
      }

      const response = await apiClient.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      console.error('Ошибка валидации токена:', error);
      // Если токен невалидный - выходим
      if (error.response?.status === 401) {
        auth.logout();
      }
      return false;
    }
  }, [auth]);

  // Выход из системы
  const logout = useCallback(async () => {
    try {
      // Уведомляем backend о выходе
      if (auth.authToken) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      auth.logout();
    }
  }, [auth]);

  return {
    // Состояние
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    telegramUser: auth.telegramUser,
    isLoading: auth.isLoading,
    isTelegramWebApp: auth.isTelegramWebApp,
    userName: auth.userName,
    userAvatar: auth.userAvatar,
    
    // Методы
    handleTelegramWebAuth,
    validateToken,
    logout,
    initialize,
    
    // Автоинициализация для WebApp
    initTelegramAuth,
  };
}; 