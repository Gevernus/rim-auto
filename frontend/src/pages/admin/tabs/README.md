# Тестирование системы договоров

## Подготовка тестовых файлов

Для корректного тестирования нужны валидные .docx файлы:

### 1. Создание тестового .docx файла
- Откройте Microsoft Word или LibreOffice Writer
- Создайте простой документ с текстом
- Сохраните как `.docx` (не .doc!)

### 2. Проверка валидности файла
- Файл должен быть больше 0 байт
- .docx файлы должны начинаться с байтов `PK` (ZIP формат)
- Размер файла: минимум 1KB

### 3. Тестирование загрузки
1. Перейдите в админку → вкладка "Договора"
2. Выберите тип договора
3. Нажмите "Загрузить .docx"
4. Выберите валидный .docx файл

### 4. Проверка предпросмотра
- После загрузки должен появиться предпросмотр
- Документ должен корректно отображаться
- Поддерживается светлая и темная тема

## Возможные ошибки

### "Can't find end of central directory"
- Файл поврежден или не является валидным .docx
- Попробуйте создать новый файл в Word

### "File is empty"
- Файл пустой (0 байт)
- Проверьте размер файла

### "Invalid .docx file format"
- Файл не соответствует формату .docx
- Убедитесь, что сохранили как .docx, а не .doc

## Структура файлов

### Docker Volumes
Docker Compose автоматически создает volumes при первом запуске:

```
docker volumes:
├── car-images:/app/static/images      # Изображения автомобилей
└── contracts:/app/static/contracts    # Договоры (.docx)

backend/static/contracts/
├── agency.docx      # Агентский договор
├── consignment.docx # Комиссионный договор
└── sale.docx        # Договор купли-продажи
```

**Примечание**: Volumes создаются автоматически при `docker-compose up`. Ручное создание не требуется.

### Проверка volumes
```bash
# Статистика volumes
curl http://localhost:8000/api/volumes/stats

# Очистка договоров
curl -X POST http://localhost:8000/api/contracts/cleanup

# Очистка изображений  
curl -X POST http://localhost:8000/api/images/cleanup
```

### Управление volumes
```bash
# Создать volumes (если не существуют)
docker volume create rim-auto_contracts
docker volume create rim-auto_car-images

# Просмотр volumes
docker volume ls | grep rim-auto

# Удалить volume (ВНИМАНИЕ: удаляет все данные!)
docker volume rm rim-auto_contracts
```

## API эндпоинты

### Договоры
- `GET /api/contracts` - список всех договоров
- `GET /api/contracts/{type}` - метаданные конкретного договора
- `POST /api/contracts/{type}` - загрузка нового договора
- `POST /api/contracts/cleanup` - очистка всех договоров

### Volumes и файлы
- `GET /api/volumes/stats` - статистика volumes (изображения + договоры)
- `GET /api/images/stats` - статистика изображений
- `POST /api/images/cleanup` - очистка изображений
