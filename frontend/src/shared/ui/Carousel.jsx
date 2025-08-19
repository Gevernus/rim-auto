import { useMemo, useState, useEffect } from 'react';

// Статические импорты для Vite
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Импорты стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Платформо-независимый интерфейс карусели
const Carousel = ({ 
  items = [], 
  renderItem, 
  keyExtractor,
  showNavigation = true,
  showPagination = true,
  autoplay = false,
  autoplayDelay = 5000,
  className = '',
  ...props 
}) => {
  const [isSwiperAvailable, setIsSwiperAvailable] = useState(false);

  // Проверяем доступность Swiper
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Проверяем что Swiper компоненты доступны
      setIsSwiperAvailable(!!Swiper && !!SwiperSlide);
    }
  }, []);

  // Хуки всегда вызываются в начале компонента
  const modules = useMemo(() => {
    if (!isSwiperAvailable) return [];
    
    const mods = [];
    if (showNavigation) mods.push(Navigation);
    if (showPagination) mods.push(Pagination);
    if (autoplay) mods.push(Autoplay);
    return mods;
  }, [isSwiperAvailable, showNavigation, showPagination, autoplay]);

  const swiperProps = useMemo(() => ({
    spaceBetween: 20,
    slidesPerView: 1,
    navigation: showNavigation,
    pagination: showPagination ? { clickable: true } : false,
    autoplay: autoplay ? { delay: autoplayDelay } : false,
    ...props
  }), [showNavigation, showPagination, autoplay, autoplayDelay, props]);

  // Fallback для случаев когда Swiper недоступен
  if (!isSwiperAvailable) {
    return (
      <div className={`carousel-fallback ${className}`}>
        <div className="carousel-container">
          {items.map((item, index) => (
            <div key={keyExtractor ? keyExtractor(item, index) : index} className="carousel-item">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Swiper для веб-платформы
  return (
    <Swiper
      modules={modules}
      className={`carousel-swiper ${className}`}
      {...swiperProps}
    >
      {items.map((item, index) => (
        <SwiperSlide key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export { Carousel };
