# Рим Авто - Автомобили под заказ из Китая

Веб-приложение для заказа автомобилей из Китая с полным сопровождением сделки.

## 🚀 Технологический стек

- **Frontend**: React 19, Vite
- **Роутинг**: React Router DOM (с абстракцией для React Native)
- **Стили**: TailwindCSS 
- **HTTP клиент**: Axios
- **Состояние**: Zustand
- **Формы**: React Hook Form
- **Архитектура**: Feature Sliced Design (FSD)

## 📁 Структура проекта

```
src/
├── app/                 # Инициализация приложения
├── pages/              # Страницы приложения
│   ├── home/           # Главная страница
│   ├── catalog/        # Каталог автомобилей
│   ├── car/           # Страница автомобиля
│   ├── order/         # Оформление заказа
│   └── about/         # О компании
├── widgets/           # Сложные UI компоненты
│   ├── header/        # Шапка сайта
│   ├── footer/        # Подвал
│   ├── car-grid/      # Сетка автомобилей
│   └── filters/       # Панель фильтров
├── features/          # Бизнес-логика
│   ├── car-catalog/   # Каталог авто
│   ├── car-order/     # Заказ авто
│   ├── car-details/   # Детали авто
│   ├── calculator/    # Калькулятор стоимости
│   └── search/        # Поиск
└── shared/            # Переиспользуемый код
    ├── ui/           # UI компоненты
    ├── api/          # HTTP клиент
    ├── lib/          # Утилиты и абстракции
    │   ├── platform/ # Платформо-зависимые абстракции
    │   │   ├── storage.js    # Абстракция хранилища
    │   │   ├── theme.js      # Абстракция системной темы
    │   │   └── dom.js        # Абстракция DOM операций
    │   ├── theme.js          # Логика тем
    │   └── ThemeProvider.jsx # Провайдер темы
    ├── hooks/        # Кастомные хуки
    └── config/       # Конфигурация
        └── platform.js       # Определение платформы
```

## 🎯 Особенности архитектуры

### Подготовка к React Native
Проект изначально спроектирован для последующей миграции на React Native:

- **Навигация**: Абстракция над React Router DOM (`shared/lib/navigation.js`)
- **Хранилище**: Абстракция над localStorage (`shared/lib/platform/storage.js`)
- **Системная тема**: Абстракция над window.matchMedia (`shared/lib/platform/theme.js`)
- **DOM операции**: Абстракция над document API (`shared/lib/platform/dom.js`)
- **API клиент**: Универсальный HTTP клиент на Axios
- **Компоненты**: Без DOM-зависимостей в бизнес-логике

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
- ✅ **Автоматическое отслеживание** системных изменений

## 🛠 Установка и запуск

### Требования
- Node.js 19+
- npm или yarn

### Установка
```bash
# Клонирование репозитория
git clone <repository-url>
cd rim-auto

# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env
```

### Запуск
```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Предварительный просмотр сборки
npm run preview
```

## 📱 Миграция на React Native

### Архитектура готовности
Проект подготовлен к миграции через платформо-независимые абстракции:

#### 1. Хранилище (`shared/lib/platform/storage.js`)
```javascript
// Веб (текущее)
localStorage.setItem('theme', 'dark');

// React Native (будущее)
await AsyncStorage.setItem('theme', 'dark');
```

#### 2. Системная тема (`shared/lib/platform/theme.js`)
```javascript
// Веб (текущее)
window.matchMedia('(prefers-color-scheme: dark)').matches

// React Native (будущее)
Appearance.getColorScheme() === 'dark'
```

#### 3. DOM операции (`shared/lib/platform/dom.js`)
```javascript
// Веб (текущее)
document.documentElement.classList.add('dark');

// React Native (будущее)
// Использовать NativeWind или StyleSheet
```

### Этапы миграции:
1. **Заменить файлы в `shared/lib/platform/`** на RN версии
2. **Навигация**: Замена `react-router-dom` на `react-navigation`
3. **Стили**: Переход с TailwindCSS на NativeWind
4. **UI компоненты**: Адаптация под React Native компоненты

### Готовые абстракции:
- `shared/lib/platform/storage.js` - готов к замене на AsyncStorage
- `shared/lib/platform/theme.js` - готов к замене на Appearance API
- `shared/lib/platform/dom.js` - готов к замене на RN API
- `shared/api/client.js` - работает одинаково в веб и RN
- `shared/hooks/` - платформо-независимые хуки

## 🔧 Конфигурация

### Переменные окружения
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Рим Авто
VITE_APP_DESCRIPTION=Автомобили под заказ из Китая
```

### TailwindCSS
Настроен с дизайн-токенами для согласованности стилей:
- Цвета: primary, secondary, accent
- Шрифты: Inter
- Анимации: fade-in, slide-up
- Dark mode: `@custom-variant dark (&:where(.dark, .dark *))`

## 🚦 Роутинг

```javascript
// Доступные маршруты
/           - Главная страница
/catalog    - Каталог автомобилей  
/car/:id    - Страница автомобиля
/order      - Оформление заказа
/about      - О компании
```

