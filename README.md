# Rim Auto - Автомобили под заказ из Китая

Веб-приложение для заказа автомобилей из Китая с полным сопровождением сделки и системой авторизации через Telegram.

## 🚀 Технологический стек

### Frontend
- **React 19** - современная библиотека для UI
- **Vite** - быстрый сборщик и dev сервер
- **React Router DOM** - роутинг
- **TailwindCSS 4** - утилитарные CSS классы с data-theme
- **Axios** - HTTP клиент для API
- **Zustand** - управление состоянием (авторизация)
- **React Hook Form** - управление формами

### Backend
- **FastAPI** - современный Python веб-фреймворк
- **MongoDB** - NoSQL база данных
- **PyJWT** - JWT токены для авторизации
- **Selenium** - парсинг данных с che168.com
- **BeautifulSoup** - парсинг HTML
- **Docker** - контейнеризация

### Архитектура
- **Feature Sliced Design (FSD)** - модульная архитектура
- **API-first подход** - все данные через REST API
- **Telegram WebApp авторизация** - бесшовная авторизация
- **Платформо-независимые абстракции** - подготовка к React Native

## 📁 Структура проекта

```
rim-auto/
├── frontend/              # React приложение
│   ├── src/
│   │   ├── app/          # Инициализация приложения
│   │   ├── pages/        # Страницы приложения
│   │   │   ├── catalog/  # Каталог автомобилей
│   │   │   ├── car/      # Страница автомобиля
│   │   │   ├── about/    # О компании
│   │   │   └── debug/    # Страница отладки авторизации
│   │   ├── widgets/      # Сложные UI компоненты
│   │   │   ├── header/   # Шапка сайта с профилем
│   │   │   ├── footer/   # Подвал
│   │   │   └── car-grid/ # Сетка автомобилей
│   │   ├── features/     # Бизнес-логика
│   │   │   ├── car-catalog/ # Каталог авто
│   │   │   ├── delivery/ # Доставка
│   │   │   └── auth/     # Авторизация через Telegram
│   │   └── shared/       # Переиспользуемый код
│   │       ├── ui/       # UI компоненты
│   │       ├── api/      # HTTP клиент и адаптеры
│   │       ├── hooks/    # Кастомные хуки
│   │       ├── lib/      # Утилиты и абстракции
│   │       └── config/   # Конфигурация платформы
│   └── public/           # Статические файлы
├── backend/              # FastAPI приложение
│   ├── main.py          # Основной файл приложения
│   ├── static/          # Статические файлы
│   │   └── images/      # Скачанные изображения автомобилей
│   └── requirements.txt # Python зависимости
├── docker-compose.yml   # Оркестрация сервисов
└── README.md           # Документация
```

## 🔐 Система авторизации

### Telegram WebApp авторизация
- ✅ **Бесшовная авторизация** - автоматическая при открытии в Telegram
- ✅ **JWT токены** - безопасное хранение сессий
- ✅ **Платформо-независимые абстракции** - готовность к React Native
- ✅ **Telegram Debug Mode** - локальная отладка без Telegram

### Отладка авторизации
```bash
# Откройте страницу отладки
http://localhost:3000/auth-debug

# Включите Telegram Debug Mode
# Перезагрузите страницу
# Система автоматически авторизует тестового пользователя
```

### API авторизации
- `POST /api/auth/telegram-webapp` - авторизация из Telegram WebApp
- `POST /api/auth/telegram-web` - авторизация через Telegram Login Widget
- `GET /api/auth/validate` - валидация JWT токена
- `POST /api/auth/logout` - выход из системы

## 🛠 Установка и запуск

### Требования
- Docker и Docker Compose
- Node.js 19+ (для разработки frontend)
- Python 3.11+ (для разработки backend)

### Быстрый запуск с Docker

**Для Windows:**
```bash
docker-compose -f docker-compose.windows.yml up -d
```

**Для Mac/Linux:**
```bash
docker-compose up -d
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
uvicorn main:app --reload --port 8000  # backend
```

