# Архитектура платформо-независимой карусели

## Обзор

Карусель спроектирована для работы на разных платформах с единым API, но разными движками под капотом.

## Структура файлов

```
shared/ui/
├── Carousel.jsx          # Веб-версия с Swiper.js
├── Carousel.native.js    # React Native версия
└── index.js              # Экспорт (автоматический выбор платформы)
```

## API компонента

```jsx
<Carousel
  items={array}                    // Массив элементов для отображения
  renderItem={(item, index) => JSX} // Функция рендера каждого элемента
  keyExtractor={(item, index) => string} // Извлечение ключа
  showNavigation={boolean}         // Показать навигацию (только веб)
  showPagination={boolean}         // Показать пагинацию (только веб)
  autoplay={boolean}               // Автопрокрутка (только веб)
  autoplayDelay={number}           // Задержка автопрокрутки в мс
  className={string}               // CSS классы (веб)
  style={object}                   // Стили (RN)
  {...props}                       // Дополнительные пропсы
/>
```

## Платформо-зависимые реализации

### Веб (Carousel.jsx)
- **Движок**: Swiper.js с условным импортом
- **Особенности**: 
  - Навигация, пагинация, автопрокрутка
  - Touch события и свайпы
  - CSS анимации и переходы
- **Fallback**: Простая горизонтальная прокрутка если Swiper недоступен

### React Native (Carousel.native.js)
- **Движок**: Нативные ScrollView + Dimensions
- **Особенности**:
  - PagingEnabled для постраничной прокрутки
  - SnapToInterval для точного позиционирования
  - Нативная производительность
  - Поддержка жестов через React Native Gesture Handler

## Преимущества архитектуры

### 1. Изоляция различий платформ
- **UI**: Одинаковый интерфейс на всех платформах
- **API**: Единый набор пропсов
- **Логика**: Общая бизнес-логика в родительских компонентах

### 2. Производительность
- **Веб**: Swiper.js оптимизирован для браузеров
- **RN**: Нативные компоненты + Reanimated для плавности
- **SSR**: Fallback для серверного рендеринга

### 3. Поддержка SSR/WebView
- **Проблема**: Swiper требует window объекта
- **Решение**: Условный импорт + fallback
- **Результат**: Работает в любом окружении

### 4. Темизация
- **Веб**: CSS переменные + TailwindCSS
- **RN**: StyleSheet + платформо-независимые цвета
- **Общее**: Единая система дизайн-токенов

## Примеры использования

### В ServiceDetailPage
```jsx
<Carousel
  items={service.images}
  renderItem={(image, index) => (
    <div className="aspect-video">
      <img src={image} alt={`Фото ${index + 1}`} />
    </div>
  )}
  showNavigation={true}
  showPagination={true}
  autoplay={true}
  autoplayDelay={5000}
/>
```

### В React Native
```jsx
<Carousel
  items={images}
  renderItem={(image, index) => (
    <Image source={{ uri: image }} style={styles.image} />
  )}
  style={styles.carousel}
/>
```

## Миграция на React Native

### Этап 1: Подготовка
- ✅ Создана абстракция Carousel
- ✅ Вынесена из shared/ui в платформо-зависимые файлы
- ✅ Единый API для обеих платформ

### Этап 2: RN интеграция
- 🔄 Добавить React Native Gesture Handler
- 🔄 Интегрировать Reanimated для анимаций
- 🔄 Настроить платформо-зависимые импорты

### Этап 3: Оптимизация
- 🔄 Добавить виртуализацию для больших списков
- 🔄 Реализовать lazy loading изображений
- 🔄 Добавить поддержку жестов (pinch, pan)

## Совместимость

- **React**: 18+ (хуки, Suspense)
- **Веб**: Все современные браузеры
- **RN**: 0.70+ (новые архитектуры)
- **SSR**: Next.js, Gatsby, Vite SSR
- **WebView**: Telegram WebApp, встроенные браузеры

## Отладка

### Веб
```jsx
// Проверка доступности Swiper
console.log('Swiper available:', !!Swiper);

// Fallback режим
<Carousel fallback={true} />
```

### React Native
```jsx
// Проверка платформы
import { Platform } from 'react-native';
console.log('Platform:', Platform.OS);

// Нативные логи
console.log('RN Carousel rendered');
```
