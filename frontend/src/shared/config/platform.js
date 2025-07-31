/**
 * в разработке
 * Конфигурация платформ
 * Определяет текущую платформу и предоставляет константы для условной логики
 */

// Определение платформы
export const PLATFORM = {
  WEB: 'web',
  NATIVE: 'native',
};

// Текущая платформа
export const getCurrentPlatform = () => {
  // В будущем здесь будет логика определения React Native
  // if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
  //   return PLATFORM.NATIVE;
  // }
  return PLATFORM.WEB;
};

// Проверки платформы
export const isWeb = () => getCurrentPlatform() === PLATFORM.WEB;
export const isNative = () => getCurrentPlatform() === PLATFORM.NATIVE;

// Экспорт для удобства
export const currentPlatform = getCurrentPlatform(); 