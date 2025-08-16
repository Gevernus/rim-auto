import re
import json
from datetime import datetime
from app.config.database import scrape_cache
from app.services.car_parser import scrape_and_cache_cars

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
            '迈凯伦': 'uk', 'McLaren': 'uk', '宾利': 'uk', 'Bentley': 'uk', '劳斯莱с': 'uk', 'Rolls-Royce': 'uk',
            
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

def get_cars_with_filters(
    page: int = 1,
    page_size: int = 10,
    sort_by: str = None,
    sort_order: str = "asc",
    title: str = None,
    price_from: str = None,
    price_to: str = None,
    year_from: str = None,
    year_to: str = None,
    country: str = None,
):
    """Получает автомобили с фильтрацией, сортировкой и пагинацией"""
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
    structured_cars = []
    for car in cached_cars:
        try:
            structured_car = structure_car_data(car)
            structured_cars.append(structured_car)
        except Exception as e:
            print(f"❌ Ошибка структурирования автомобиля: {e}")
            continue
    
    # Apply filters
    filtered_cars = structured_cars
    
    if title:
        before_count = len(filtered_cars)
        filtered_cars = [car for car in filtered_cars if title.lower() in car.get("title", "").lower() or title.lower() in car.get("brand", "").lower()]
        after_count = len(filtered_cars)
    
    if price_from:
        before_count = len(filtered_cars)
        filtered_cars = [car for car in filtered_cars if car.get("price_value", 0) >= float(price_from)]
        after_count = len(filtered_cars)
    
    if price_to:
        before_count = len(filtered_cars)
        filtered_cars = [car for car in filtered_cars if car.get("price_value", 0) <= float(price_to)]
        after_count = len(filtered_cars)

    # Фильтрация по году
    if year_from or year_to:
        before_count = len(filtered_cars)
        
        # Фильтруем автомобили с годом
        cars_with_year = [car for car in filtered_cars if car.get("year") is not None]
        
        if year_from:
            year_from_int = int(year_from)
            cars_with_year = [car for car in cars_with_year if car.get("year", 0) >= year_from_int]
        
        if year_to:
            year_to_int = int(year_to)
            cars_with_year = [car for car in cars_with_year if car.get("year", 0) <= year_to_int]
        
        filtered_cars = cars_with_year
        after_count = len(filtered_cars)

    # Фильтрация по стране
    if country:
        before_count = len(filtered_cars)
        if country == 'all':
            # Показываем все автомобили
            pass
        else:
            filtered_cars = [car for car in filtered_cars if car.get("country") == country]
        after_count = len(filtered_cars)

    # Apply sorting
    if sort_by:
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
    
    # Apply pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_cars = filtered_cars[start_index:end_index]
    
    result = {
        "total": total_cars,
        "page": page,
        "page_size": page_size,
        "data": json.loads(json.dumps(paginated_cars, default=str))
    }
    
    print(f"✅ Возвращаем результат: {len(result['data'])} автомобилей")
    return result
