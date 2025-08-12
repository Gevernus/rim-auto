/**
 * Платформо-независимые абстракции для работы с Telegram
 * Web: Telegram Web Apps SDK
 * React Native: Аналогичный API через нативные методы
 */

import { getItemSync, setItemSync, removeItemSync } from '../storage.js';

let tgWebApp = null;

// Захардкоженные данные для локальной отладки
const DEBUG_USER = {
  id: 123456789,
  first_name: "Иван",
  last_name: "Петров", 
  username: "ivan_petrov",
  photo_url: "https://ui-avatars.com/api/?name=Иван+Петров&background=random&color=fff&size=128",
  is_premium: false,
  language_code: "ru"
};

// Создаем валидный debug токен для отладки
const createDebugToken = () => {
  const debugUser = {
    id: DEBUG_USER.id,
    name: `${DEBUG_USER.first_name} ${DEBUG_USER.last_name}`,
    username: DEBUG_USER.username,
    avatar: DEBUG_USER.photo_url,
    telegram_id: DEBUG_USER.id,
    is_debug: true
  };
  
  // Создаем debug токен с правильным base64 кодированием
  const debugTokenData = {
    user: debugUser,
    debug: true,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 часа
  };
  
  const debugToken = btoa(unescape(encodeURIComponent(JSON.stringify(debugTokenData))));
  
  return debugToken;
};

const DEBUG_INIT_DATA = "user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22%D0%98%D0%B2%D0%B0%D0%BD%22%2C%22last_name%22%3A%22%D0%9F%D0%B5%D1%82%D1%80%D0%BE%D0%B2%22%2C%22username%22%3A%22ivan_petrov%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=" + Math.floor(Date.now() / 1000) + "&hash=debug_hash";

// Флаг для включения режима отладки
const DEBUG_MODE = import.meta.env.DEV && Boolean(getItemSync('telegram_debug_mode'));

// Инициализация Telegram WebApp
const initTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    tgWebApp = window.Telegram.WebApp;
    tgWebApp.ready();
    return true;
  }
  return false;
};

// Проверка доступности Telegram WebApp
export const isTelegramWebApp = () => {
  if (typeof window === 'undefined') return false;
  
  // В режиме отладки симулируем Telegram WebApp
  if (DEBUG_MODE) {
    return true;
  }
  
  const hasWebApp = Boolean(window.Telegram?.WebApp);
  if (!hasWebApp) return false;

  if (!tgWebApp) {
    initTelegramWebApp();
  }

  // Считаем, что мы действительно внутри Telegram только при наличии initData или user
  const hasInitData = Boolean(tgWebApp?.initData && tgWebApp.initData.length > 0) || Boolean(tgWebApp?.initDataUnsafe?.user);
  return hasInitData;
};

// Получение данных инициализации Telegram
export const getTelegramInitData = () => {
  // В режиме отладки возвращаем захардкоженные данные
  if (DEBUG_MODE) {
    return DEBUG_INIT_DATA;
  }
  
  if (!isTelegramWebApp()) return null;
  
  if (!tgWebApp) {
    initTelegramWebApp();
  }
  
  return tgWebApp?.initData || null;
};

// Получение пользователя из Telegram
export const getTelegramUser = () => {
  // В режиме отладки возвращаем захардкоженного пользователя
  if (DEBUG_MODE) {
    return DEBUG_USER;
  }
  
  if (!isTelegramWebApp()) return null;
  
  if (!tgWebApp) {
    initTelegramWebApp();
  }
  
  return tgWebApp?.initDataUnsafe?.user || null;
};

// Закрытие Telegram WebApp
export const closeTelegramWebApp = () => {
  if (isTelegramWebApp() && tgWebApp) {
    tgWebApp.close();
  }
};

// Показать главную кнопку
export const showTelegramMainButton = (text, onClick) => {
  if (!isTelegramWebApp() || !tgWebApp) return;
  
  tgWebApp.MainButton.text = text;
  tgWebApp.MainButton.show();
  tgWebApp.MainButton.onClick(onClick);
};

// Скрыть главную кнопку
export const hideTelegramMainButton = () => {
  if (!isTelegramWebApp() || !tgWebApp) return;
  
  tgWebApp.MainButton.hide();
};

// Показать уведомление
export const showTelegramAlert = (message) => {
  if (DEBUG_MODE) {
    alert(`[DEBUG] ${message}`);
    return;
  }
  
  if (!isTelegramWebApp() || !tgWebApp) {
    // Fallback для веба
    alert(message);
    return;
  }
  
  tgWebApp.showAlert(message);
};

// Проверить является ли пользователь премиум
export const isTelegramPremium = () => {
  const user = getTelegramUser();
  return Boolean(user?.is_premium);
};

// Утилиты для отладки
export const enableDebugMode = () => {
  if (typeof window !== 'undefined') {
    setItemSync('telegram_debug_mode', true);
    console.log('🧪 Telegram DEBUG MODE включен');
    console.log('🔄 Перезагрузите страницу для применения изменений');
  }
};

export const disableDebugMode = () => {
  if (typeof window !== 'undefined') {
    removeItemSync('telegram_debug_mode');
    console.log('🧪 Telegram DEBUG MODE выключен');
    console.log('🔄 Перезагрузите страницу для применения изменений');
  }
};

// Инициализация при загрузке
if (typeof window !== 'undefined') {
  // В режиме отладки не инициализируем реальный Telegram WebApp
  if (!DEBUG_MODE) {
    // Ждем загрузки Telegram WebApp SDK
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        initTelegramWebApp();
      } else {
        // Повторяем проверку через 100ms
        setTimeout(checkTelegram, 100);
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkTelegram);
    } else {
      checkTelegram();
    }
  }
} 

export const requestUserPhone = async () => {
  // DEBUG: возвращаем тестовый номер для локальной отладки
  if (DEBUG_MODE) {
    return { accepted: true, phone: "+79990000000", is_debug: true };
  }

  // Доступно только внутри Telegram WebApp
  if (!isTelegramWebApp()) {
    return { accepted: false, reason: "not_telegram" };
  }

  if (!tgWebApp) {
    initTelegramWebApp();
  }

  // Официальный API: Telegram.WebApp.requestContact(callback)
  if (tgWebApp?.requestContact) {
    return await new Promise((resolve) => {
      try {
        tgWebApp.requestContact((shared) => {
          // shared: boolean — поделился ли пользователь контактом
          resolve({ accepted: Boolean(shared) });
        });
      } catch (e) {
        console.error("requestContact error:", e);
        resolve({ accepted: false, reason: "request_error" });
      }
    });
  }

  // Нет поддержки метода
  return { accepted: false, reason: "unsupported" };
}; 