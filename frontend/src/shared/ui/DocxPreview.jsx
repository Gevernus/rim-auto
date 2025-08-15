import { useRef, useState, useEffect } from 'react';
import { renderAsync } from 'docx-preview';
import './DocxPreview.css';

const DocxPreview = ({ url, className = '' }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем файл
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load document');
        
        let blob = await response.blob();
        
        // Проверяем размер файла
        if (blob.size === 0) {
          throw new Error('Файл пустой или поврежден');
        }
        
        // Fallback: принудительно устанавливаем правильный MIME тип для docx-preview
        if (blob.type === 'text/plain' || blob.type === '' || !blob.type.includes('word')) {
          blob = new Blob([blob], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
        }
        
        // Рендерим документ с мобильной оптимизацией
        await renderAsync(blob, containerRef.current, null, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: true, // Игнорируем фиксированную ширину для мобильной адаптации
          ignoreHeight: true, // Игнорируем фиксированную высоту для мобильной адаптации
          ignoreFonts: true, // Игнорируем шрифты для лучшей производительности
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          useBase64URL: true,
          experimental: true, // Включаем экспериментальные функции для лучшей адаптации
          // Добавляем настройки для мобильной адаптации
          renderLastRenderedPageBreak: false,
          ignoreLastRenderedPageBreak: true,
          // Убираем ограничения по ширине
          minLineWidth: 0,
          maxLineWidth: 0,
          // Убираем все ограничения по размеру
          width: 0,
          height: 0,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error rendering document:', err);
        
        // Улучшенная обработка ошибок
        let errorMessage = 'Ошибка загрузки документа';
        if (err.message.includes('end of central directory')) {
          errorMessage = 'Файл поврежден или не является валидным .docx документом';
        } else if (err.message.includes('Failed to load')) {
          errorMessage = 'Не удалось загрузить файл с сервера';
        } else if (err.message.includes('пустой')) {
          errorMessage = 'Файл пустой или поврежден';
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadDocument();
  }, [url]);

  if (!url) return null;

  return (
    <div className={`w-full border border-border dark:border-dark-border rounded-md overflow-hidden bg-surface-elevated dark:bg-dark-surface-elevated ${className}`}>
      {loading && (
        <div className="p-8 text-center text-text-secondary dark:text-dark-text-secondary">
          Загрузка документа...
        </div>
      )}
      
      {error && (
        <div className="p-8 text-center text-error-500 dark:text-error-400">
          Ошибка загрузки: {error}
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className={`${loading || error ? 'hidden' : ''} font-serif leading-relaxed text-gray-800 bg-white min-h-[400px] docx-container ${className}`}
        style={{ 
          minWidth: '100%',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      />
    </div>
  );
};

export { DocxPreview };
