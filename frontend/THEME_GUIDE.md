# Руководство по использованию системы тем

## Обзор

Проект использует Tailwind CSS v4 с гибридной системой тем: семантические переменные для автоматической адаптации + `dark:` классы с `dark-` префиксом для явного контроля.

**Особенности реализации:**
- ✅ Поддержка трех состояний: светлая, темная, системная тема
- ✅ Автоматическое следование системным настройкам
- ✅ Сохранение выбора пользователя в localStorage
- ✅ Плавные переходы между темами с `transition-colors`
- ✅ Гибридный подход: семантические переменные + dark: классы
- ✅ Подготовка к миграции на React Native

## Основные принципы

### 1. Семантические переменные + dark: классы

```jsx
// ✅ Правильно - гибридный подход
<div className="bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary">
  <h1 className="text-text-primary dark:text-dark-text-primary">Заголовок</h1>
  <p className="text-text-secondary dark:text-dark-text-secondary">Описание</p>
  <button className="bg-button-primary text-white">Кнопка</button>
</div>

// ❌ Неправильно - только семантические переменные (не переключается)
<div className="bg-surface text-text-primary">
  <h1 className="text-text-primary">Заголовок</h1>
</div>
```

### 2. Доступные переменные

**Светлая тема (автоматически):**
- `bg-surface` → `oklch(0.98 0.00 0.00)` (белый)
- `text-text-primary` → `oklch(0.21 0.01 285.9)` (темно-серый)
- `border-border` → `oklch(0.87 0.01 286.4)` (светло-серый)

**Темная тема (через dark: классы):**
- `dark:bg-dark-surface` → `oklch(0.21 0.01 285.9)` (темно-серый)
- `dark:text-dark-text-primary` → `oklch(0.98 0.00 0.00)` (белый)
- `dark:border-dark-border` → `oklch(0.44 0.02 285.8)` (темно-серый)

### 3. Цветовые паттерны

**Основные поверхности:**
```jsx
// Основной фон
className="bg-surface dark:bg-dark-surface"

// Вторичный фон
className="bg-surface-secondary dark:bg-dark-surface-secondary"

// Поднятый фон
className="bg-surface-elevated dark:bg-dark-surface-elevated"
```


// Вторичный текст
className="text-text-secondary dark:text-dark-text-secondary"

// Приглушенный текст
className="text-text-muted dark:text-dark-text-muted"
```

**Границы:**
```jsx
// Основные границы
className="border-border dark:border-dark-border"

// Границы при фокусе (неизменные)
className="border-border-focus"
```

### 4. Интерактивные элементы

```jsx
// Кнопки и ховеры
<button className="bg-surface dark:bg-dark-surface hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary transition-colors">
  Интерактивная кнопка
</button>
```

### 5. Брендовые цвета (неизменные)

```jsx
// ✅ Брендовые цвета остаются одинаковыми в обеих темах
<button className="bg-primary-600 hover:bg-primary-700 text-white">
  Основная кнопка
</button>
<div className="bg-error-500 text-white">Ошибка</div>
<div className="bg-success-500 text-white">Успех</div>
```

### 6. Стандартная серая шкала для кастомных случаев

```jsx
// ✅ Когда семантические переменные не подходят
<div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Кастомный контент с конкретными оттенками серого
</div>
```

## Примеры компонентов

### Header с гибридной темой

```jsx
const Header = () => {
  return (
    <header className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border">
      <div className="container">
        <nav className="flex items-center space-x-4">
          <a className="text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">
            Ссылка
          </a>
        </nav>
      </div>
    </header>
  );
};
```

### Card компонент

```jsx
const Card = ({ children }) => {
  return (
    <div className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-6 transition-colors">
      <div className="text-text-primary dark:text-dark-text-primary">
        {children}
      </div>
    </div>
  );
};
```

## Использование темы в компонентах
###  Система тем

#### Три состояния темы
- **Светлая тема** (`light`) - принудительно светлая
- **Темная тема** (`dark`) - принудительно темная  
- **Системная тема** (`system`) - следует настройкам ОС

#### Переключение тем
```jsx
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const { 
    theme,           // Текущее состояние: 'light' | 'dark' | 'system'
    appliedTheme,    // Реально применяемая тема: 'light' | 'dark'
    isDark,          // Boolean: применяется ли темная тема
    isSystem,        // Boolean: используется ли системная тема
    toggle           // Функция переключения
  } = useTheme();
  
  return (
    <div>
      <p>Текущая тема: {theme}</p>
      <p>Применяется: {appliedTheme}</p>
      <p>Темная: {isDark ? 'Да' : 'Нет'}</p>
      <p>Системная: {isSystem ? 'Да' : 'Нет'}</p>
      <button onClick={toggle}>
        Переключить тему
      </button>
    </div>
  );
};

**Логика переключения:**
1. **Светлая** → **Темная** → **Системная** → **Светлая**
2. При системной теме показывается иконка монитора с индикатором
3. Подсказки показывают следующее состояние

```
src/
├── app/
│   └── index.css                    # Основные дизайн-токены
├── shared/
│   ├── hooks/
│   │   └── useTheme.js              # Хук для работы с темой
│   ├── lib/
│   │   ├── theme.js                 # Утилиты для работы с темой
│   │   └── ThemeProvider.jsx        # Провайдер темы
│   └── ui/
│       └── ThemeToggle.jsx          # Компонент переключателя темы
```

```jsx
import { useTheme } from 'shared/hooks/useTheme';

const MyComponent = () => {
  const { theme, isDark, isSystem, toggle } = useTheme();
  
  return (
    <div className="bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary transition-colors">
      <p>Текущая тема: {theme}</p>
      {isSystem && <span>Следует системной теме</span>}
      <button onClick={toggle} className="bg-primary-600 hover:bg-primary-700 text-white">
        Переключить тему
      </button>
    </div>
  );
};
```

## Миграция на React Native

Гибридный подход полностью готов для миграции на React Native:

- **Web**: семантические переменные + `dark:` классы работают через data-theme атрибут
- **React Native**: NativeWind поддерживает те же классы
- **Переменные**: `dark-surface`, `dark-text-primary` и др. работают одинаково

```jsx
// Один и тот же код работает на обеих платформах
<View className="bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary">
  <Text className="text-text-primary dark:text-dark-text-primary">Универсальный код</Text>
</View>
```

## Преимущества гибридного подхода

1. **Семантические переменные** - консистентность и читаемость
2. **Dark: классы** - явный контроль над темной темой
3. **Гибкость** - можно использовать оба подхода в зависимости от задачи
4. **Кроссплатформенность** - готовность к React Native
5. **Производительность** - оптимизированная работа Tailwind CSS 