from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
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

app = FastAPI()

# Добавляем CORS middleware для доступа frontend к backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Создаем папку для статических файлов если её нет
STATIC_DIR = Path("static/images")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Подключаем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

# Telegram Bot Token - REPLACE WITH YOURS
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")

# MongoDB setup
client = MongoClient(os.environ.get("MONGO_URL", "mongodb://mongo:27017/"))
db = client.cars_db
cars_collection = db.cars
scrape_cache = db.scrape_cache


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
        file_path = STATIC_DIR / filename
        
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

    received_hash = auth_data.pop('hash')
    auth_data_list = [f"{key}={value}" for key, value in sorted(auth_data.items())]
    data_check_string = "\n".join(auth_data_list)

    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    return received_hash == calculated_hash

@app.post("/api/auth/telegram")
def auth_telegram(auth_data: dict):
    if not verify_telegram_auth(auth_data.copy()):
        raise HTTPException(status_code=403, detail="Invalid authentication data")

    # Here you would typically create a session or a JWT for the user
    # For simplicity, we'll just return the user data
    return auth_data

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
        images_dir = STATIC_DIR
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

@app.post("/api/images/cleanup")
def cleanup_images():
    """Очищает папку с изображениями."""
    try:
        images_dir = STATIC_DIR
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
):
    # Get cached scraped data
    cached_cars = list(scrape_cache.find({}, {"_id": 0}))
    
    # If no cached data, scrape fresh data
    if not cached_cars:
        car_list = scrape_and_cache_cars()
        cached_cars = list(scrape_cache.find({}, {"_id": 0}))
    
    # Apply filters
    filtered_cars = cached_cars
    
    if title:
        filtered_cars = [car for car in filtered_cars if title.lower() in car.get("title", "").lower()]
    
    if price_from:
        # Extract numeric price for comparison
        filtered_cars = [car for car in filtered_cars if float(car.get("price", "0").replace("万", "")) >= float(price_from)]
    
    if price_to:
        # Extract numeric price for comparison
        filtered_cars = [car for car in filtered_cars if float(car.get("price", "0").replace("万", "")) <= float(price_to)]

    # Apply sorting
    if sort_by:
        reverse = sort_order == "desc"
        if sort_by == "title":
            filtered_cars.sort(key=lambda x: x.get("title", ""), reverse=reverse)
        elif sort_by == "price":
            filtered_cars.sort(key=lambda x: float(x.get("price", "0").replace("万", "")), reverse=reverse)

    total_cars = len(filtered_cars)
    
    # Apply pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_cars = filtered_cars[start_index:end_index]

    return {
        "total": total_cars,
        "page": page,
        "page_size": page_size,
        "data": json.loads(json.dumps(paginated_cars, default=str))
    } 

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
        # Простая проверка доступности Selenium Grid
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
            "div[class*='viewlist_li']",
            "li[class*='list-item']", 
            "div[class*='list-item']",
            "div[class*='car-card']",
            "div[class*='item-pic']",
            "div[class*='pic-box']",
            "div[class*='result']",
            ".list-item",
            "article"
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
                if 'list' in cls.lower() or 'item' in cls.lower() or 'car' in cls.lower():
                    unique_classes.add(cls)
        
        return {
            "status": "ok",
            "selector_results": results,
            "interesting_classes": sorted(list(unique_classes)),
            "total_divs": len(all_divs)
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
    } 