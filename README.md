# Rim Auto - Парсер автомобилей из Китая

Веб-приложение для парсинга и отображения автомобилей с сайта che168.com

## 🚀 Быстрый запуск

### Для Windows:
```bash
docker-compose -f docker-compose.windows.yml up -d
```

### Для Mac/Linux:
```bash
docker-compose up -d
```

## 📋 Требования

- Docker Desktop
- Docker Compose
- 4GB+ RAM для Selenium

## 🏗️ Архитектура

- **Frontend**: React + Vite + TailwindCSS 4
- **Backend**: FastAPI + MongoDB + Selenium
- **Парсер**: Selenium WebDriver для che168.com
- **Хранение**: MongoDB + Docker Volumes для изображений

## 🔧 Конфигурация

### Переменные окружения

Создайте `.env` файл в корне проекта:

```env
# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN=your_bot_token

# API URLs
VITE_API_URL=http://localhost:8000/api
```

## 📊 API Endpoints

### Основные
- `GET /api/cars` - Список автомобилей с пагинацией
- `POST /api/refresh-cache` - Обновить кэш (перепарсить)
- `GET /api/health` - Статус системы

### Изображения
- `GET /api/images/stats` - Статистика изображений
- `POST /api/images/cleanup` - Очистить изображения

### Отладка
- `GET /api/debug/page-source` - HTML исходный код
- `GET /api/debug/selectors-test` - Тест селекторов

## 🛠️ Разработка

### Запуск в режиме разработки

**Windows:**
```bash
docker-compose -f docker-compose.windows.yml up -d
```

**Mac/Linux:**
```bash
docker-compose up -d
```

### Просмотр логов
```bash
# Backend
docker logs rim-auto-backend-1 -f

# Frontend  
docker logs rim-auto-frontend -f

# Selenium
docker logs selenium-chrome-windows -f  # Windows
docker logs selenium-chromium-mac -f    # Mac
```

### Отладка парсинга

1. Откройте каталог в браузере: http://localhost:3000
2. Нажмите "🔧 Показать панель разработчика"
3. Используйте инструменты отладки:
   - "Тест селекторов" - анализ структуры страницы
   - "Просмотр HTML" - исходный код che168.com
   - "Обновить кэш" - запуск парсинга

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

### Проблемы с изображениями
```bash
# Очистите кэш изображений
curl -X POST http://localhost:8000/api/images/cleanup
```

## 📁 Структура проекта

```
rim-auto/
├── frontend/           # React приложение
├── backend/            # FastAPI сервер
├── docker-compose.yml           # Mac/Linux конфигурация
├── docker-compose.windows.yml   # Windows конфигурация
└── README.md
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