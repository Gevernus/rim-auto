# Рим Авто - Автомобили под заказ из Китая

Веб-приложение для заказа автомобилей из Китая с полным сопровождением сделки.

## 🚀 Технологический стек

### Frontend
- **React 19** - современная библиотека для UI
- **Vite** - быстрый сборщик и dev сервер
- **React Router DOM** - роутинг (с абстракцией для React Native)
- **TailwindCSS 4** - утилитарные CSS классы
- **Axios** - HTTP клиент для API
- **React Hook Form** - управление формами

### Backend
- **FastAPI** - современный Python веб-фреймворк
- **MongoDB** - NoSQL база данных
- **Selenium** - парсинг данных с che168.com
- **BeautifulSoup** - парсинг HTML
- **Docker** - контейнеризация

### Архитектура
- **Feature Sliced Design (FSD)** - модульная архитектура
- **API-first подход** - все данные через REST API
- **Docker Compose** - оркестрация сервисов

## 📁 Структура проекта

```
rim-auto/
├── frontend/              # React приложение
│   ├── src/
│   │   ├── app/          # Инициализация приложения
│   │   ├── pages/        # Страницы приложения
│   │   │   ├── catalog/  # Каталог автомобилей
│   │   │   ├── car/      # Страница автомобиля
│   │   │   └── about/    # О компании
│   │   ├── widgets/      # Сложные UI компоненты
│   │   │   ├── header/   # Шапка сайта
│   │   │   ├── footer/   # Подвал
│   │   │   └── car-grid/ # Сетка автомобилей
│   │   ├── features/     # Бизнес-логика
│   │   │   ├── car-catalog/ # Каталог авто
│   │   │   └── delivery/ # Доставка
│   │   └── shared/       # Переиспользуемый код
│   │       ├── ui/       # UI компоненты
│   │       ├── api/      # HTTP клиент и адаптеры
│   │       ├── hooks/    # Кастомные хуки
│   │       └── lib/      # Утилиты и абстракции
│   └── public/           # Статические файлы
│       └── placeholder-car.svg # Заглушка изображений
├── backend/              # FastAPI приложение
│   ├── main.py          # Основной файл приложения
│   ├── static/          # Статические файлы
│   │   └── images/      # Скачанные изображения автомобилей
│   └── requirements.txt # Python зависимости
├── docker-compose.yml   # Оркестрация сервисов
└── README.md           # Документация
```

## 🎯 Особенности архитектуры

### API-first подход
Все данные загружаются через REST API:

- **Backend API** - FastAPI на `http://localhost:8000/api`
- **Парсинг данных** - автоматический с che168.com
- **Кэширование** - MongoDB для хранения спарсенных данных
- **Изображения** - локальное хранение в `static/images/`

### Парсинг автомобилей
Автоматический сбор данных с китайского сайта:

```python
# Backend парсинг
def scrape_and_cache_cars():
    # Selenium WebDriver для загрузки страницы
    # BeautifulSoup для парсинга HTML
    # Сохранение в MongoDB
    # Скачивание изображений локально
```

### Docker окружение
Полная изоляция и простота развертывания:

```yaml
# docker-compose.yml
services:
  frontend:    # React dev сервер
  backend:     # FastAPI приложение  
  mongodb:     # База данных
  selenium:    # Парсинг браузер
```

### Подготовка к React Native
Проект изначально спроектирован для последующей миграции:

- **Навигация**: Абстракция над React Router DOM
- **API клиент**: Универсальный HTTP клиент на Axios
- **Компоненты**: Без DOM-зависимостей в бизнес-логике
- **Платформо-независимые хуки**: useCars, useVehicle

### Feature Sliced Design
Следуем принципам FSD для масштабируемости:

- **Слои**: app → pages → widgets → features → shared
- **Модульность**: Каждая фича - независимый модуль
- **Barrel exports**: Упрощенные импорты через index.js

### Система тем
Современная система тем с поддержкой:

- ✅ **Светлая тема** - принудительно светлая
- ✅ **Темная тема** - принудительно темная  
- ✅ **Системная тема** - следует настройкам ОС
- ✅ **Плавные переходы** между темами
- ✅ **Сохранение выбора** пользователя

## 🛠 Установка и запуск

### Требования
- Docker и Docker Compose
- Node.js 19+ (для разработки frontend)
- Python 3.11+ (для разработки backend)

### Быстрый запуск с Docker
```bash
# Клонирование репозитория
git clone <repository-url>
cd rim-auto

# Запуск всех сервисов
docker-compose up -d

# Frontend будет доступен на http://localhost:3000
# Backend API на http://localhost:8000
```

### Разработка
```bash
# Установка зависимостей frontend
cd frontend
npm install

# Установка зависимостей backend  
cd ../backend
pip install -r requirements.txt

# Запуск в режиме разработки
docker-compose up -d mongodb selenium
npm run dev  # frontend
python main.py  # backend
```

### Переменные окружения
```env
# Frontend (.env)
VITE_API_URL=http://localhost:8000/api

# Backend (environment variables)
MONGO_URL=mongodb://mongo:27017/
TELEGRAM_BOT_TOKEN=your_bot_token
```

## 📱 Миграция на React Native

### Архитектура готовности
Проект подготовлен к миграции через платформо-независимые абстракции:

#### 1. API клиент (`shared/api/client.js`)
```javascript
// Работает одинаково в веб и RN
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});
```

