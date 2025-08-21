import { useMemo, useState, useEffect, forwardRef } from 'react';

// Статические импорты для Vite
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Импорты стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Платформо-независимый интерфейс карусели
const Carousel = forwardRef(({ 
  items = [], 
  renderItem, 
  keyExtractor,
  showNavigation = true,
  showPagination = true,
  autoplay = false,
  autoplayDelay = 5000,
  className = '',
  compactPagination = false, // Компактный режим пагинации
  maxVisibleBullets = 5, // Максимальное количество видимых буллетов
  slidesPerView = 1, // Количество слайдов на экране
  spaceBetween = 20, // Расстояние между слайдами
  breakpoints = null, // Адаптивные брейкпоинты
  loop = false, // Бесконечная прокрутка
  ...props 
}, ref) => {
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

  // Настройки пагинации с адаптивностью
  const paginationConfig = useMemo(() => {
    if (!showPagination) return false;
    
    if (compactPagination && items.length > maxVisibleBullets) {
      return {
        clickable: true,
        dynamicBullets: true, // Динамические буллеты
        dynamicMainBullets: 3, // Количество основных буллетов
        renderBullet: (index, className) => {
          // Показываем только первые, последние и текущий + соседние
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isNearCurrent = Math.abs(index - 0) <= 1;
          
          if (isFirst || isLast || isNearCurrent) {
            return `<span class="${className}">${index + 1}</span>`;
          } else if (index === 1 || index === items.length - 2) {
            return `<span class="${className}">...</span>`;
          }
          return '';
        }
      };
    }
    
    return { clickable: true };
  }, [showPagination, compactPagination, items.length, maxVisibleBullets]);

  const swiperProps = useMemo(() => ({
    spaceBetween,
    slidesPerView,
    navigation: showNavigation,
    pagination: paginationConfig,
    autoplay: autoplay ? { delay: autoplayDelay } : false,
    loop, // Добавляем поддержку бесконечной прокрутки
    // Улучшенные настройки для большого количества элементов
    watchSlidesProgress: true,
    breakpoints,
    // Дополнительные настройки для корректной работы loop
    loopAdditionalSlides: 2,
          onSwiper: (swiper) => {
        console.log('Swiper initialized:', swiper);
        if (props.onSwiper) {
          props.onSwiper(swiper);
        }
      },
    ...props
  }), [spaceBetween, slidesPerView, showNavigation, paginationConfig, autoplay, autoplayDelay, loop, breakpoints, props]);

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
      ref={ref}
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
});

export { Carousel };
