import { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from 'react';

// Плеер видео (веб). Для RN будет создан `VideoPlayer.native.js`
const VideoPlayer = forwardRef(({ 
  src, 
  poster, 
  title, 
  autoPlay = false, 
  muted = true, 
  controls = true, 
  className = '',
  onError,
  onEnded,
  fallbackContent
}, ref) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isVideoValid, setIsVideoValid] = useState(true);

  // Проверка доступности видео файла
  useEffect(() => {
    if (!src) return;

    const checkVideoAvailability = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`Video file not accessible: ${src}`, response.status);
          setErrorDetails(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`Failed to check video availability: ${src}`, error);
        setErrorDetails(`Network error: ${error.message}`);
      }
    };

    checkVideoAvailability();
  }, [src]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorDetails(null);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setIsVideoValid(true);
    if (autoPlay && videoRef.current) {
      try { 
        videoRef.current.play(); 
      } catch (error) {
        console.warn('Autoplay failed:', error);
      }
    }
  }, [autoPlay]);

  const handleError = useCallback((e) => {
    setIsLoading(false);
    setHasError(true);
    
    const video = e.target;
    let errorMessage = 'Unknown error';
    
    if (video.error) {
      switch (video.error.code) {
        case 1:
          errorMessage = 'Video loading aborted';
          break;
        case 2:
          errorMessage = 'Network error';
          break;
        case 3:
          errorMessage = 'Video decoding failed - file may be corrupted';
          break;
        case 4:
          errorMessage = 'Video not supported';
          break;
        default:
          errorMessage = `Error code: ${video.error.code}`;
      }
    }
    
    setErrorDetails(errorMessage);
    console.error('Video load error:', {
      src,
      error: errorMessage,
      videoError: video.error,
      event: e
    });
    
    // Вызываем callback если передан
    if (onError) {
      onError({ src, error: errorMessage, details: video.error });
    }
  }, [src, onError]);

  const handleEnded = useCallback(() => {
    console.log('Video ended:', src);
    if (onEnded) {
      onEnded();
    }
  }, [src, onEnded]);

  const handleLoadedMetadata = useCallback(() => {
    // Дополнительная проверка метаданных
    if (videoRef.current) {
      const video = videoRef.current;
      const duration = video.duration;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (duration === Infinity || isNaN(duration) || duration <= 0) {
        console.warn('Invalid video duration:', duration);
        setErrorDetails('Invalid video duration');
      }
      
      if (videoWidth === 0 || videoHeight === 0) {
        console.warn('Invalid video dimensions:', { width: videoWidth, height: videoHeight });
        setErrorDetails('Invalid video dimensions');
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => { 
      try { 
        videoRef.current?.play(); 
      } catch (error) {
        console.warn('Play failed:', error);
      }
    },
    pause: () => { 
      try { 
        videoRef.current?.pause(); 
      } catch (error) {
        console.warn('Pause failed:', error);
      }
    },
    reset: () => {
      if (!videoRef.current) return;
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch (error) {
        console.warn('Reset failed:', error);
      }
    },
    getElement: () => videoRef.current,
    getErrorDetails: () => ({ hasError, errorDetails, isVideoValid }),
  }), [hasError, errorDetails, isVideoValid]);

  // Fallback контент для поврежденных видео
  if (hasError || !isVideoValid) {
    return (
      <div className={`aspect-video bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-text-secondary p-4">
          {fallbackContent ? (
            fallbackContent
          ) : (
            <>
              <p className="mb-2 font-medium">Видео недоступно</p>
              <p className="text-sm mb-3">{errorDetails || 'Ошибка загрузки'}</p>
              {poster && (
                <img 
                  src={poster} 
                  alt={title || 'Poster'} 
                  className="max-w-full max-h-32 object-contain rounded"
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg overflow-hidden relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface-secondary dark:bg-dark-surface-secondary">
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
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
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