#### 2. Хуки (`shared/hooks/useCars.js`)
```javascript
// Платформо-независимые хуки
export const useCars = () => {
  // Логика работает в веб и RN
};
```

#### 3. Адаптеры данных (`shared/api/dataAdapter.js`)
```javascript
// Преобразование backend данных в frontend формат
export const adaptVehicle = (backendCar) => {
  // Единый формат для веб и RN
};
```

#### 4. UI компоненты (`shared/ui/Carousel.jsx`)
```javascript
// Платформо-независимая карусель
<Carousel
  items={images}
  renderItem={(image) => <img src={image} />}
  showNavigation={true}
  autoplay={true}
/>
```

#### 5. Видеокарусель (`shared/ui/VideoCarousel.jsx` и `VideoPlayer.jsx`)
```jsx
import { VideoCarousel } from './shared/ui';

<VideoCarousel
  items={[
    { src: '/src/assets/detailing/vinyl/vinyl-wrap-1.mp4', poster: '/src/assets/detailing/primeWrap.jpg', title: 'Оклейка винилом' },
    // можно добавлять ещё ролики
  ]}
  autoPlayActive={true}
  muted={true}
  showNavigation={true}
  showPagination={true}
/>
```

Особенности:
- **Автопауза и автоплей активного слайда**: при смене слайда все видео, кроме текущего, ставятся на паузу и сбрасываются
- **Единый API** с `Carousel` для последующей миграции на RN
- **Платформо-независимость**: в RN будет доступна реализация `VideoPlayer.native.js` и `Carousel.native.js`

Рекомендации по ассетам:
- Формат: MP4 (H.264)
- Разрешение: 720p–1080p
- Размер: до 10–15 МБ

**Архитектура карусели:**
- **Веб**: Swiper.js с условным импортом + fallback
- **RN**: Нативные ScrollView + Gesture Handler
- **API**: Единый интерфейс для обеих платформ
- **SSR**: Поддержка серверного рендеринга

### Этапы миграции:
1. **Заменить роутинг**: `react-router-dom` → `react-navigation`
2. **Адаптировать стили**: TailwindCSS → NativeWind
3. **Обновить UI компоненты**: HTML → React Native компоненты
4. **Настроить платформо-зависимые абстракции`

## 🔧 API Endpoints

### Автомобили
- `GET /api/cars` - список автомобилей с пагинацией
- `POST /api/refresh-cache` - принудительное обновление кэша
- `GET /api/cache-stats` - статистика кэша
- `POST /api/cleanup-images` - очистка неиспользуемых изображений

### Система
- `GET /api/health` - состояние системы
- `GET /api/scrape-cars` - получение спарсенных данных

### Параметры запросов
```javascript
// Фильтрация автомобилей
GET /api/cars?page=1&page_size=12&title=BMW&price_from=20&price_to=50

// Обновление кэша
POST /api/refresh-cache
```

## 🚦 Роутинг

```javascript
// Доступные маршруты
/           - Главная страница
/cars       - Каталог автомобилей  
/car/:id    - Страница автомобиля
/about      - О компании
```

## 📊 Функциональность

### Каталог автомобилей
- ✅ **Реальные данные** - парсинг с che168.com
- ✅ **Фильтрация** - по марке, цене, году
- ✅ **Поиск** - по названию автомобиля
- ✅ **Обновление кэша** - принудительное обновление данных
- ✅ **Локальные изображения** - скачивание и кэширование

### Парсинг данных
- ✅ **Автоматический парсинг** - Selenium + BeautifulSoup
- ✅ **Кэширование** - MongoDB для хранения данных
- ✅ **Скачивание изображений** - локальное хранение
- ✅ **Обработка ошибок** - fallback на заглушки

### Система доставки
- ✅ **Выбор города** - интеграция с системой доставки
- ✅ **Расчет стоимости** - автоматический расчет доставки
- ✅ **Информация о доставке** - детали и сроки

## 🐛 Отладка

### Логи Docker
```bash
# Просмотр логов всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs frontend
```

### Отладка парсера
```bash
# Проверка состояния системы
curl http://localhost:8000/api/health

# Статистика кэша
curl http://localhost:8000/api/cache-stats

# Принудительное обновление
curl -X POST http://localhost:8000/api/refresh-cache
```

### Отладка frontend
```bash
# Проверка API подключения
curl http://localhost:3000/api/cars

# Логи в браузере
F12 → Console → проверка ошибок API
```

## ▶️ Запуск в Telegram WebApp (через туннель)

Для корректной работы внутри Telegram необходим публичный доступ и безопасный HMR.

1) Поднимите туннель к dev-серверу (любой вариант):
- Cloudflare: `cloudflared tunnel --url http://localhost:3000`
- Ngrok: `ngrok http http://localhost:3000`

2) Скопируйте публичный домен и добавьте в `frontend/.env`:
```env
VITE_PUBLIC_HOST=my-app.ngrok-free.app
VITE_TWA=1
# при необходимости укажите нестандартные
# VITE_DEV_HOST=localhost
# VITE_DEV_PORT=3000

# Укажите публичный API для Telegram окружения
VITE_API_URL=https://<your-public-api-host>/api
```

3) Запустите dev-сервер в режиме TWA:
```bash
npm run dev:twa
```

4) В настройках BotFather установите WebApp URL на `https://my-app.ngrok-free.app/`.

Эта конфигурация подключает HMR через `wss` к публичному домену и устраняет ошибки:
- `failed to connect to websocket`
- `net::ERR_CONNECTION_RESET` при загрузке модулей и ассетов