### Переменные окружения
```env
# Frontend (.env)
VITE_API_URL=http://localhost:8000/api
VITE_TELEGRAM_BOT_USERNAME=your_bot_username

# Backend (environment variables)
MONGO_URL=mongodb://mongo:27017/
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET=your-secret-key-change-in-production
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

#### 3. Storage абстракция (`shared/lib/storage.js`)
```javascript
// Асинхронный storage для веб и RN
class Storage {
  async setItem(key, value) { ... }
  async getItem(key) { ... }
}
```

### Этапы миграции:
1. **Заменить роутинг**: `react-router-dom` → `react-navigation`
2. **Адаптировать стили**: TailwindCSS → NativeWind
3. **Обновить UI компоненты**: HTML → React Native компоненты
4. **Настроить платформо-зависимые абстракции**

## 🔧 API Endpoints

### Автомобили
- `GET /api/cars` - список автомобилей с пагинацией и фильтрами
- `POST /api/refresh-cache` - принудительное обновление кэша
- `GET /api/scrape-cars` - получение спарсенных данных

### Авторизация
- `POST /api/auth/telegram-webapp` - авторизация из Telegram WebApp
- `POST /api/auth/telegram-web` - авторизация через Telegram Login Widget
- `GET /api/auth/validate` - валидация JWT токена
- `POST /api/auth/logout` - выход из системы

### Система
- `GET /api/health` - состояние системы и подключенных сервисов
- `GET /api/images/stats` - статистика изображений
- `POST /api/images/cleanup` - очистка неиспользуемых изображений

### Отладка
- `GET /api/debug/page-source` - HTML исходный код последнего парсинга
- `GET /api/debug/selectors-test` - тест селекторов для парсинга

### Параметры запросов
```javascript
// Фильтрация автомобилей
GET /api/cars?page=1&page_size=12&title=BMW&price_from=20&price_to=50&sort_by=price&sort_order=desc

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
/auth-debug - Отладка авторизации (только в dev)
```

## 📊 Функциональность

### Каталог автомобилей
- ✅ **Реальные данные** - парсинг с che168.com
- ✅ **Фильтрация** - по марке, цене, году
- ✅ **Поиск** - по названию автомобиля
- ✅ **Сортировка** - по цене, названию
- ✅ **Пагинация** - постраничная загрузка
- ✅ **Обновление кэша** - принудительное обновление данных
- ✅ **Локальные изображения** - скачивание и кэширование

### Парсинг данных
- ✅ **Автоматический парсинг** - Selenium + BeautifulSoup
- ✅ **Кэширование** - MongoDB для хранения данных
- ✅ **Скачивание изображений** - локальное хранение
- ✅ **Обработка ошибок** - fallback на заглушки
- ✅ **Отладочные инструменты** - анализ структуры страниц

### Система авторизации
- ✅ **Telegram WebApp** - бесшовная авторизация в боте
- ✅ **Telegram Login Widget** - авторизация на веб-сайте
- ✅ **JWT токены** - безопасное хранение сессий
- ✅ **Автоматическая валидация** - проверка токенов
- ✅ **Telegram Debug Mode** - локальная отладка
- ✅ **Платформо-независимые абстракции** - готовность к RN

### Система тем
- ✅ **Светлая тема** - принудительно светлая
- ✅ **Темная тема** - принудительно темная  
- ✅ **Системная тема** - следует настройкам ОС
- ✅ **Плавные переходы** между темами
- ✅ **Сохранение выбора** пользователя
- ✅ **data-theme атрибут** - для TailwindCSS 4

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

### Отладка авторизации
```bash
# Откройте страницу отладки
http://localhost:3000/auth-debug

# Включите Telegram Debug Mode
# Перезагрузите страницу
# Проверьте авторизацию в хедере
```

### Отладка frontend
```bash
# Проверка API подключения
curl http://localhost:3000/api/cars

# Логи в браузере
F12 → Console → проверка ошибок API
```

## 🐛 Устранение проблем

### Selenium не запускается (Windows)
```bash
# Пересоберите с Windows-специфичным файлом
docker-compose -f docker-compose.windows.yml down
docker-compose -f docker-compose.windows.yml up -d --build
```

### Парсер не находит автомобили
1. Проверьте логи: `docker logs rim-auto-backend-1`
2. Используйте отладочные инструменты в UI
3. Проверьте доступность che168.com

### Проблемы с авторизацией
1. Проверьте переменные окружения (TELEGRAM_BOT_TOKEN)
2. Используйте Telegram Debug Mode для локальной отладки
3. Проверьте логи backend для ошибок JWT

### Проблемы с изображениями
```bash
# Очистите кэш изображений
curl -X POST http://localhost:8000/api/images/cleanup
```

## 🔄 Обновление

```bash
# Остановить сервисы
docker-compose down

# Обновить образы
docker-compose pull

# Запустить заново
docker-compose up -d
```

## 📝 Лицензия

MIT License 