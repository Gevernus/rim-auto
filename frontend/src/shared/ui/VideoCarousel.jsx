import { useMemo, useRef, useState, useCallback } from 'react';
import { Carousel } from './Carousel';
import { VideoPlayer } from './VideoPlayer';

// Карусель видео на базе платформо-независимого Carousel
// items: Array<{ src: string, poster?: string, title?: string }>
const VideoCarousel = ({
  items = [],
  autoPlayActive = true,
  muted = true,
  showNavigation = true,
  showPagination = true,
  className = '',
  onVideoError,
  fallbackContent,
  autoAdvance = false, // Автопрокрутка на следующее видео по окончании
  ...props
}) => {
  const videoRefs = useRef([]);
  const [errorVideos, setErrorVideos] = useState(new Set());
  const swiperRef = useRef(null);

  const preparedItems = useMemo(() => items.map((item, index) => ({
    key: item.key ?? index,
    src: item.src,
    poster: item.poster,
    title: item.title,
  })), [items]);

  const handleSlideChange = useCallback((swiper) => {
    const newIndex = swiper.activeIndex;
    
    // Пауза всех видео кроме активного
    videoRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      if (idx === newIndex) {
        if (autoPlayActive && !errorVideos.has(idx)) {
          ref.play?.();
        }
      } else {
        ref.pause?.();
        ref.reset?.();
      }
    });
  }, [autoPlayActive, errorVideos]);

  const handleVideoError = useCallback((videoIndex, errorData) => {
    console.warn(`Video error in carousel at index ${videoIndex}:`, errorData);
    
    setErrorVideos(prev => new Set([...prev, videoIndex]));
    
    if (onVideoError) {
      onVideoError(videoIndex, errorData);
    }
  }, [onVideoError]);

  // Обработчик окончания видео для автопрокрутки
  const handleVideoEnded = useCallback((videoIndex) => {
    console.log(`Video ended at index ${videoIndex}, autoAdvance: ${autoAdvance}, items length: ${items.length}`);
    
    if (autoAdvance && videoIndex < items.length - 1 && swiperRef.current) {
      // Переключаемся на следующее видео через Swiper API
      const nextIndex = videoIndex + 1;
      console.log(`Video ${videoIndex} ended, advancing to ${nextIndex}`);
      
      try {
        // Используем Swiper API для переключения
        if (swiperRef.current.swiper) {
          console.log('Swiper instance found, calling slideTo:', nextIndex);
          swiperRef.current.swiper.slideTo(nextIndex);
        } else {
          console.warn('Swiper instance not found');
        }
      } catch (error) {
        console.warn('Failed to advance to next slide:', error);
      }
    } else {
      console.log('Auto advance conditions not met:', {
        autoAdvance,
        videoIndex,
        itemsLength: items.length,
        hasSwiperRef: !!swiperRef.current
      });
    }
  }, [autoAdvance, items.length]);

  const renderVideoItem = useCallback((item, index) => {
    const hasError = errorVideos.has(index);
    
    // Если видео с ошибкой, показываем fallback
    if (hasError) {
      return (
        <div className="aspect-video bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg flex items-center justify-center">
          {fallbackContent ? (
            fallbackContent(item, index)
          ) : (
            <div className="text-center text-text-secondary p-4">
              <p className="mb-2 font-medium">Видео недоступно</p>
              <p className="text-sm">Попробуйте другое видео</p>
              {item.poster && (
                <img 
                  src={item.poster} 
                  alt={item.title || 'Poster'} 
                  className="max-w-full max-h-32 object-contain rounded mt-3"
                />
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <VideoPlayer
        ref={(el) => { videoRefs.current[index] = el; }}
        src={item.src}
        poster={item.poster}
        title={item.title}
        autoPlay={autoPlayActive && index === 0}
        muted={muted}
        onError={(errorData) => handleVideoError(index, errorData)}
        onEnded={() => handleVideoEnded(index)}
        fallbackContent={fallbackContent ? () => fallbackContent(item, index) : undefined}
      />
    );
  }, [autoPlayActive, muted, errorVideos, fallbackContent, handleVideoError, handleVideoEnded]);

  return (
    <Carousel
      ref={swiperRef}
      items={preparedItems}
      renderItem={renderVideoItem}
      keyExtractor={(item) => item.key}
      showNavigation={showNavigation}
      showPagination={showPagination}
      autoplay={false}
      className={className}
      onSlideChange={handleSlideChange}
      onSwiper={(swiper) => {
        // Сохраняем ссылку на Swiper при инициализации
        if (swiperRef.current) {
          swiperRef.current.swiper = swiper;
        }
      }}
      {...props}
    />
  );
};

export { VideoCarousel };


