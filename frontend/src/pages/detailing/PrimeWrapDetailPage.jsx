import { useAppParams, useAppNavigation, routes } from '../../shared/lib/navigation';
import { useEffect, useMemo } from 'react';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { Carousel, DesktopContactBar, VideoPlayer, VideoCarousel } from '../../shared/ui';
import primeWrap from '../../assets/detailing/primeWrap.jpg';
import vinylWrapVideo from '../../assets/detailing/vinyl/vinyl-wrap-1.mp4';
import vinylWrapVideo2 from '../../assets/detailing/vinyl/vinyl-wrap-2.mp4';
import armorFilmVideo from '../../assets/detailing/vinyl/vinyl-wrap-3.mp4';
import vinylAuto1 from '../../assets/detailing/vinyl/auto1.jpg';
import vinylAuto2 from '../../assets/detailing/vinyl/auto2.jpg';
import vinylAuto3 from '../../assets/detailing/vinyl/auto3.jpg';
import armorFilmAuto1 from '../../assets/detailing/armor/auto-1.jpg';
import armorFilmAuto2 from '../../assets/detailing/armor/auto-2.jpg';
import armorFilmAuto3 from '../../assets/detailing/armor/auto-3.jpg';


// Утилита для управления видео файлами
const VIDEO_ASSETS = {
  'vinyl-wrap': [vinylWrapVideo, vinylWrapVideo2],
  'armor-film': [armorFilmVideo],
  // Добавляйте новые видео здесь по мере появления
  // 'armor-film': armorFilmVideo,
  // 'polish-ceramic': polishVideo,
};



