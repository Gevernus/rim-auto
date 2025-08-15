from fastapi import FastAPI, Query, HTTPException, Depends, Request
from fastapi import UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from bson import ObjectId
import os
import json
from datetime import datetime, timedelta
from typing import Optional, List
import random
import hmac
import hashlib
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
import urllib.parse
import time
from pathlib import Path
import jwt
import re

app = FastAPI()

# Добавляем CORS middleware для доступа frontend к backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://casa-de-costura.ru", "*"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Разрешаем все HTTP методы
    allow_headers=["*"],  # Разрешаем все заголовки
    expose_headers=["*"],  # Разрешаем все заголовки в ответе
)

# Пути для статических файлов (Docker volumes)
STATIC_IMAGES_DIR = Path("static/images")
CONTRACTS_DIR = Path("static/contracts")

# Подключаем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

# Telegram Bot Token - REPLACE WITH YOURS
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 дней

# Security
security = HTTPBearer(auto_error=False)

# MongoDB setup
client = MongoClient(os.environ.get("MONGO_URL", "mongodb://mongo:27017/"))
db = client.cars_db
cars_collection = db.cars
scrape_cache = db.scrape_cache
users_collection = db.users  # Коллекция для пользователей
credit_applications = db.credit_applications  # Коллекция для кредитных заявок
leasing_applications = db.leasing_applications  # Коллекция для лизинговых заявок
reviews_collection = db.reviews  # Коллекция для отзывов
# MANAGER_IDS = set(map(lambda x: x.strip(), os.environ.get("MANAGER_IDS", "").split(","))) if os.environ.get("MANAGER_IDS") else set()


def download_and_save_image(image_url, car_id):
    """
    Скачивает изображение и сохраняет в статическую папку
    Возвращает локальный URL или None если не удалось
    """
    if not image_url or image_url == "":
        return None
    
    try:
        # Создаем безопасное имя файла из car_id
        safe_filename = "".join(c for c in str(car_id) if c.isalnum() or c in ('-', '_'))
        
        # Определяем расширение файла
        parsed_url = urllib.parse.urlparse(image_url)
        path = parsed_url.path.lower()
        
        if path.endswith(('.jpg', '.jpeg')):
            extension = '.jpg'
        elif path.endswith('.png'):
            extension = '.png'
        elif path.endswith('.webp'):
            extension = '.webp'
        else:
            extension = '.jpg'  # Дефолтное расширение
        
        filename = f"{safe_filename}{extension}"
        file_path = STATIC_IMAGES_DIR / filename
        
        # Проверяем, не скачано ли уже это изображение
        if file_path.exists():
            return f"/static/images/{filename}"
        
        # Скачиваем изображение
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.che168.com/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
        
        response = requests.get(image_url, headers=headers, timeout=30, stream=True)
        response.raise_for_status()
        
        # Проверяем что это действительно изображение
        content_type = response.headers.get('content-type', '').lower()
        if not content_type.startswith('image/'):
            print(f"Warning: URL {image_url} не является изображением (content-type: {content_type})")
            return None
        
        # Сохраняем файл
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Изображение сохранено: {filename}")
        
        # Возвращаем локальный URL
        return f"/static/images/{filename}"
        
    except Exception as e:
        print(f"Ошибка скачивания изображения {image_url}: {e}")
        return None

def get_mock_cars():
    """Generates a list of mock car data."""
    brands = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi"]
    models = ["Camry", "Civic", "F-150", "Silverado", "Rogue", "X5", "C-Class", "A4"]
    cars = []
    for i in range(100):
        brand = random.choice(brands)
        cars.append({
            "seriesId": i,
            "brandName": brand,
            "seriesName": f"{random.choice(models)} {random.randint(2010, 2023)}",
            "price": f"{random.randint(10, 50)}万",
            "volume": round(random.uniform(1.0, 5.0), 1),
            "imageUrl": f"https://picsum.photos/seed/{i}/400/300"
        })
    return cars

