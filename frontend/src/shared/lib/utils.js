/**
 * Форматирует число в сокращенный вид для мобильных устройств
 * @param {number|string} value - Число для форматирования
 * @returns {string} Отформатированная строка
 */
export const formatCompactPrice = (value) => {
  if (!value) return '';
  
  const num = parseInt(value);
  if (isNaN(num)) return '';
  
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(1);
    // Убираем .0 если число целое
    return `${millions.replace('.0', '')}млн`;
  } else if (num >= 1000) {
    const thousands = (num / 1000).toFixed(0);
    return `${thousands} тыс`;
  }
  
  return num.toString();
};

/**
 * Форматирует цену в полном виде с символом рубля
 * @param {number|string} value - Число для форматирования
 * @returns {string} Отформатированная строка
 */
export const formatFullPrice = (value) => {
  if (!value) return '';
  
  const num = parseInt(value);
  if (isNaN(num)) return '';
  
  return `${num.toLocaleString()} ₽`;
};
