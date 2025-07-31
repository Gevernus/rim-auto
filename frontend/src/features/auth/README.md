# Feature: Авторизация через Telegram

Реализация авторизации через Telegram с поддержкой Telegram WebApp и веб-интерфейса.

## 🎯 Функционал

### Бесшовная авторизация (Telegram WebApp)
- Автоматическая авторизация при открытии в Telegram
- Получение данных пользователя из Telegram
- Интеграция с цветовой схемой Telegram

### Веб-авторизация
- Кнопка "Войти через Telegram" для веб-пользователей
- Telegram Login Widget
- Fallback на перенаправление в Telegram бот

### Управление состоянием
- Zustand store для авторизации
- Платформо-независимые абстракции для storage
- Автоматическая валидация токенов

## 📁 Структура

```
features/auth/
├── hooks/
│   ├── useAuth.js           # Основной хук состояния авторизации
│   └── useTelegramAuth.js   # Хук для Telegram авторизации
├── ui/
│   ├── TelegramLoginButton.jsx  # Кнопка входа через Telegram
│   ├── UserProfile.jsx         # Профиль пользователя
│   └── AuthGuard.jsx           # Защита роутов
└── index.js                    # Barrel export
```

## 🔧 Использование

### Хуки

```javascript
import { useTelegramAuth } from 'features/auth';

const MyComponent = () => {
  const {
    isAuthenticated,
    user,
    telegramUser,
    logout,
    handleTelegramWebAuth
  } = useTelegramAuth();

  // Компонент логика
};
```

### Компоненты

```javascript
import { 
  TelegramLoginButton, 
  UserProfile, 
  AuthGuard,
  ProtectedRoute 
} from 'features/auth';

// Кнопка входа
<TelegramLoginButton onAuth={handleAuth} />

// Профиль пользователя
<UserProfile 
  user={user} 
  telegramUser={telegramUser}
  onLogout={logout} 
/>

// Защита контента
<AuthGuard requireAuth={true}>
  <PrivateContent />
</AuthGuard>

// Защищенный роут
<ProtectedRoute>
  <AdminPage />
</ProtectedRoute>
```

## 🚀 API Endpoints

### Backend эндпоинты для авторизации:

- `POST /auth/telegram-webapp` - Авторизация из Telegram WebApp
- `POST /auth/telegram-web` - Авторизация через веб Telegram Login Widget
- `GET /auth/validate` - Валидация токена
- `POST /auth/logout` - Выход из системы

## ⚙️ Настройка

### Переменные окружения

```env
# Telegram Bot Configuration
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
```

### Инициализация

Компонент автоматически инициализируется через `AuthProvider` в App.jsx:

```javascript
const Layout = ({ children }) => (
  <NavigationProvider>
    <AuthProvider>
      {/* App content */}
    </AuthProvider>
  </NavigationProvider>
);
```

## 🔒 Безопасность

- Все токены хранятся в платформо-независимом storage
- Автоматическая валидация токенов при запросах
- Очистка данных при ошибках авторизации
- Защита от XSS через валидацию Telegram данных

## 📱 Платформо-независимость

Компоненты готовы к миграции на React Native:
- Использование платформо-независимых абстракций
- Единый API для веб и мобильных платформ
- Абстракция над storage и навигацией

## 🎨 UI/UX

- Адаптивный дизайн для мобильных устройств
- Поддержка темной темы
- Плавные переходы и анимации
- Fallback компоненты для офлайн режима 