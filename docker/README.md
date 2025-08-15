# Docker Volumes для Rim Auto

## Автоматическое создание

Docker Compose автоматически создает необходимые volumes при первом запуске:

```bash
docker-compose up -d
```

## Структура volumes

```
rim-auto_car-images     # Изображения автомобилей
rim-auto_contracts      # Договоры (.docx)
rim-auto_mongo-data     # База данных MongoDB
```

## Управление

### Просмотр volumes
```bash
docker volume ls | grep rim-auto
```

### Информация о volume
```bash
docker volume inspect rim-auto_contracts
```

### Удаление volume (ВНИМАНИЕ!)
```bash
# Удаляет ВСЕ данные в volume
docker volume rm rim-auto_contracts
```

## API мониторинга

### Статистика volumes
```bash
GET /api/volumes/stats
```

### Очистка
```bash
POST /api/contracts/cleanup   # Очистить договоры
POST /api/images/cleanup      # Очистить изображения
```

## Backup (ручной)

### Создать backup
```bash
# Backup contracts
docker run --rm -v rim-auto_contracts:/data -v $(pwd)/backup:/backup \
  alpine tar czf /backup/contracts.tar.gz -C /data .

# Backup images
docker run --rm -v rim-auto_car-images:/data -v $(pwd)/backup:/backup \
  alpine tar czf /backup/images.tar.gz -C /data .
```

### Восстановить из backup
```bash
# Восстановить contracts
docker run --rm -v rim-auto_contracts:/data -v $(pwd)/backup:/backup \
  alpine sh -c "cd /data && tar xzf /backup/contracts.tar.gz"
```

## Важно

- **Volumes создаются автоматически** - не нужно создавать вручную
- **Данные сохраняются** между перезапусками контейнеров
- **Backup перед очисткой** - всегда делайте backup важных данных
- **Production** - используйте внешние storage решения
