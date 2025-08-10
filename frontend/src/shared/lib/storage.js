// Абстракция хранилища для миграции на React Native
// В веб-версии использует localStorage
// В RN версии будет использовать AsyncStorage

// Базовый интерфейс хранилища
class Storage {
  async setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  }

  async getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  }

  async clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  async getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }
}

export const storage = new Storage();

// Ключи для хранения данных
export const STORAGE_KEYS = {
  FAVORITES: 'favorites',
  CART: 'cart',
  USER_PREFERENCES: 'userPreferences',
  SEARCH_HISTORY: 'searchHistory',
  FILTERS: 'filters',
  THEME: 'theme',
};
// Синхронные helper-функции (веб): согласованные с JSON-сериализацией
export const setItemSync = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Storage setItemSync error:', error);
    return false;
  }
};

export const getItemSync = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    // Попытка прочитать примитив без JSON-обертки
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }
};

export const removeItemSync = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Storage removeItemSync error:', error);
    return false;
  }
};

export const clearSync = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Storage clearSync error:', error);
    return false;
  }
}; 