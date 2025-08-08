import { useState } from 'react';

// Иконка для отсутствующих изображений
const PhotoIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
    />
  </svg>
);

/**
 * Галерея изображений с превью и основным изображением
 * @param {Object} props
 * @param {string[]} props.images - Массив URL изображений
 * @param {string} props.alt - Альтернативный текст для изображений
 * @param {string} props.className - Дополнительные CSS классы
 */
const ImageGallery = ({
  images = [],
  alt = '',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      goToPrevious();
    } else if (event.key === 'ArrowRight') {
      goToNext();
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center text-text-secondary dark:text-text-muted">
          <PhotoIcon className="w-16 h-16 mx-auto mb-2" />
          <p>Изображение недоступно</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const hasError = imageError[currentIndex];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Основное изображение */}
      <div 
        className="relative bg-surface dark:bg-dark-surface rounded-lg aspect-video overflow-hidden group"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {!hasError ? (
          <img
            src={currentImage}
            alt={`${alt} - изображение ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => handleImageError(currentIndex)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary dark:text-text-muted">
            <div className="text-center">
              <PhotoIcon className="w-16 h-16 mx-auto mb-2" />
              <p>Изображение не найдено</p>
            </div>
          </div>
        )}

        {/* Навигационные кнопки */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 rounded-full p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Предыдущее изображение"
            >
              <svg className="w-5 h-5 text-text-primary dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 rounded-full p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Следующее изображение"
            >
              <svg className="w-5 h-5 text-text-primary dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Индикатор текущего изображения */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-primary-600' 
                    : 'bg-text-muted dark:bg-dark-text-muted hover:bg-text-secondary dark:hover:bg-dark-text-secondary'
                }`}
                aria-label={`Перейти к изображению ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-primary-600 ring-offset-2' 
                  : 'border border-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              aria-label={`Показать изображение ${index + 1}`}
            >
              <img
                src={image}
                alt={`${alt} - изображение ${index + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { ImageGallery }; 