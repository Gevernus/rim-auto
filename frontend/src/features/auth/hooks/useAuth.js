/**
 * Хук для управления состоянием авторизации
 * Поддерживает Telegram WebApp и веб-авторизацию
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStorageItem, setStorageItem, removeStorageItem } from '../../../shared/lib/platform';

// Store для состояния авторизации
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Состояние
      isAuthenticated: false,
      user: null,
      telegramUser: null,
      authToken: null,
      isLoading: false,
      isTelegramWebApp: false,

      // Действия
      setUser: (user, token) => {
        set({
          isAuthenticated: true,
          user,
          authToken: token,
        });
        
        // Сохраняем токен в storage
        if (token) {
          setStorageItem('authToken', token);
        }
      },

      setTelegramUser: (telegramUser, initData) => {
        set({
          telegramUser,
          isTelegramWebApp: true,
        });
        
        // Сохраняем данные Telegram
        if (initData) {
          setStorageItem('telegramInitData', initData);
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          telegramUser: null,
          authToken: null,
          isTelegramWebApp: false,
        });
        
        // Очищаем storage
        removeStorageItem('authToken');
        removeStorageItem('telegramInitData');
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Инициализация из storage
      initialize: () => {
        const token = getStorageItem('authToken');
        const telegramInitData = getStorageItem('telegramInitData');
        
        if (token) {
          set({ authToken: token });
        }
        
        if (telegramInitData) {
          set({ isTelegramWebApp: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Сохраняем только необходимые поля
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        telegramUser: state.telegramUser,
        authToken: state.authToken,
        isTelegramWebApp: state.isTelegramWebApp,
      }),
    }
  )
);

// Хук для использования в компонентах
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    // Состояние
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    telegramUser: store.telegramUser,
    authToken: store.authToken,
    isLoading: store.isLoading,
    isTelegramWebApp: store.isTelegramWebApp,
    
    // Действия
    setUser: store.setUser,
    setTelegramUser: store.setTelegramUser,
    logout: store.logout,
    setLoading: store.setLoading,
    initialize: store.initialize,
    
    // Вычисляемые значения
    isGuest: !store.isAuthenticated,
    userName: store.user?.name || store.telegramUser?.first_name || 'Гость',
    userAvatar: store.user?.avatar || store.telegramUser?.photo_url,
  };
}; 