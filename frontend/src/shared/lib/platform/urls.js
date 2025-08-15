/**
 * Платформо-независимые абстракции для работы с URL
 */

/**
 * Получает базовый URL для API
 * @returns {string} Базовый URL без /api
 */
export const getApiBaseUrl = () => {
  // В будущем для React Native здесь будет другая логика
  return (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');
};

/**
 * Строит абсолютный URL из относительного
 * @param {string} relativeUrl - Относительный URL (например, /static/contracts/file.docx)
 * @returns {string} Абсолютный URL
 */
export const buildAbsoluteUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  
  // Если уже абсолютный URL
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }
  
  // Строим абсолютный URL
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${relativeUrl}`;
};

/**
 * Проверяет, является ли URL абсолютным
 * @param {string} url - URL для проверки
 * @returns {boolean}
 */
export const isAbsoluteUrl = (url) => {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
};
