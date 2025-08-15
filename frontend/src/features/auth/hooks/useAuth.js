/**
 * Хук для управления состоянием авторизации
 * Поддерживает Telegram WebApp и веб-авторизацию
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage, getItemSync } from '../../../shared/lib/storage.js';

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
          storage.setItem('authToken', token);
        }
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        }));
      },

      setTelegramUser: (telegramUser, initData) => {
        set({
          telegramUser,
          isTelegramWebApp: true,
        });
        
        // Сохраняем данные Telegram
        if (initData) {
          storage.setItem('telegramInitData', initData);
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
        storage.removeItem('authToken');
        storage.removeItem('telegramInitData');
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Инициализация из storage
      initialize: () => {
        const token = getItemSync('authToken');
        const telegramInitData = getItemSync('telegramInitData');
        
        if (token) {
          set({ 
            authToken: token,
            isAuthenticated: true // Добавляем это поле
          });
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
    updateUser: store.updateUser,
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