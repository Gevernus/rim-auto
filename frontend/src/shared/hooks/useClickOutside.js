import { useEffect, useRef } from 'react';

/**
 * Хук для обработки кликов вне элемента
 * @param {Function} callback - Функция, вызываемая при клике вне элемента
 * @returns {React.RefObject} - Реф для элемента
 */
export const useClickOutside = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    // Добавляем слушатель на документ
    document.addEventListener('mousedown', handleClickOutside);
    
    // Очищаем слушатель при размонтировании
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}; 