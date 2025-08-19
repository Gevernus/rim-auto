# Деталинг - Работа с видео

## Добавление новых видео

### 1. Размещение файлов
Размещайте видео файлы в соответствующих папках:
```
frontend/src/assets/detailing/
├── vinyl/
│   └── vinyl-wrap-1.mp4
├── armor/
│   └── armor-film-1.mp4
├── polish/
│   └── polish-demo.mp4
└── soundproofing/
    └── soundproof-demo.mp4
```

### 2. Импорт видео
Добавьте импорт в `PrimeWrapDetailPage.jsx`:
```javascript
import vinylWrapVideo from '../../assets/detailing/vinyl/vinyl-wrap-1.mp4';
import armorFilmVideo from '../../assets/detailing/armor/armor-film-1.mp4';
```

### 3. Регистрация в VIDEO_ASSETS
Добавьте видео в объект `VIDEO_ASSETS`:
```javascript
const VIDEO_ASSETS = {
  'vinyl-wrap': vinylWrapVideo,
  'armor-film': armorFilmVideo,
  // Добавляйте новые видео здесь
};
```

### 4. Использование в SERVICE_DETAILS
Укажите видео в соответствующей услуге:
```javascript
'armor-film': {
  // ... другие свойства
  video: VIDEO_ASSETS['armor-film'],
  // ...
}
```

## Рекомендации

- **Формат**: Используйте MP4 с кодеком H.264
- **Размер**: Оптимизируйте для веба (максимум 10-15 МБ)
- **Разрешение**: 720p или 1080p
- **Длительность**: 30-60 секунд для демонстрации процесса

## Компонент VideoPlayer

Компонент автоматически обрабатывает:
- Загрузку видео
- Ошибки воспроизведения
- Fallback при недоступности
- Индикатор загрузки
- Постер изображение