const SERVICE_DETAILS = {
  'armor-film': {
    title: 'Оклейка в броне плёнку',
    description: 'Защита кузова от сколов и царапин',
    content: `
      <h3>Что такое бронепленка?</h3>
      <p>Бронепленка - это специальная полиуретановая пленка, которая защищает кузов автомобиля от мелких повреждений, сколов, царапин и воздействия дорожных реагентов.</p>
      
      <h3>Преимущества:</h3>
      <ul>
        <li>Защита от сколов и царапин</li>
        <li>Сохранение заводского лакокрасочного покрытия</li>
        <li>Невидимая защита</li>
        <li>Долговечность до 10 лет</li>
        <li>Возможность удаления без повреждения краски</li>
      </ul>
      
      <h3>Процесс оклейки:</h3>
      <p>Процесс включает в себя тщательную подготовку поверхности, точную раскройку пленки по размерам деталей и профессиональную установку с использованием специальных инструментов.</p>
    `,
    images: [
      armorFilmAuto1,
      armorFilmAuto2,
      armorFilmAuto3
    ],
    videos: VIDEO_ASSETS['armor-film'],
    price: 'от 15,000 ₽',
    duration: '1-2 дня'
  },
  'vinyl-wrap': {
    title: 'Оклейка в виниловую пленку',
    description: 'Изменение цвета и дизайна автомобиля',
    content: `
      <h3>Виниловая оклейка автомобиля</h3>
      <p>Виниловая пленка позволяет полностью изменить внешний вид автомобиля без перекрашивания. Доступны сотни цветов и текстур.</p>
      
      <h3>Виды пленок:</h3>
      <ul>
        <li>Глянцевые пленки</li>
        <li>Матовые пленки</li>
        <li>Карбоновые пленки</li>
        <li>Хамелеон пленки</li>
        <li>Текстурные пленки</li>
      </ul>
      
      <h3>Области применения:</h3>
      <p>Полная оклейка кузова, частичная оклейка элементов, создание уникальных дизайнов и рекламных изображений.</p>
    `,
    images: [
      vinylAuto1,
      vinylAuto2,
      vinylAuto3
    ],
    videos: VIDEO_ASSETS['vinyl-wrap'],
    price: 'от 25,000 ₽',
    duration: '3-5 дней'
  },
  'polish-ceramic': {
    title: 'Полировка/Керамика',
    description: 'Восстановление блеска и защитное покрытие',
    content: `
      <h3>Полировка и керамическое покрытие</h3>
      <p>Комплексная услуга по восстановлению блеска лакокрасочного покрытия и нанесению долговременной защиты.</p>
      
      <h3>Этапы работы:</h3>
      <ol>
        <li>Мойка и обезжиривание</li>
        <li>Глиняная обработка</li>
        <li>Полировка с удалением царапин</li>
        <li>Нанесение керамического покрытия</li>
        <li>Финишная полировка</li>
      </ol>
      
      <h3>Результат:</h3>
      <p>Автомобиль приобретает зеркальный блеск, защиту от загрязнений и водоотталкивающие свойства на 2-3 года.</p>
    `,
    images: [
      '/src/assets/detailing/auto-1.jpg',
      '/src/assets/detailing/auto-2.jpg',
      '/src/assets/detailing/auto-3.jpg'
    ],
    // video: 'https://example.com/polish-demo.mp4',
    price: 'от 8,000 ₽',
    duration: '1 день'
  },
  'windshield-protection': {
    title: 'Бронирование лобового стекла',
    description: 'Защита от трещин и сколов',
    content: `
      <h3>Защита лобового стекла</h3>
      <p>Специальная прозрачная пленка для защиты лобового стекла от трещин, сколов и других повреждений.</p>
      
      <h3>Преимущества:</h3>
      <ul>
        <li>Защита от сколов и трещин</li>
        <li>Прозрачность 99.9%</li>
        <li>Устойчивость к ультрафиолету</li>
        <li>Долговечность до 5 лет</li>
        <li>Сохранение обзорности</li>
      </ul>
      
      <h3>Применение:</h3>
      <p>Идеально подходит для новых автомобилей и автомобилей с дорогими стеклами.</p>
    `,
    images: [
      '/src/assets/detailing/auto-1.jpg',
      '/src/assets/detailing/auto-2.jpg',
      '/src/assets/detailing/auto-3.jpg'
    ],
    // video: 'https://example.com/windshield-demo.mp4',
    price: 'от 12,000 ₽',
    duration: '1 день'
  },
  'soundproofing': {
    title: 'Шумоизоляция',
    description: 'Снижение уровня шума в салоне',
    content: `
      <h3>Шумоизоляция автомобиля</h3>
      <p>Комплексная шумоизоляция салона для максимального комфорта во время поездок.</p>
      
      <h3>Материалы:</h3>
      <ul>
        <li>Вибродемпфирующие материалы</li>
        <li>Звукоизоляционные маты</li>
        <li>Шумопоглощающие материалы</li>
        <li>Теплоизоляция</li>
      </ul>
      
      <h3>Области обработки:</h3>
      <p>Крыша, двери, пол, капот, багажник, колесные арки.</p>
    `,
    images: [
      '/src/assets/detailing/auto-1.jpg',
      '/src/assets/detailing/auto-2.jpg',
      '/src/assets/detailing/auto-3.jpg'
    ],
    // video: 'https://example.com/soundproof-demo.mp4',
    price: 'от 35,000 ₽',
    duration: '3-4 дня'
  },
  'wheel-painting': {
    title: 'Окрас дисков/Суппортов',
    description: 'Изменение цвета колесных дисков и тормозных суппортов',
    content: `
      <h3>Покраска дисков и суппортов</h3>
      <p>Профессиональная покраска колесных дисков и тормозных суппортов в любой цвет.</p>
      
      <h3>Технологии:</h3>
      <ul>
        <li>Порошковая покраска</li>
        <li>Жидкая покраска</li>
        <li>Покраска с эффектами</li>
        <li>Защитные покрытия</li>
      </ul>
      
      <h3>Цвета:</h3>
      <p>Классические цвета, металлики, хамелеоны, матовые и глянцевые покрытия.</p>
    `,
    images: [
      '/src/assets/detailing/auto-1.jpg',
      '/src/assets/detailing/auto-2.jpg',
      '/src/assets/detailing/auto-3.jpg'
    ],
    // video: 'https://example.com/wheels-demo.mp4',
    price: 'от 8,000 ₽',
    duration: '2-3 дня'
  },
  'door-closers': {
    title: 'Установка доводчиков',
    description: 'Плавное закрытие дверей автомобиля',
    content: `
      <h3>Доводчики дверей</h3>
      <p>Установка автоматических доводчиков для плавного и бесшумного закрытия дверей автомобиля.</p>
      
      <h3>Типы доводчиков:</h3>
      <ul>
        <li>Газовые доводчики</li>
        <li>Пружинные доводчики</li>
        <li>Электромагнитные доводчики</li>
        <li>Регулируемые доводчики</li>
      </ul>
      
      <h3>Преимущества:</h3>
      <p>Удобство использования, защита от повреждений, бесшумность работы.</p>
    `,
    images: [
      '/src/assets/detailing/auto-1.jpg',
      '/src/assets/detailing/auto-2.jpg',
      '/src/assets/detailing/auto-3.jpg'
    ],
    // video: 'https://example.com/doors-demo.mp4',
    price: 'от 3,000 ₽',
    duration: '1 день'
  },
  'anti-chrome': {
    title: 'Анти хром',
    description: 'Удаление хромированных элементов',
    content: `
      <h3>Удаление хромированных элементов</h3>
      <p>Профессиональное удаление хромированных деталей с последующей покраской или заменой.</p>
      
      <h3>Процесс работы:</h3>
      <ol>
        <li>Демонтаж хромированных элементов</li>
        <li>Очистка поверхности</li>
        <li>Грунтовка</li>
        <li>Покраска в выбранный цвет</li>
        <li>Защитное покрытие</li>
      </ol>
      
      <h3>Результат:</h3>
      <p>Современный внешний вид без хромированных элементов.</p>
    `,
    images: [
      '/src/assets/detailing/auto-1.jpg',
      '/src/assets/detailing/auto-2.jpg',
      '/src/assets/detailing/auto-3.jpg'
    ],
    // video: 'https://example.com/anti-chrome-demo.mp4',
    price: 'от 5,000 ₽',
    duration: '1-2 дня'
  }
};

