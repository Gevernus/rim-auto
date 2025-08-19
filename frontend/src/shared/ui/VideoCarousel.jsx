import { useMemo, useRef } from 'react';
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
  ...props
}) => {
  const videoRefs = useRef([]);

  const preparedItems = useMemo(() => items.map((item, index) => ({
    key: item.key ?? index,
    src: item.src,
    poster: item.poster,
    title: item.title,
  })), [items]);

  const handleSlideChange = (swiper) => {
    // Пауза всех видео кроме активного
    videoRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      if (idx === swiper.activeIndex) {
        if (autoPlayActive) ref.play?.();
      } else {
        ref.pause?.();
        ref.reset?.();
      }
    });
  };

  return (
    <Carousel
      items={preparedItems}
      renderItem={(item, index) => (
        <VideoPlayer
          ref={(el) => { videoRefs.current[index] = el; }}
          src={item.src}
          poster={item.poster}
          title={item.title}
          autoPlay={autoPlayActive && index === 0}
          muted={muted}
        />
      )}
      keyExtractor={(item) => item.key}
      showNavigation={showNavigation}
      showPagination={showPagination}
      autoplay={false}
      className={className}
      onSlideChange={handleSlideChange}
      {...props}
    />
  );
};

export { VideoCarousel };


