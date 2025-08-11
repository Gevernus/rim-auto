/**
 * Хук для работы с Telegram авторизацией
 * Обрабатывает бесшовную авторизацию из WebApp и веб-авторизацию
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '../../../shared/api/client';
import { 
  isTelegramWebApp, 
  getTelegramInitData, 
  getTelegramUser, 
  showTelegramAlert
} from '../../../shared/lib/platform/telegram';

export const useTelegramAuth = () => {
  const {
    // Состояние
    isAuthenticated,
    user,
    telegramUser,
    isLoading,
    isTelegramWebApp: isTelegramWebAppInStore,
    userName,
    userAvatar,
    authToken,

    // Методы стора
    setUser,
    setTelegramUser,
    logout: logoutStore,
    setLoading,
    initialize: initializeStore,
  } = useAuth();

  console.log('isTelegramWebApp', isTelegramWebApp());
  // Бесшовная авторизация при загрузке для Telegram WebApp
  const initTelegramAuth = useCallback(async () => {
    if (!isTelegramWebApp()) return;

    try {
      setLoading(true);
      
      const initData = getTelegramInitData();
      const tgUser = getTelegramUser();
      
      if (!initData || !tgUser) {
        console.log('Нет данных инициализации Telegram');
        return;
      }

      // Сохраняем данные Telegram пользователя
      setTelegramUser(tgUser, initData);

      // Всегда отправляем данные на backend для получения токена (в том числе в debug)
      const response = await apiClient.post('/auth/telegram-webapp', {
        initData,
        user: tgUser,
      });

      if (response.data.success) {
        // Устанавливаем пользователя и токен
        setUser(response.data.user, response.data.token);
        showTelegramAlert('Добро пожаловать!');
      } else {
        console.error('Ошибка авторизации:', response.data.message);
      }

    } catch (error) {
      console.error('Ошибка Telegram авторизации:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTelegramUser, setUser]);

  // Веб-авторизация через Telegram Login Widget
  const handleTelegramWebAuth = useCallback(async (telegramData) => {
    try {
      setLoading(true);

      // Отправляем данные с Telegram Login Widget на backend
      const response = await apiClient.post('/auth/telegram', telegramData);

      if (response.data.success) {
        // Устанавливаем пользователя и токен
        setUser(response.data.user, response.data.token);
        setTelegramUser(telegramData);
        
        console.log('✅ Авторизация успешна:', response.data);
        
        // Проверяем состояние после небольшой задержки
        setTimeout(() => {
          console.log('✅ Состояние auth после авторизации:', {
            isAuthenticated,
            user,
            token: authToken,
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
      setLoading(false);
    }
  }, [setLoading, setUser, setTelegramUser, isAuthenticated, user, authToken]);

  // Инициализация авторизации
  const initialize = useCallback(() => {
    // Инициализируем auth store
    initializeStore();
    
    // Если это Telegram WebApp - пытаемся авторизоваться
    if (isTelegramWebApp()) {
      // Не await — запуск в фоне
      initTelegramAuth();
    }
  }, [initializeStore, initTelegramAuth]);

  // Проверка валидности токена (всегда через backend)
  const validateToken = useCallback(async () => {
    if (!authToken) return false;

    try {
      const response = await apiClient.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      console.error('Ошибка валидации токена:', error);
      // Если токен невалидный - выходим
      if (error.response?.status === 401) {
        logoutStore();
      }
      return false;
    }
  }, [authToken, logoutStore]);

  // Выход из системы
  const logout = useCallback(async () => {
    try {
      // Уведомляем backend о выходе
      if (authToken) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      logoutStore();
    }
  }, [authToken, logoutStore]);

  return {
    // Состояние
    isAuthenticated,
    user,
    telegramUser,
    isLoading,
    isTelegramWebApp: isTelegramWebAppInStore,
    userName,
    userAvatar,
    
    // Методы
    handleTelegramWebAuth,
    validateToken,
    logout,
    initialize,
    
    // Автоинициализация для WebApp
    initTelegramAuth,
  };
}; 