const COMPANY_META = {
  'prime-wrap': {
    name: 'Prime Wrap',
    logo: primeWrap,
	whatsAppUrl: 'https://wa.me/7 965 285-58-04',
	phone: '+7 (965) 285-58-04',
  },
};

const PrimeWrapDetailPage = () => {
  const { companySlug, serviceSlug } = useAppParams();
  const { navigateTo } = useAppNavigation();
  
  const company = COMPANY_META[companySlug];
  const service = SERVICE_DETAILS[serviceSlug];

  const altNavConfig = useMemo(() => ({
    chat: {
      label: 'Чат',
      telegramUrl: company?.telegramUrl,
      whatsAppUrl: company?.whatsAppUrl,
    },
    call: {
      label: 'Звонок',
      phone: company?.phone,
    },
  }), [company?.telegramUrl, company?.whatsAppUrl, company?.phone]);

  const { activate, deactivate } = useAltBottomNav(altNavConfig);

  useEffect(() => {
    activate();
    return () => deactivate();
  }, [companySlug, serviceSlug, activate, deactivate]);

  if (!service) {
    return (
      <div className="container section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            Услуга не найдена
          </h1>
          <button
            onClick={() => navigateTo(routes.detailingCompany(companySlug))}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Вернуться к услугам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок и навигация */}
		<button
          type="button"
          onClick={() => navigateTo(routes.detailingCompany(companySlug))}
          className="w-full flex justify-between items-center gap-3 mb-6 focus:outline-none underline-offset-4 hover:underline focus:underline"
          aria-label="Вернуться к списку компаний"
        >
          <img src={company.logo} alt={company.name} className="w-16 h-16 object-contain rounded-md bg-dark-surface-secondary dark:bg-dark-surface-elevated" />
          <span className="text-2xl m:text-3xl font-bold text-text-primary dark:text-dark-text-primary">{company.name}</span>
		  <span className="ml-auto text-xl m:text-2xl font-bold text-primary-700 dark:text-primary-600">назад</span>
        </button>

        {/* Заголовок услуги */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">
            {service.title}
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-secondary mb-4">
            {service.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary dark:text-text-secondary">
            <span>Стоимость: <strong className="text-text-primary dark:text-dark-text-primary">{service.price}</strong></span>
            <span>Время работы: <strong className="text-text-primary dark:text-dark-text-primary">{service.duration}</strong></span>
          </div>
        </div>

        {/* Фото галерея */}
        {service.images && service.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-600 mb-4">
              Фотографии работ
            </h2>
            <Carousel
              items={service.images}
              renderItem={(image, index) => (
                <div className="aspect-video bg-surface-secondary dark:bg-dark-surface-secondary rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${service.title} - фото ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-text-secondary">
                    <span>Фото {index + 1}</span>
                  </div>
                </div>
              )}
              keyExtractor={(image, index) => index}
              showNavigation={true}
              showPagination={true}
              autoplay={true}
              autoplayDelay={5000}
              className="w-full"
            />
          </div>
        )}

        {/* Видео */}
        {(service.videos?.length > 0 || service.video) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-600 mb-4">
              Видео процесса
            </h2>
            {service.videos?.length > 0 ? (
              <VideoCarousel
                items={service.videos.map((src) => ({ src, poster: primeWrap, title: service.title }))}
                autoPlayActive={true}
                muted={true}
              />
            ) : (
              <VideoPlayer
                src={service.video}
                poster={primeWrap}
                title={service.title}
              />
            )}
          </div>
        )}

        {/* Описание услуги */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-600 mb-4">
            Подробное описание
          </h2>
          <div 
            className="prose prose-lg max-w-none text-text-primary dark:text-dark-text-primary"
            dangerouslySetInnerHTML={{ __html: service.content }}
          />
        </div>

        {/* Контакты для десктопа */}
        <DesktopContactBar
          whatsAppUrl={company?.whatsAppUrl}
          phone={company?.phone}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export { PrimeWrapDetailPage };
