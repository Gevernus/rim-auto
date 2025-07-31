import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

// Хук для работы с localStorage через нашу абстракцию
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  // Загрузка значения при монтировании
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await storage.getItem(key);
        if (storedValue !== null) {
          setValue(storedValue);
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Функция для обновления значения
  const updateValue = async (newValue) => {
    try {
      setValue(newValue);
      await storage.setItem(key, newValue);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  };

  // Функция для удаления значения
  const removeValue = async () => {
    try {
      setValue(initialValue);
      await storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  };

  return [value, updateValue, removeValue, loading];
}; 