def scrape_and_cache_cars():
    """Scrapes car data from the website and caches it."""
    url = "https://www.che168.com/china/list/"
    
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-web-security')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Remote(
        command_executor='http://selenium:4444/wd/hub',
        options=options
    )
    
    try:
        print(f"Переходим на сайт: {url}")
        driver.get(url)
        
        # Ждем загрузки страницы
        driver.implicitly_wait(15)
        time.sleep(5)  # Дополнительная пауза для полной загрузки
        
        # Убираем детектирование автоматизации
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        # Save screenshot для отладки
        driver.save_screenshot("debug_screenshot.png")
        print("Screenshot saved as debug_screenshot.png")
        
        # Save page source для отладки
        with open("debug_page_source.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("Page source saved as debug_page_source.html")
        
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        # Попробуем прокрутить страницу для загрузки динамического контента
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        
        # Обновляем soup после прокрутки
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
    finally:
        driver.quit()

    car_list = []

    # Расширенный список селекторов для поиска автомобилей на che168.com
    selectors_to_try = [
        # Основные списки автомобилей
        "div[class*='viewlist_li']",          # Основной класс списка на che168.com  
        "li[class*='list-item']",             # li элементы списка
        "div[class*='list-item']",            # div элементы списка
        ".list-item",                         # Простой класс списка
        
        # Карточки автомобилей
        "div[class*='car-card']",             # Карточки автомобилей
        "div[class*='item-pic']",             # Элементы с картинками
        "div[class*='pic-box']",              # Контейнеры картинок
        
        # Результаты поиска
        # "div[class*='result']",               # Убираем - ловит уведомления
        "div[class*='search-result']",        # Результаты поиска
        "article",                            # Семантические элементы
        
        # Fallback селекторы
        "[data-testid*='car']",               # data атрибуты
        ".used-car-item",                     # Подержанные автомобили
        ".sale-car",                          # Продаваемые авто
        "li[class*='car']",                   # li элементы с car
    ]
    
    car_containers = []
    used_selector = None
    
    print(f"🔍 Попробуем {len(selectors_to_try)} селекторов для поиска автомобилей...")
    
    for selector in selectors_to_try:
        car_containers = soup.select(selector)
        print(f"   Селектор '{selector}': найдено {len(car_containers)} элементов")
        
        if car_containers and len(car_containers) > 2:  # Минимум 3 элемента
            print(f"✅ Выбран селектор '{selector}' с {len(car_containers)} элементами")
            used_selector = selector
            break
        elif car_containers and len(car_containers) > 0:
            # Проверим, содержат ли элементы признаки автомобилей
            has_car_content = False
            for container in car_containers[:3]:  # Проверяем первые 3
                text_content = container.get_text().lower()
                if any(keyword in text_content for keyword in ['万', '车', '汽车', 'bmw', 'audi', 'toyota']):
                    has_car_content = True
                    break
            
            if has_car_content:
                print(f"✅ Выбран селектор '{selector}' с {len(car_containers)} элементами (найден автомобильный контент)")
                used_selector = selector
                break
    
    # Дополнительная отладка: показываем структуру первых найденных элементов
    if car_containers:
        print(f"\n📋 Анализ первых найденных элементов:")
        for i, container in enumerate(car_containers[:3]):
            print(f"   Элемент {i+1}:")
            print(f"      Тег: {container.name}")
            print(f"      Классы: {container.get('class', [])}")
            text_preview = container.get_text()[:100].replace('\n', ' ').strip()
            print(f"      Текст: {text_preview}...")
    
    # Если ничего не найдено стандартными селекторами
    if not car_containers:
        print("❌ Автомобили не найдены стандартными селекторами")
        print("🔍 Пробуем альтернативный подход через поиск изображений...")
        
        # Попробуем найти изображения с подписями автомобилей
        all_images = soup.find_all("img")
        print(f"   Всего изображений на странице: {len(all_images)}")
        
        car_related_images = []
        
        for img in all_images:
            alt_text = img.get('alt', '').lower()
            src = img.get('src', '')
            title = img.get('title', '').lower()
            
            # Ищем изображения, которые могут быть автомобилями
            car_keywords = ['车', 'car', '汽车', '奔驰', '宝马', '奥迪', '丰田', '本田', '大众', '比亚迪', 'bmw', 'audi', 'toyota', 'honda']
            if any(keyword in alt_text + title for keyword in car_keywords):
                parent = img.find_parent()
                if parent and parent not in car_related_images:
                    car_related_images.append(parent)
                    print(f"   Найдено изображение автомобиля: {alt_text[:50]}...")
        
        if car_related_images:
            car_containers = car_related_images[:20]  # Ограничиваем до 20
            print(f"🔍 Найдено {len(car_containers)} потенциальных автомобилей через изображения")
            used_selector = "image-based-search"
    
    # Если все еще ничего не найдено, создаем тестовые данные
    if not car_containers:
        print("🚨 Парсинг не удался - создаем тестовые данные")
        
        for i in range(10):
            car_id = f"test_car_{i}"
            test_image_url = f"https://picsum.photos/seed/{i+100}/800/600"
            
            # Скачиваем тестовое изображение
            print(f"📸 Скачиваем тестовое изображение {i+1}/10...")
            local_image_url = download_and_save_image(test_image_url, car_id)
            time.sleep(0.5)  # Короткая задержка
            
            car_list.append({
                "title": f"测试汽车 {i+1}号 - Test Car #{i+1}",
                "price": f"{random.randint(15, 45)}万",
                "image_url": test_image_url,
                "local_image_url": local_image_url,
                "car_id": car_id
            })
        
        # Сохраняем в кэш
        if car_list:
            scrape_cache.delete_many({})
            scrape_cache.insert_many(car_list)
            
        return car_list
    
    print(f"🔄 Обрабатываем {len(car_containers)} найденных элементов...")
    
    for i, car_container in enumerate(car_containers):
        try:
            # Расширенный поиск заголовка
            title = None
            title_selectors = [
                "h3", "h4", "h5", ".title", ".car-name", ".name",
                "[class*='title']", "[class*='name']", "a[title]",
                ".series-name", ".model-name", ".car-title"
            ]
            
            for title_selector in title_selectors:
                title_element = car_container.select_one(title_selector)
                if title_element:
                    title_text = title_element.get('title') or title_element.text.strip()
                    if title_text and len(title_text) > 2:
                        title = title_text
                        break
            
            # Расширенный поиск цены
            price = None
            price_selectors = [
                ".price", "[class*='price']", ".money", "[class*='money']",
                "span[style*='color: rgb(255']", ".sale-price", ".current-price"
            ]
            
            for price_selector in price_selectors:
                price_element = car_container.select_one(price_selector)
                if price_element:
                    price_text = price_element.text.strip()
                    # Ищем числа с "万"
                    if '万' in price_text or any(char.isdigit() for char in price_text):
                        price = price_text
                        break
            
            # Расширенный поиск изображения
            image_url = ""
            image_element = car_container.find("img")
            if image_element:
                # Проверяем разные атрибуты для URL изображения
                for attr in ['src', 'data-src', 'data-original', 'data-lazy', 'data-img']:
                    url = image_element.get(attr)
                    if url and url != 'data:image' and 'placeholder' not in url.lower():
                        # Исправляем относительные URL
                        if url.startswith('//'):
                            image_url = 'https:' + url
                        elif url.startswith('/'):
                            image_url = 'https://www.che168.com' + url
                        elif url.startswith('http'):
                            image_url = url
                        else:
                            image_url = 'https:' + url
                        break

            # Добавляем только если есть название
            if title and len(title.strip()) > 2:
                # Если нет цены, создаем случайную
                if not price:
                    price = f"{random.randint(15, 50)}万"
                
                # Генерируем уникальный ID для автомобиля
                car_id = f"che168_{len(car_list)}_{hash(title + price) % 10000}"
                
                # Скачиваем изображение если есть URL
                local_image_url = None
                if image_url:
                    print(f"📸 Скачиваем изображение для: {title[:30]}...")
                    local_image_url = download_and_save_image(image_url, car_id)
                    time.sleep(1)  # Задержка между скачиваниями
                
                car_list.append({
                    "title": title,
                    "price": price,
                    "image_url": image_url,
                    "local_image_url": local_image_url,
                    "car_id": car_id
                })
                
                print(f"✅ Добавлен автомобиль #{len(car_list)}: {title[:30]}... - {price}")
            
        except Exception as e:
            print(f"❌ Ошибка обработки элемента {i}: {e}")
            continue
    
    print(f"🎉 Успешно обработано {len(car_list)} автомобилей с селектором: {used_selector}")
    
    # Сохраняем в кэш только если есть данные
    if car_list:
        scrape_cache.delete_many({})
        scrape_cache.insert_many(car_list)
        print(f"💾 Данные сохранены в кэш")
    else:
        print("⚠️ Нет данных для сохранения в кэш")
        
    return car_list


def verify_telegram_auth(auth_data):
    if not auth_data:
        return False

    # Проверяем наличие хеша
    if 'hash' not in auth_data:
        # Для тестирования разрешаем авторизацию без хеша
        print("⚠️ Hash отсутствует - разрешаем для тестирования")
        return True

 # Создаем копию данных чтобы не изменять оригинал
    auth_data_copy = auth_data.copy()
    received_hash = auth_data_copy.pop('hash')
    auth_data_list = [f"{key}={value}" for key, value in sorted(auth_data_copy.items())]
    data_check_string = "\n".join(auth_data_list)

    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    return received_hash == calculated_hash

# JWT функции
def create_jwt_token(user_data):
    """Создает JWT токен для пользователя"""
    payload = {
        "user_id": user_data.get("id"),
        "username": user_data.get("username"),
        "first_name": user_data.get("first_name"),
        "last_name": user_data.get("last_name"),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str):
    """Проверяет JWT токен и возвращает данные пользователя"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Получает текущего пользователя из JWT токена"""
    if not credentials:
        return None
    
    user_data = verify_jwt_token(credentials.credentials)
    if not user_data:
        return None
    
    return user_data

def get_current_user_or_debug(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Получает текущего пользователя из JWT токена или разрешает debug режим"""
    if not credentials:
        return None
    
    # Проверяем стандартный JWT токен
    user_data = verify_jwt_token(credentials.credentials)
    if user_data:
        return user_data
    
    # Если стандартный токен не работает, проверяем debug токен
    try:
        import base64
        import json
        
        # Декодируем Base64 токен
        decoded_token = base64.b64decode(credentials.credentials).decode('utf-8')
        debug_data = json.loads(decoded_token)
        
        # Проверяем что это debug токен
        if debug_data.get('debug') and debug_data.get('user'):
            user_info = debug_data['user']
            return {
                "user_id": user_info.get('id'),
                "username": user_info.get('username'),
                "first_name": user_info.get('name', '').split()[0] if user_info.get('name') else '',
                "last_name": ' '.join(user_info.get('name', '').split()[1:]) if user_info.get('name') else '',
                "is_debug": True
            }
    except Exception as e:
        print(f"Debug token parsing error: {e}")
        return None
    
    return None

def save_user_to_db(user_data):
    """Сохраняет или обновляет пользователя в базе данных"""
    user_id = user_data.get("id")
    if not user_id:
        return None
    
    # Проверяем существует ли пользователь
    existing_user = users_collection.find_one({"telegram_id": user_id})
    
    if existing_user:
        # Обновляем существующего пользователя
        update_data = {
            "username": user_data.get("username"),
            "first_name": user_data.get("first_name"),
            "last_name": user_data.get("last_name"),
            "photo_url": user_data.get("photo_url"),
            "last_login": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        users_collection.update_one(
            {"telegram_id": user_id},
            {"$set": update_data}
        )
    else:
        # Создаем нового пользователя
        new_user = {
            "telegram_id": user_id,
            "username": user_data.get("username"),
            "first_name": user_data.get("first_name"),
            "last_name": user_data.get("last_name"),
            "photo_url": user_data.get("photo_url"),
            "last_login": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        users_collection.insert_one(new_user)
    
    return users_collection.find_one({"telegram_id": user_id}, {"_id": 0})

@app.post("/api/auth/telegram-webapp")
def auth_telegram_webapp(auth_data: dict):
    """Авторизация из Telegram WebApp"""
    try:
        init_data = auth_data.get("initData")
        user_data = auth_data.get("user")
        
        if not init_data or not user_data:
            raise HTTPException(status_code=400, detail="Missing initData or user data")
        
        # Здесь должна быть валидация initData
        # Для упрощения пропускаем валидацию initData в тестовой версии
        
        # Сохраняем пользователя в БД
        saved_user = save_user_to_db(user_data)
        
        # Создаем JWT токен
        token = create_jwt_token(user_data)
        
        return {
            "success": True,
            "user": saved_user,
            "token": token,
            "message": "Successful authentication"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@app.post("/api/auth/telegram-web")
def auth_telegram_web(auth_data: dict):
    """Авторизация через Telegram Login Widget"""
    if not verify_telegram_auth(auth_data.copy()):
        raise HTTPException(status_code=403, detail="Invalid authentication data")
    
    # Сохраняем пользователя в БД
    saved_user = save_user_to_db(auth_data)
    
    # Создаем JWT токен
    token = create_jwt_token(auth_data)
    
    return {
        "success": True,
        "user": saved_user,
        "token": token,
        "message": "Successful authentication"
    }

@app.get("/api/auth/validate")
def validate_token(current_user = Depends(get_current_user)):
    """Валидация JWT токена"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return {
        "valid": True,
        "user": current_user
    }

@app.post("/api/auth/logout")
def logout(current_user = Depends(get_current_user)):
    """Выход из системы"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # В простой реализации просто возвращаем успех
    # В продакшене здесь можно добавить blacklist токенов
    return {
        "success": True,
        "message": "Successfully logged out"
    }

@app.post("/api/auth/telegram")
async def auth_telegram(request: Request):
    """Единая точка для Login Widget (поддержка JSON и form-data)"""
    try:
        content_type = request.headers.get("content-type", "")
        auth_data = None

        if "application/json" in content_type:
            auth_data = await request.json()
        elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
            form = await request.form()
            # Приводим значения к str как ожидает алгоритм проверки
            auth_data = {k: (v if isinstance(v, str) else str(v)) for k, v in form.items()}
        else:
            # Попробуем JSON как fallback
            try:
                auth_data = await request.json()
            except Exception:
                auth_data = None

        if not isinstance(auth_data, dict) or not auth_data:
            raise HTTPException(status_code=400, detail="Invalid or empty auth data")

        if not verify_telegram_auth(auth_data.copy()):
            raise HTTPException(status_code=403, detail="Invalid authentication data")
        
        # Сохраняем пользователя в БД
        saved_user = save_user_to_db(auth_data)
        
        # Создаем JWT токен
        token = create_jwt_token(auth_data)
        
        return {
            "success": True,
            "user": saved_user,
            "token": token,
            "message": "Successful authentication"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@app.get("/api/scrape-cars")
def get_scraped_cars():
    """Returns scraped car data, using cache if available."""
    cached_cars = list(scrape_cache.find({}, {"_id": 0}))
    if cached_cars:
        return {
            "source": "cache",
            "count": len(cached_cars),
            "data": json.loads(json.dumps(cached_cars, default=str))
        }

    car_list = scrape_and_cache_cars()
    return {
        "source": "live",
        "count": len(car_list),
        "data": car_list
    }

@app.post("/api/refresh-cache")
def refresh_cache():
    """Force refresh the car cache by scraping new data."""
    try:
        car_list = scrape_and_cache_cars()
        return {
            "success": True,
            "message": f"Cache refreshed with {len(car_list)} cars",
            "count": len(car_list)
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to refresh cache: {str(e)}"
        }

@app.get("/api/images/stats")
def get_images_stats():
    """Возвращает статистику скачанных изображений."""
    try:
        images_dir = STATIC_IMAGES_DIR
        if not images_dir.exists():
            return {"total_images": 0, "total_size": 0, "status": "directory_not_found"}
        
        image_files = list(images_dir.glob("*"))
        total_size = sum(f.stat().st_size for f in image_files if f.is_file())
        
        return {
            "total_images": len(image_files),
            "total_size": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "directory": str(images_dir),
            "status": "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

@app.get("/api/volumes/stats")
def get_volumes_stats():
    """Возвращает статистику volumes (изображения и договоры)."""
    try:
        stats = {
            "images": {"files": 0, "size_mb": 0},
            "contracts": {"files": 0, "size_mb": 0}
        }
        
        # Статистика изображений
        if STATIC_IMAGES_DIR.exists():
            image_files = list(STATIC_IMAGES_DIR.glob("*"))
            total_size = sum(f.stat().st_size for f in image_files if f.is_file())
            stats["images"] = {
                "files": len(image_files),
                "size_mb": round(total_size / (1024 * 1024), 2)
            }
        
        # Статистика договоров
        if CONTRACTS_DIR.exists():
            contract_files = list(CONTRACTS_DIR.glob("*.docx"))
            total_size = sum(f.stat().st_size for f in contract_files if f.is_file())
            stats["contracts"] = {
                "files": len(contract_files),
                "size_mb": round(total_size / (1024 * 1024), 2)
            }
        
        return {
            "status": "ok",
            "volumes": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"error": str(e), "status": "error"}

@app.post("/api/images/cleanup")
def cleanup_images():
    """Очищает папку с изображениями."""
    try:
        images_dir = STATIC_IMAGES_DIR
        if not images_dir.exists():
            return {"message": "Directory not found", "status": "ok"}
        
        deleted_count = 0
        for image_file in images_dir.glob("*"):
            if image_file.is_file():
                image_file.unlink()
                deleted_count += 1
        
        return {
            "message": f"Deleted {deleted_count} images",
            "deleted_count": deleted_count,
            "status": "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

@app.post("/api/contracts/cleanup")
def cleanup_contracts():
    """Очищает папку с договорами."""
    try:
        contracts_dir = CONTRACTS_DIR
        if not contracts_dir.exists():
            return {"message": "Directory not found", "status": "ok"}
        
        deleted_count = 0
        for contract_file in contracts_dir.glob("*.docx"):
            if contract_file.is_file():
                contract_file.unlink()
                deleted_count += 1
        
        return {
            "message": f"Deleted {deleted_count} contracts",
            "deleted_count": deleted_count,
            "status": "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}


# ====== Договоры (.docx) ======
ALLOWED_CONTRACT_TYPES = {"agency", "consignment", "sale"}
ALLOWED_CONTRACT_EXT = {".docx", ".doc"}

def _contract_filename(contract_type: str) -> str:
    # Храним под фиксированным именем <type>.docx, даже если загрузили .doc
    return f"{contract_type}.docx"

def _contract_path(contract_type: str) -> Path:
    return CONTRACTS_DIR / _contract_filename(contract_type)

def _contract_meta(contract_type: str):
    file_path = _contract_path(contract_type)
    if not file_path.exists():
        return None
    stat = file_path.stat()
    return {
        "type": contract_type,
        "file_name": file_path.name,
        "size": stat.st_size,
        "updated_at": datetime.utcfromtimestamp(stat.st_mtime).isoformat(),
        "url": f"/static/contracts/{file_path.name}",
    }

@app.get("/api/contracts")
def list_contracts():
    try:
        result = []
        for t in sorted(list(ALLOWED_CONTRACT_TYPES)):
            meta = _contract_meta(t)
            if meta:
                result.append(meta)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list contracts: {str(e)}")

@app.get("/api/contracts/{contract_type}")
def get_contract(contract_type: str):
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")
    meta = _contract_meta(contract_type)
    if not meta:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"data": meta}

@app.get("/static/contracts/{contract_type}.docx")
def serve_contract_file(contract_type: str):
    """Раздает файлы контрактов с правильным MIME типом"""
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")
    
    file_path = _contract_path(contract_type)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Принудительно устанавливаем заголовки
    response = FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{contract_type}.docx"
    )
    
    # Дополнительно устанавливаем заголовок
    response.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return response

@app.post("/api/contracts/{contract_type}")
async def upload_contract(
    contract_type: str,
    file: UploadFile = File(...),
):
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")

    original_name = file.filename or ""
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_CONTRACT_EXT:
        raise HTTPException(status_code=400, detail="Only .docx or .doc files are allowed")

    try:
        # Читаем содержимое файла
        content = await file.read()
        
        # Проверяем размер файла
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Проверяем, что это действительно .docx/.doc файл
        # .docx файлы начинаются с PK (ZIP формат)
        # .doc файлы имеют специфическую структуру
        if ext == '.docx':
            if not content.startswith(b'PK'):
                raise HTTPException(status_code=400, detail="Invalid .docx file format")
            
            # Дополнительная проверка структуры .docx файла
            try:
                import zipfile
                import io
                
                with zipfile.ZipFile(io.BytesIO(content)) as zip_file:
                    # Проверяем наличие обязательных файлов .docx
                    required_files = ['word/document.xml', '[Content_Types].xml']
                    if not all(f in zip_file.namelist() for f in required_files):
                        raise HTTPException(status_code=400, detail="Invalid .docx file structure")
            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail="Invalid .docx file format")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error validating .docx file: {str(e)}")
        
        target_path = _contract_path(contract_type)
        # Сохраняем как <type>.docx
        with open(target_path, "wb") as f:
            f.write(content)

        meta = _contract_meta(contract_type)
        return {"success": True, "data": meta}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload: {str(e)}")


@app.delete("/api/contracts/{contract_type}")
def delete_contract(contract_type: str):
    """Удаляет файл договора указанного типа."""
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")

    try:
        target_path = _contract_path(contract_type)
        if not target_path.exists():
            raise HTTPException(status_code=404, detail="Contract not found")

        target_path.unlink(missing_ok=False)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/cars")
def get_cars(
    page: int = 1,
    page_size: int = 10,
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
    title: Optional[str] = None,
    price_from: Optional[str] = None,
    price_to: Optional[str] = None,
    year_from: Optional[str] = None,
    year_to: Optional[str] = None,
    country: Optional[str] = None,
):
    print(f"🔍 API /cars вызван с параметрами:")
    print(f"   page: {page}")
    print(f"   page_size: {page_size}")
    print(f"   title: {title}")
    print(f"   price_from: {price_from}")
    print(f"   price_to: {price_to}")
    print(f"   year_from: {year_from}")
    print(f"   year_to: {year_to}")
    print(f"   country: {country}")
    print(f"   sort_by: {sort_by}")
    print(f"   sort_order: {sort_order}")
    
    # Get cached scraped data
    cached_cars = list(scrape_cache.find({}, {"_id": 0}))
    print(f"📋 Всего автомобилей в кэше: {len(cached_cars)}")
    
    # If no cached data, scrape fresh data
    if not cached_cars:
        print("⚠️ Кэш пуст, запускаем парсинг...")
        car_list = scrape_and_cache_cars()
        cached_cars = list(scrape_cache.find({}, {"_id": 0}))
        print(f"✅ После парсинга автомобилей: {len(cached_cars)}")
    
    # Структурируем данные автомобилей
    # print("🔧 Структурируем данные автомобилей...")
    structured_cars = []
    for car in cached_cars:
        try:
            structured_car = structure_car_data(car)
            structured_cars.append(structured_car)
        except Exception as e:
            print(f"❌ Ошибка структурирования автомобиля: {e}")
            continue
    
    # print(f"✅ Структурировано {len(structured_cars)} автомобилей")
    
    # Apply filters
    filtered_cars = structured_cars
    # print(f"🔍 Начинаем фильтрацию из {len(filtered_cars)} автомобилей")
    
    if title:
        # print(f"🔍 Фильтрация по title: '{title}'")
        before_count = len(filtered_cars)
        filtered_cars = [car for car in filtered_cars if title.lower() in car.get("title", "").lower() or title.lower() in car.get("brand", "").lower()]
        after_count = len(filtered_cars)
        # print(f"   Результат: {before_count} -> {after_count} автомобилей")
    
    if price_from:
        # print(f"🔍 Фильтрация по price_from: {price_from}")
        before_count = len(filtered_cars)
        filtered_cars = [car for car in filtered_cars if car.get("price_value", 0) >= float(price_from)]
        after_count = len(filtered_cars)
        # print(f"   Результат: {before_count} -> {after_count} автомобилей")
    
    if price_to:
        # print(f"🔍 Фильтрация по price_to: {price_to}")
        before_count = len(filtered_cars)
        filtered_cars = [car for car in filtered_cars if car.get("price_value", 0) <= float(price_to)]
        after_count = len(filtered_cars)
        # print(f"   Результат: {before_count} -> {after_count} автомобилей")

    # Фильтрация по году
    if year_from or year_to:
        # print(f"🔍 Фильтрация по году: from={year_from}, to={year_to}")
        before_count = len(filtered_cars)
        
        # Фильтруем автомобили с годом
        cars_with_year = [car for car in filtered_cars if car.get("year") is not None]
        # print(f"   Автомобилей с годом: {len(cars_with_year)} из {len(filtered_cars)}")
        
        if year_from:
            year_from_int = int(year_from)
            cars_with_year = [car for car in cars_with_year if car.get("year", 0) >= year_from_int]
            # print(f"   После фильтрации по year_from ({year_from_int}): {len(cars_with_year)}")
        
        if year_to:
            year_to_int = int(year_to)
            cars_with_year = [car for car in cars_with_year if car.get("year", 0) <= year_to_int]
            # print(f"   После фильтрации по year_to ({year_to_int}): {len(cars_with_year)}")
        
        filtered_cars = cars_with_year
        after_count = len(filtered_cars)
        # print(f"   Результат фильтрации по году: {before_count} -> {after_count} автомобилей")

    # Фильтрация по стране
    if country:
        # print(f"🔍 Фильтрация по стране: {country}")
        before_count = len(filtered_cars)
        if country == 'all':
            # Показываем все автомобили
            pass
        else:
            filtered_cars = [car for car in filtered_cars if car.get("country") == country]
        after_count = len(filtered_cars)
        # print(f"   Результат: {before_count} -> {after_count} автомобилей")

    # Apply sorting
    if sort_by:
        # print(f"🔍 Сортировка по {sort_by} в порядке {sort_order}")
        reverse = sort_order == "desc"
        if sort_by == "title":
            filtered_cars.sort(key=lambda x: x.get("title", ""), reverse=reverse)
        elif sort_by == "price":
            filtered_cars.sort(key=lambda x: x.get("price_value", 0), reverse=reverse)
        elif sort_by == "year":
            filtered_cars.sort(key=lambda x: x.get("year", 0), reverse=reverse)
        elif sort_by == "brand":
            filtered_cars.sort(key=lambda x: x.get("brand", ""), reverse=reverse)

    total_cars = len(filtered_cars)
    # print(f"📊 Итого отфильтровано: {total_cars} автомобилей")
    
    # Apply pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_cars = filtered_cars[start_index:end_index]
    # print(f"📄 Пагинация: страница {page}, показано {len(paginated_cars)} из {total_cars}")

    # Показываем примеры отфильтрованных автомобилей
    # if paginated_cars:
    #     print("📋 Примеры отфильтрованных автомобилей:")
    #     for i, car in enumerate(paginated_cars[:3]):
    #         print(f"   {i+1}. {car.get('brand', 'N/A')} {car.get('model', 'N/A')} ({car.get('year', 'N/A')}) - {car.get('price', {}).get('formatted', 'N/A')}")
    
    result = {
        "total": total_cars,
        "page": page,
        "page_size": page_size,
        "data": json.loads(json.dumps(paginated_cars, default=str))
    }
    
    print(f"✅ Возвращаем результат: {len(result['data'])} автомобилей")
    return result

@app.get("/api/health")
def get_health():
    """Проверяет статус системы и подключенных сервисов."""
    health_status = {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Проверка MongoDB
    try:
        client.admin.command('ping')
        health_status["services"]["mongodb"] = "ok"
    except Exception as e:
        health_status["services"]["mongodb"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # Проверка Selenium
    try:
        selenium_url = "http://selenium:4444/wd/hub/status"
        response = requests.get(selenium_url, timeout=5)
        if response.status_code == 200:
            health_status["services"]["selenium"] = "ok"
        else:
            health_status["services"]["selenium"] = f"error: status {response.status_code}"
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["selenium"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # Проверка кэша автомобилей
    try:
        car_count = scrape_cache.count_documents({})
        health_status["services"]["car_cache"] = f"ok ({car_count} cars)"
    except Exception as e:
        health_status["services"]["car_cache"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

@app.get("/api/debug/page-source")
def get_debug_page_source():
    """Возвращает последний сохраненный HTML источник страницы для отладки."""
    try:
        if os.path.exists("debug_page_source.html"):
            with open("debug_page_source.html", "r", encoding="utf-8") as f:
                content = f.read()
            return {
                "status": "ok",
                "content": content[:50000],  # Ограничиваем до 50KB
                "full_length": len(content),
                "message": "HTML source from last scraping attempt"
            }
        else:
            return {
                "status": "not_found",
                "message": "No debug page source found. Run scraping first."
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/debug/selectors-test")
def test_selectors():
    """Тестирует различные селекторы на последней сохраненной странице."""
    try:
        if not os.path.exists("debug_page_source.html"):
            return {
                "status": "not_found",
                "message": "No debug page source found. Run scraping first."
            }
        
        with open("debug_page_source.html", "r", encoding="utf-8") as f:
            content = f.read()
        
        soup = BeautifulSoup(content, "html.parser")
        
        # Тестируем различные селекторы
        selectors_to_test = [
            # Основные селекторы для карточек автомобилей
            "li.cxc-card",
            "li.cards-li",
            "li.list-photo-li",
            ".cxc-card",
            ".cards-li",
            ".list-photo-li",
            
            # Комбинированные селекторы
            "li.cards-li.cxc-card",
            "li.list-photo-li.cxc-card",
            "li.cards-li.list-photo-li",
            
            # Альтернативные селекторы
            "div[class*='viewlist_li']",
            "li[class*='list-item']", 
            "div[class*='list-item']",
            "div[class*='car-card']",
            "div[class*='item-pic']",
            "div[class*='pic-box']",
            "div[class*='result']",
            ".list-item",
            "article",
            
            # Дополнительные селекторы из интересных классов
            ".vehicle-search-list",
            ".vehicle-second-list",
            ".tp-cards-tofu",
            ".right-sidebar-car"
        ]
        
        results = {}
        
        for selector in selectors_to_test:
            elements = soup.select(selector)
            results[selector] = {
                "count": len(elements),
                "sample_classes": [elem.get('class', []) for elem in elements[:3]],
                "sample_text": [elem.get_text()[:100].strip() for elem in elements[:3]]
            }
        
        # Также ищем все уникальные классы
        all_divs = soup.find_all(['div', 'li', 'article'])
        unique_classes = set()
        for div in all_divs:
            classes = div.get('class', [])
            for cls in classes:
                if any(keyword in cls.lower() for keyword in ['list', 'item', 'car', 'card', 'photo', 'wrap']):
                    unique_classes.add(cls)
        
        # Анализ структуры найденных карточек
        car_cards = soup.select("li.cxc-card")
        card_analysis = {}
        if car_cards:
            sample_card = car_cards[0]
            card_analysis = {
                "total_cards": len(car_cards),
                "sample_id": sample_card.get('id', ''),
                "sample_classes": sample_card.get('class', []),
                "sample_attributes": {k: v for k, v in sample_card.attrs.items() if k not in ['class', 'id']},
                "has_link": bool(sample_card.find('a')),
                "has_image": bool(sample_card.find('img')),
                "has_price": bool(sample_card.find(text=lambda text: text and '万' in text))
            }
        
        return {
            "status": "ok",
            "selector_results": results,
            "interesting_classes": sorted(list(unique_classes)),
            "total_divs": len(all_divs),
            "card_analysis": card_analysis
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/debug/test-selector")
def test_custom_selector(data: dict):
    """Тестирует пользовательский селектор на последней сохраненной странице."""
    try:
        selector = data.get("selector", "")
        if not selector:
            return {
                "status": "error",
                "message": "Selector is required"
            }
        
        if not os.path.exists("debug_page_source.html"):
            return {
                "status": "not_found",
                "message": "No debug page source found. Run scraping first."
            }
        
        with open("debug_page_source.html", "r", encoding="utf-8") as f:
            content = f.read()
        
        soup = BeautifulSoup(content, "html.parser")
        elements = soup.select(selector)
        
        # Анализ найденных элементов
        analysis = {
            "count": len(elements),
            "sample_classes": [elem.get('class', []) for elem in elements[:5]],
            "sample_text": [elem.get_text()[:200].strip() for elem in elements[:5]],
            "sample_ids": [elem.get('id', '') for elem in elements[:5]],
            "sample_attributes": []
        }
        
        # Анализ атрибутов первых 3 элементов
        for elem in elements[:3]:
            attrs = {k: v for k, v in elem.attrs.items() if k not in ['class', 'id']}
            analysis["sample_attributes"].append(attrs)
        
        return {
            "status": "ok",
            "selector": selector,
            "analysis": analysis
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# API эндпоинты для заявок
@app.post("/api/applications/credit")
def submit_credit_application(application_data: dict, current_user = Depends(get_current_user)):
    """Отправка заявки на кредит"""
    try:
        # Валидация обязательных полей
        required_fields = ['firstName', 'lastName', 'phone', 'amount', 'term', 'monthlyIncome']
        missing_fields = [field for field in required_fields if not application_data.get(field)]
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Создаем объект заявки
        credit_application = {
            # Основные данные заявки
            "application_type": "credit",
            "status": "new",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            
            # Личные данные
            "personal_data": {
                "first_name": application_data.get("firstName"),
                "last_name": application_data.get("lastName"),
                "phone": application_data.get("phone"),
                "email": application_data.get("email")
            },
            
            # Данные о кредите
            "credit_data": {
                "amount": float(application_data.get("amount", 0)),
                "term": int(application_data.get("term", 0)),
                "down_payment": float(application_data.get("downPayment", 0)),
                "monthly_income": float(application_data.get("monthlyIncome", 0))
            },
            
            # Дополнительная информация
            "comment": application_data.get("comment", ""),
            
            # Telegram данные (если пользователь авторизован)
            "telegram_data": None,
            "user_id": None
        }
        
        # Добавляем данные Telegram пользователя если авторизован
        if current_user:
            credit_application["telegram_data"] = {
                "user_id": current_user.get("user_id"),
                "username": current_user.get("username"),
                "first_name": current_user.get("first_name"),
                "last_name": current_user.get("last_name")
            }
            credit_application["user_id"] = current_user.get("user_id")
        
        # Также проверяем telegramUser в данных заявки (для обратной совместимости)
        telegram_user = application_data.get("telegramUser")
        if telegram_user and not current_user:
            credit_application["telegram_data"] = {
                "user_id": telegram_user.get("id"),
                "username": telegram_user.get("username"),
                "first_name": telegram_user.get("first_name"),
                "last_name": telegram_user.get("last_name")
            }
            credit_application["user_id"] = telegram_user.get("id")
        
        # Сохраняем в БД
        result = credit_applications.insert_one(credit_application)
        
        print(f"✅ Кредитная заявка сохранена: ID {result.inserted_id}")
        print(f"   Пользователь: {application_data.get('firstName')} {application_data.get('lastName')}")
        print(f"   Сумма: {application_data.get('amount')} ₽")
        print(f"   Telegram авторизация: {'Да' if current_user or telegram_user else 'Нет'}")
        if credit_application["telegram_data"]:
            print(f"   Telegram: @{credit_application['telegram_data']['username']}")
        
        return {
            "success": True,
            "application_id": str(result.inserted_id),
            "message": "Credit application submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка сохранения кредитной заявки: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@app.post("/api/applications/leasing")
def submit_leasing_application(application_data: dict, current_user = Depends(get_current_user)):
    """Отправка заявки на лизинг"""
    try:
        # Валидация обязательных полей
        required_fields = ['firstName', 'lastName', 'phone', 'leasingType', 'propertyValue', 'term']
        missing_fields = [field for field in required_fields if not application_data.get(field)]
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Создаем объект заявки
        leasing_application = {
            # Основные данные заявки
            "application_type": "leasing",
            "status": "new",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            
            # Личные данные
            "personal_data": {
                "first_name": application_data.get("firstName"),
                "last_name": application_data.get("lastName"),
                "phone": application_data.get("phone"),
                "email": application_data.get("email")
            },
            
            # Данные о лизинге
            "leasing_data": {
                "leasing_type": application_data.get("leasingType"),
                "property_value": float(application_data.get("propertyValue", 0)),
                "term": int(application_data.get("term", 0)),
                "down_payment": float(application_data.get("downPayment", 0))
            },
            
            # Данные о компании
            "company_data": {
                "company_name": application_data.get("companyName"),
                "inn": application_data.get("inn"),
                "monthly_income": float(application_data.get("monthlyIncome", 0)),
                "business_type": application_data.get("businessType")
            },
            
            # Дополнительная информация
            "comment": application_data.get("comment", ""),
            
            # Telegram данные (если пользователь авторизован)
            "telegram_data": None,
            "user_id": None
        }
        
        # Добавляем данные Telegram пользователя если авторизован
        if current_user:
            leasing_application["telegram_data"] = {
                "user_id": current_user.get("user_id"),
                "username": current_user.get("username"),
                "first_name": current_user.get("first_name"),
                "last_name": current_user.get("last_name")
            }
            leasing_application["user_id"] = current_user.get("user_id")
        
        # Также проверяем telegramUser в данных заявки (для обратной совместимости)
        telegram_user = application_data.get("telegramUser")
        if telegram_user and not current_user:
            leasing_application["telegram_data"] = {
                "user_id": telegram_user.get("id"),
                "username": telegram_user.get("username"),
                "first_name": telegram_user.get("first_name"),
                "last_name": telegram_user.get("last_name")
            }
            leasing_application["user_id"] = telegram_user.get("id")
        
        # Сохраняем в БД
        result = leasing_applications.insert_one(leasing_application)
        
        print(f"✅ Лизинговая заявка сохранена: ID {result.inserted_id}")
        print(f"   Пользователь: {application_data.get('firstName')} {application_data.get('lastName')}")
        print(f"   Тип лизинга: {application_data.get('leasingType')}")
        print(f"   Стоимость: {application_data.get('propertyValue')} ₽")
        print(f"   Telegram авторизация: {'Да' if current_user or telegram_user else 'Нет'}")
        if leasing_application["telegram_data"]:
            print(f"   Telegram: @{leasing_application['telegram_data']['username']}")
        
        return {
            "success": True,
            "application_id": str(result.inserted_id),
            "message": "Leasing application submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка сохранения лизинговой заявки: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@app.get("/api/applications/stats")
def get_applications_stats():  # current_user = Depends(get_current_user_or_debug)
    """Получение статистики заявок (ВРЕМЕННО БЕЗ АВТОРИЗАЦИИ ДЛЯ ТЕСТОВ)"""
    # if not current_user:
    #     raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Статистика кредитных заявок
        credit_stats = {
            "total": credit_applications.count_documents({}),
            "new": credit_applications.count_documents({"status": "new"}),
            "processing": credit_applications.count_documents({"status": "processing"}),
            "approved": credit_applications.count_documents({"status": "approved"}),
            "rejected": credit_applications.count_documents({"status": "rejected"})
        }
        
        # Статистика лизинговых заявок
        leasing_stats = {
            "total": leasing_applications.count_documents({}),
            "new": leasing_applications.count_documents({"status": "new"}),
            "processing": leasing_applications.count_documents({"status": "processing"}),
            "approved": leasing_applications.count_documents({"status": "approved"}),
            "rejected": leasing_applications.count_documents({"status": "rejected"})
        }
        
        return {
            "credit": credit_stats,
            "leasing": leasing_stats,
            "total_applications": credit_stats["total"] + leasing_stats["total"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@app.get("/api/applications/credit")
def get_credit_applications(
    page: int = 1,
    page_size: int = 10,
    status: Optional[str] = None,
    # current_user = Depends(get_current_user_or_debug)
):
    """Получение списка кредитных заявок (ВРЕМЕННО БЕЗ АВТОРИЗАЦИИ ДЛЯ ТЕСТОВ)"""
    # if not current_user:
    #     raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Фильтр по статусу
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        # Подсчет общего количества
        total = credit_applications.count_documents(filter_query)
        
        # Пагинация
        skip = (page - 1) * page_size
        applications = list(credit_applications.find(
            filter_query
        ).skip(skip).limit(page_size).sort("created_at", -1))
        
        # Конвертируем ObjectId в строки для JSON сериализации
        for app in applications:
            app["_id"] = str(app["_id"])
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": applications
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get applications: {str(e)}")

@app.get("/api/applications/leasing")
def get_leasing_applications(
    page: int = 1,
    page_size: int = 10,
    status: Optional[str] = None,
    # current_user = Depends(get_current_user_or_debug)
):
    """Получение списка лизинговых заявок (ВРЕМЕННО БЕЗ АВТОРИЗАЦИИ ДЛЯ ТЕСТОВ)"""
    # if not current_user:
    #     raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Фильтр по статусу
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        # Подсчет общего количества
        total = leasing_applications.count_documents(filter_query)
        
        # Пагинация
        skip = (page - 1) * page_size
        applications = list(leasing_applications.find(
            filter_query
        ).skip(skip).limit(page_size).sort("created_at", -1))
        
        # Конвертируем ObjectId в строки для JSON сериализации
        for app in applications:
            app["_id"] = str(app["_id"])
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": applications
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get applications: {str(e)}")

@app.put("/api/applications/{application_type}/{application_id}/status")
def update_application_status(
    application_type: str,
    application_id: str,
    status_data: dict,
    # current_user = Depends(get_current_user_or_debug)
):
    """Обновление статуса заявки (ВРЕМЕННО БЕЗ АВТОРИЗАЦИИ ДЛЯ ТЕСТОВ)"""
    # if not current_user:
    #     raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")
        
        # Выбираем коллекцию
        collection = None
        if application_type == "credit":
            collection = credit_applications
        elif application_type == "leasing":
            collection = leasing_applications
        else:
            raise HTTPException(status_code=400, detail="Invalid application type")
        
        # Проверяем валидность ObjectId
        try:
            object_id = ObjectId(application_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid application ID")
        
        # Обновляем статус
        result = collection.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "success": True,
            "message": f"Application status updated to {new_status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

import re

def structure_car_data(car_data):
    """
    Структурирует данные автомобиля, извлекая все параметры из title
    """
    title = car_data.get("title", "")
    price = car_data.get("price", "0万")
    
    # Извлечение года
    def extract_year(text):
        # print(f"🔍 Извлекаем год из: {text}")
        
        # Ищем 4-значные числа, которые могут быть годами (1990-2024)
        # Добавляем поддержку китайских символов
        year_patterns = [
            r'\b(20[0-2][0-9])\b',  # 2020, 2021, 2022, 2023, 2024
            r'\b(19[9][0-9])\b',    # 1990-1999
            r'(20[0-2][0-9])',      # Без границ слова
            r'(19[9][0-9])'         # Без границ слова
        ]
        
        for pattern in year_patterns:
            year_match = re.search(pattern, text)
            if year_match:
                year = int(year_match.group())
                # print(f"   Найден год: {year}")
                # Проверяем, что год в разумных пределах
                if year >= 1990 and year <= 2024:
                    return year
                else:
                    print(f"   Год {year} вне допустимых пределов")
        
        print(f"   Год не найден в тексте: {text}")
        return None
    
    # Извлечение бренда (китайские и международные)
    def extract_brand(text):
        chinese_brands = [
            '奔驰', '宝马', '奥迪', '大众', '丰田', '本田', '日产', '马自达', '斯巴鲁', '雷克萨斯',
            '现代', '起亚', '特斯拉', '比亚迪', '蔚来', '小鹏', '理想', '吉利', '长城', '哈弗',
            '博越', '星越', '威尔法', '路虎', '北京越野', '哈弗大狗', 'Polo'
        ]
        
        english_brands = [
            'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Nissan', 'Mazda',
            'Subaru', 'Lexus', 'Hyundai', 'KIA', 'Tesla', 'BYD', 'NIO', 'XPeng', 'Li Auto',
            'Geely', 'Great Wall', 'Haval', 'Land Rover'
        ]
        
        # Проверяем китайские бренды
        for brand in chinese_brands:
            if brand in text:
                return brand
        
        # Проверяем английские бренды
        for brand in english_brands:
            if brand.lower() in text.lower():
                return brand
        
        # Если не найден, берем первое слово
        words = text.split()
        return words[0] if words else "Unknown"
    
    # Извлечение модели
    def extract_model(text, brand):
        if not brand or brand == "Unknown":
            return "Unknown Model"
        
        # Убираем бренд из названия
        text_without_brand = text.replace(brand, '').strip()
        
        # Ищем год и убираем его
        year_match = re.search(r'\b(20[0-2][0-9]|19[9][0-9])\b', text_without_brand)
        if year_match:
            text_without_brand = text_without_brand.replace(year_match.group(), '').strip()
        
        # Берем первые несколько слов как модель
        words = text_without_brand.split()
        model_words = []
        for word in words[:3]:  # Максимум 3 слова для модели
            if word and not re.match(r'^\d+[\.\d]*[LT]?$', word):  # Исключаем объемы двигателя
                model_words.append(word)
        
        return ' '.join(model_words) if model_words else "Unknown Model"
    
    # Извлечение объема двигателя
    def extract_engine_volume(text):
        volume_match = re.search(r'(\d+\.?\d*)[LT]', text)
        return f"{volume_match.group(1)}L" if volume_match else None
    
    # Извлечение типа трансмиссии
    def extract_transmission(text):
        if any(keyword in text for keyword in ['自动', 'DCT', 'CVT', 'AT']):
            return 'Automatic'
        elif any(keyword in text for keyword in ['手动', 'MT', '手挡']):
            return 'Manual'
        return 'Unknown'
    
    # Извлечение типа топлива
    def extract_fuel_type(text):
        if any(keyword in text for keyword in ['混动', 'HV', '双擎', 'Hybrid']):
            return 'Hybrid'
        elif any(keyword in text for keyword in ['电动', 'EV', '纯电']):
            return 'Electric'
        elif any(keyword in text for keyword in ['柴油', 'Diesel', 'TDI', 'CDI']):
            return 'Diesel'
        elif any(keyword in text for keyword in ['汽油', 'TFSI', 'TSI', 'Petrol']):
            return 'Petrol'
        return 'Petrol'  # По умолчанию бензин
    
    # Извлечение привода
    def extract_drive_type(text):
        if any(keyword in text for keyword in ['四驱', '4WD', 'AWD', '4MATIC', 'xDrive', 'quattro']):
            return 'AWD'
        elif any(keyword in text for keyword in ['前驱', 'FWD']):
            return 'FWD'
        elif any(keyword in text for keyword in ['后驱', 'RWD']):
            return 'RWD'
        return 'FWD'  # По умолчанию передний привод
    
    # Парсим цену
    def parse_price(price_str):
        if not price_str:
            return 0
        
        # print(f"🔍 Парсим цену: {price_str}")
        
        # Извлекаем первое число из строки типа "26.58万" или "18.28万31.02万"
        price_match = re.search(r'(\d+\.?\d*)', str(price_str))
        if price_match:
            price_value = float(price_match.group())
            # print(f"   Извлеченная цена: {price_value}万")
            return price_value
        
        print(f"   Цена не найдена в строке: {price_str}")
        return 0
    
    # Определяем страну производителя
    def get_country_by_brand(brand_name):
        country_mapping = {
            # Немецкие бренды
            '奔驰': 'germany', '宝马': 'germany', '奥迪': 'germany', '大众': 'germany',
            'BMW': 'germany', 'Mercedes': 'germany', 'Audi': 'germany', 'Volkswagen': 'germany',
            '迈巴赫': 'germany', 'AMG': 'germany', '保时捷': 'germany', 'Porsche': 'germany',
            
            # Японские бренды
            '丰田': 'japan', '本田': 'japan', '日产': 'japan', '马自达': 'japan', '斯巴鲁': 'japan', '雷克萨斯': 'japan',
            'Toyota': 'japan', 'Honda': 'japan', 'Nissan': 'japan', 'Mazda': 'japan', 'Subaru': 'japan', 'Lexus': 'japan',
            '奥德赛': 'japan', '英菲尼迪': 'japan', 'Infiniti': 'japan', '讴歌': 'japan', 'Acura': 'japan',
            
            # Корейские бренды
            '现代': 'korea', '起亚': 'korea', 'Hyundai': 'korea', 'KIA': 'korea',
            '捷尼赛思': 'korea', 'Genesis': 'korea',
            
            # Американские бренды
            '特斯拉': 'usa', 'Tesla': 'usa', '福特': 'usa', 'Ford': 'usa', '雪佛兰': 'usa', 'Chevrolet': 'usa',
            '凯迪拉克': 'usa', 'Cadillac': 'usa', '林肯': 'usa', 'Lincoln': 'usa', '别克': 'usa', 'Buick': 'usa',
            '探险者': 'usa', 'Explorer': 'usa',
            
            # Китайские бренды
            '比亚迪': 'china', '蔚来': 'china', '小鹏': 'china', '理想': 'china', '吉利': 'china',
            '长城': 'china', '哈弗': 'china', '博越': 'china', '星越': 'china', '威尔法': 'china',
            '哈弗大狗': 'china', '北京越野': 'china', '传祺': 'china', '广汽': 'china',
            'BYD': 'china', 'NIO': 'china', 'XPeng': 'china', 'Li Auto': 'china', 'Geely': 'china',
            '深蓝': 'china', '阿维塔': 'china', '零跑': 'china', '极狐': 'china', '世纪': 'china',
            
            # Британские бренды
            '路虎': 'uk', 'Land Rover': 'uk', '揽胜': 'uk', 'Range Rover': 'uk', '捷豹': 'uk', 'Jaguar': 'uk',
            '迈凯伦': 'uk', 'McLaren': 'uk', '宾利': 'uk', 'Bentley': 'uk', '劳斯莱斯': 'uk', 'Rolls-Royce': 'uk',
            
            # Итальянские бренды
            '法拉利': 'italy', 'Ferrari': 'italy', '兰博基尼': 'italy', 'Lamborghini': 'italy',
            '玛莎拉蒂': 'italy', 'Maserati': 'italy', '阿尔法罗密欧': 'italy', 'Alfa Romeo': 'italy',
            
            # Французские бренды
            '标致': 'france', 'Peugeot': 'france', '雪铁龙': 'france', 'Citroën': 'france',
            '雷诺': 'france', 'Renault': 'france', 'DS': 'france',
            
            # Шведские бренды
            '沃尔沃': 'sweden', 'Volvo': 'sweden',
            
            # Швейцарские бренды
            '保时捷': 'switzerland', 'Porsche': 'switzerland'
        }
        
        # Проверяем точное совпадение
        if brand_name in country_mapping:
            return country_mapping[brand_name]
        
        # Проверяем частичное совпадение
        for brand, country in country_mapping.items():
            if brand in brand_name or brand_name in brand:
                return country
        
        return 'unknown'
    
    # Извлекаем все данные
    year = extract_year(title)
    brand = extract_brand(title)
    model = extract_model(title, brand)
    price_value = parse_price(price)
    country = get_country_by_brand(brand)
    
    # print(f"📋 Парсинг данных для: {title}")
    # print(f"   Извлеченный год: {year}")
    # print(f"   Извлеченный бренд: {brand}")
    # print(f"   Извлеченная модель: {model}")
    # print(f"   Извлеченная цена: {price_value}万")
    # print(f"   Определенная страна: {country}")
    
    # Создаем упрощенный структурированный объект
    structured_car = {
        # Основная информация
        "id": car_data.get("car_id", ""),
        "title": title,
        "brand": brand,
        "model": model,
        "year": year,
        "country": country,
        
        # Цена (упрощенная)
        "price_value": price_value,
        "price_formatted": price,
        
        # Изображения (как есть)
        "image_url": car_data.get("image_url", ""),
        "local_image_url": car_data.get("local_image_url", ""),
		"images": [car_data.get("local_image_url", "")] if car_data.get("local_image_url") else [],
        
        # Метаданные
        "source": "che168",
        "scraped_at": datetime.now().isoformat()
    }
    
    # print(f"📋 Базовые данные для: {title}")
    # print(f"   Бренд: {brand}, Модель: {model}, Год: {year}")
    # print(f"   Цена: {price_value}万, Страна: {country}")
    
    return structured_car 

@app.post("/api/auth/save-phone")
def save_phone(data: dict, current_user = Depends(get_current_user)):
    # """Сохраняет номер телефона в профиле пользователя"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    phone = (data or {}).get("phone", "")
    if not isinstance(phone, str) or len(phone) < 5:
        raise HTTPException(status_code=400, detail="Invalid phone")

    # Нормализуем номер: оставляем + и цифры
    normalized = re.sub(r"[^0-9+]", "", phone)
    if not re.search(r"\d{5,}", normalized):
        raise HTTPException(status_code=400, detail="Invalid phone format")

    telegram_id = current_user.get("user_id")
    if not telegram_id:
        raise HTTPException(status_code=400, detail="Missing user id")

    users_collection.update_one(
        {"telegram_id": telegram_id},
        {"$set": {"phone": normalized, "updated_at": datetime.utcnow()}},
        upsert=True,
    )

    user = users_collection.find_one({"telegram_id": telegram_id}, {"_id": 0})
    return {"success": True, "user": user}


@app.get("/api/auth/me")
def get_me(current_user = Depends(get_current_user)):
    # """Возвращает профиль пользователя из БД"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    telegram_id = current_user.get("user_id")
    user = users_collection.find_one({"telegram_id": telegram_id}, {"_id": 0})
    if not user:
        # Вернем базовую информацию хотя бы из токена
        user = {
            "telegram_id": telegram_id,
            "username": current_user.get("username"),
            "first_name": current_user.get("first_name"),
        }
    return {"success": True, "user": user}


@app.post("/api/telegram/webhook/{token}")
async def telegram_webhook(token: str, request: Request):
    # """Прием апдейтов Telegram. Сохраняет телефон при шаринге контакта."""
    if token != TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")

    try:
        update = await request.json()
    except Exception:
        update = {}

    message = (update or {}).get("message", {})
    contact = message.get("contact") or {}

    if contact and contact.get("phone_number"):
        phone_number = contact.get("phone_number")
        owner_id = contact.get("user_id") or (message.get("from") or {}).get("id")
        if owner_id:
            normalized = re.sub(r"[^0-9+]", "", str(phone_number))
            users_collection.update_one(
                {"telegram_id": owner_id},
                {"$set": {"phone": normalized, "updated_at": datetime.utcnow()}},
                upsert=True,
            )
            print(f"✅ Phone saved for user {owner_id}: {normalized}")

    return {"ok": True}

# ====== Отзывы: список, создание, ответ менеджера, удаление ======
@app.get("/api/reviews")
def get_reviews(page: int = 1, page_size: int = 10, rating: Optional[int] = None, status: Optional[str] = None):
    try:
        skip = (page - 1) * page_size
        # Формируем фильтр
        query: dict = {}
        if rating is not None:
            try:
                rating_int = int(rating)
                if rating_int < 1 or rating_int > 5:
                    raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
                query["rating"] = rating_int
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid rating")
        if status:
            if status not in ("new", "processed"):
                raise HTTPException(status_code=400, detail="Invalid status")
            if status == "new":
                # Статус новый: либо явно status=new, либо нет ответа
                query["$or"] = [{"status": "new"}, {"reply": None}]
            elif status == "processed":
                # Статус обработан: либо явно status=processed, либо есть ответ
                query["$or"] = [{"status": "processed"}, {"reply": {"$ne": None}}]

        total = reviews_collection.count_documents(query)
        items = list(
            reviews_collection
            .find(query)
            .skip(skip)
            .limit(page_size)
            .sort("created_at", -1)
        )
        for item in items:
            item["_id"] = str(item["_id"]) 
        return {"total": total, "page": page, "page_size": page_size, "data": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reviews: {str(e)}")

@app.post("/api/reviews")
def create_review(payload: dict, current_user = Depends(get_current_user)):
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Берем данные пользователя из токена с fallback на БД
        telegram_id = (current_user or {}).get("user_id")
        db_user = users_collection.find_one({"telegram_id": telegram_id}) or {}
        first_name = (current_user or {}).get("first_name") or db_user.get("first_name") or ""
        last_name = (current_user or {}).get("last_name") or db_user.get("last_name") or ""
        username = (current_user or {}).get("username") or db_user.get("username") or ""
        full_name = (f"{first_name} {last_name}".strip()) or (f"@{username}" if username else "Пользователь")

        message = (payload or {}).get("message", "").strip()
        rating = int((payload or {}).get("rating", 0))
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        if not message or len(message) < 3:
            raise HTTPException(status_code=400, detail="Сообщение слишком короткое")
        doc = {
            "name": full_name,
            "message": message,
            "rating": rating,
            "created_at": datetime.utcnow(),
            "reply": None,
            "reply_author": None,
            "reply_at": None,
            "user": None,
            "status": "new",
        }
        doc["user"] = {
            "user_id": telegram_id,
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
        }
        result = reviews_collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return {"success": True, "data": doc}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

@app.post("/api/reviews/{review_id}/reply")
def reply_review(review_id: str, payload: dict, current_user = Depends(get_current_user)):
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        reply_text = (payload or {}).get("reply", "").strip()
        # Формируем автора ответа из профиля текущего пользователя (fallback на БД)
        telegram_id = (current_user or {}).get("user_id")
        db_user = users_collection.find_one({"telegram_id": telegram_id}) or {}
        first_name = (current_user or {}).get("first_name") or db_user.get("first_name") or ""
        last_name = (current_user or {}).get("last_name") or db_user.get("last_name") or ""
        username = (current_user or {}).get("username") or db_user.get("username") or ""
        reply_author = (f"{first_name} {last_name}".strip()) or (f"@{username}" if username else "Менеджер")
        if not reply_text:
            raise HTTPException(status_code=400, detail="Reply is required")
        try:
            oid = ObjectId(review_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid review ID")
        result = reviews_collection.update_one(
            {"_id": oid},
            {"$set": {"reply": reply_text, "reply_author": reply_author, "reply_at": datetime.utcnow(), "status": "processed"}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reply: {str(e)}")

@app.delete("/api/reviews/{review_id}")
def delete_review(review_id: str):  # ВРЕМЕННО БЕЗ АВТОРИЗАЦИИ
    try:
        try:
            oid = ObjectId(review_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid review ID")
        result = reviews_collection.delete_one({"_id": oid})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")

@app.patch("/api/reviews/{review_id}")
def update_review(review_id: str, payload: dict, current_user = Depends(get_current_user)):
    # """Редактирование собственного отзыва пользователем (message, rating)."""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        try:
            oid = ObjectId(review_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid review ID")

        review = reviews_collection.find_one({"_id": oid})
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        # Разрешаем редактировать только владельцу
        owner_id = str(((review or {}).get("user") or {}).get("user_id") or "")
        current_id = str(current_user.get("user_id") or "")
        if not owner_id or owner_id != current_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        updates = {}
        if "message" in payload:
            message = (payload.get("message") or "").strip()
            if len(message) < 3:
                raise HTTPException(status_code=400, detail="Сообщение слишком короткое")
            updates["message"] = message
        if "rating" in payload:
            try:
                rating = int(payload.get("rating"))
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid rating")
            if rating < 1 or rating > 5:
                raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
            updates["rating"] = rating

        if not updates:
            return {"success": True}

        updates["updated_at"] = datetime.utcnow()
        reviews_collection.update_one({"_id": oid}, {"$set": updates})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update review: {str(e)}")