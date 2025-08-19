import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';

// Плеер видео (веб). Для RN будет создан `VideoPlayer.native.js`
const VideoPlayer = forwardRef(({ 
  src, 
  poster, 
  title, 
  autoPlay = false, 
  muted = true, 
  controls = true, 
  className = '' 
}, ref) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    if (autoPlay && videoRef.current) {
      // Автоплей работает только при выключенном звуке в браузерах
      try { 
        videoRef.current.play(); 
      } catch {
        // Игнорируем ошибки автоплея (браузерные ограничения)
      }
    }
  }, [autoPlay]);

  const handleError = useCallback((e) => {
    setIsLoading(false);
    setHasError(true);
    // Лог оставляем для отладки в dev
    console.error('Video load error', e);
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => { 
      try { 
        videoRef.current?.play(); 
      } catch {
        // Игнорируем ошибки воспроизведения
      }
    },
    pause: () => { 
      try { 
        videoRef.current?.pause(); 
      } catch {
        // Игнорируем ошибки паузы
      }
    },
    reset: () => {
      if (!videoRef.current) return;
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch {
        // Игнорируем ошибки сброса
      }
    },
    getElement: () => videoRef.current,
  }), []);

  if (hasError) {
    return (
      <div className={`aspect-video bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-text-secondary">
          <p className="mb-2">Видео недоступно</p>
          <p className="text-sm">Попробуйте обновить страницу</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg overflow-hidden relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-text-secondary">Загрузка видео...</div>
        </div>
      )}
      <video
        ref={videoRef}
        controls={controls}
        className="w-full h-full object-cover"
        poster={poster}
        preload="metadata"
        muted={muted}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        title={title}
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>
    </div>
  );
});

export { VideoPlayer };


