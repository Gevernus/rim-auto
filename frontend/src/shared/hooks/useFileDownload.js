import { useState } from 'react';
import { openURL } from '../lib/platform';

export const useFileDownload = () => {
  const [downloading, setDownloading] = useState(false);

  const downloadFile = async (url, filename) => {
    if (!url) return;
    
    setDownloading(true);
    
    try {
      // Для мобильных устройств открываем файл в новой вкладке
      // Пользователь сможет скачать через меню браузера
      openURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return { downloadFile, downloading };
};
