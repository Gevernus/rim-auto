from typing import List, Optional
from datetime import datetime, timezone
import uuid
from app.config.database import client
from app.models.city import City, CityCreate, CityUpdate

# Получаем коллекцию городов
cities_collection = client.rim_auto.cities

from app.services.delivery_zone_service import get_delivery_zones, get_delivery_price

def get_delivery_regions():
    """Возвращает информацию о регионах доставки"""
    return get_delivery_zones()

def create_city(city_data: CityCreate) -> City:
    """Создает новый город"""
    city_dict = city_data.dict()
    city_dict["id"] = str(uuid.uuid4())
    city_dict["created_at"] = datetime.now(timezone.utc)
    city_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = cities_collection.insert_one(city_dict)
    city_dict["_id"] = result.inserted_id
    
    return City(**city_dict)

def get_cities(
    skip: int = 0, 
    limit: int = 100, 
    region: Optional[str] = None,
    delivery_zone: Optional[str] = None,
    is_active: Optional[bool] = None
) -> List[City]:
    """Получает список городов с фильтрацией"""
    filter_query = {}
    
    if region:
        filter_query["region"] = {"$regex": region, "$options": "i"}
    if delivery_zone is not None:
        filter_query["delivery_zone"] = delivery_zone
    if is_active is not None:
        filter_query["is_active"] = is_active
    
    cities = cities_collection.find(filter_query).skip(skip).limit(limit)
    return [City(**city) for city in cities]

def get_city_by_id(city_id: str) -> Optional[City]:
    """Получает город по ID"""
    city = cities_collection.find_one({"id": city_id})
    return City(**city) if city else None

def update_city(city_id: str, city_data: CityUpdate) -> Optional[City]:
    """Обновляет город"""
    update_data = {k: v for k, v in city_data.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        result = cities_collection.update_one(
            {"id": city_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return get_city_by_id(city_id)
    
    return None

def delete_city(city_id: str) -> bool:
    """Удаляет город"""
    result = cities_collection.delete_one({"id": city_id})
    return result.deleted_count > 0

def search_cities(query: str, limit: int = 10) -> List[City]:
    """Поиск городов по названию или региону"""
    if not query or len(query) < 2:
        return []
    
    search_query = {
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"region": {"$regex": query, "$options": "i"}}
        ],
        "is_active": True
    }
    
    cities = cities_collection.find(search_query).limit(limit)
    return [City(**city) for city in cities]

def get_active_cities() -> List[City]:
    """Получает все активные города"""
    cities = cities_collection.find({"is_active": True})
    return [City(**city) for city in cities]

def initialize_default_cities():
    """Инициализирует базовые города если коллекция пуста"""
    if cities_collection.count_documents({}) == 0:
        default_cities = [
            # ЗОНА: ЗАПАД (Центральная Россия, Северо-Запад, Поволжье)
            {
                "id": str(uuid.uuid4()),
                "name": "Москва",
                "region": "Москва",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Санкт-Петербург",
                "region": "Санкт-Петербург",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Нижний Новгород",
                "region": "Нижегородская область",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Казань",
                "region": "Республика Татарстан",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Самара",
                "region": "Самарская область",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Ростов-на-Дону",
                "region": "Ростовская область",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Волгоград",
                "region": "Волгоградская область",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Воронеж",
                "region": "Воронежская область",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Краснодар",
                "region": "Краснодарский край",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Сочи",
                "region": "Краснодарский край",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Калининград",
                "region": "Калининградская область",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Архангельск",
                "region": "Архангельская область",
                "delivery_zone": "Запад",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            
            # ЗОНА: УРАЛ (Уральский федеральный округ)
            {
                "id": str(uuid.uuid4()),
                "name": "Екатеринбург",
                "region": "Свердловская область",
                "delivery_zone": "Урал",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Челябинск",
                "region": "Челябинская область",
                "delivery_zone": "Урал",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Пермь",
                "region": "Пермский край",
                "delivery_zone": "Урал",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Уфа",
                "region": "Республика Башкортостан",
                "delivery_zone": "Урал",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Тюмень",
                "region": "Тюменская область",
                "delivery_zone": "Урал",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Курган",
                "region": "Курганская область",
                "delivery_zone": "Урал",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Оренбург",
                "region": "Оренбургская область",
                "delivery_zone": "Урал",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            
            # ЗОНА: СИБИРЬ (Сибирский федеральный округ)
            {
                "id": str(uuid.uuid4()),
                "name": "Новосибирск",
                "region": "Новосибирская область",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Омск",
                "region": "Омская область",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Томск",
                "region": "Томская область",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Красноярск",
                "region": "Красноярский край",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Иркутск",
                "region": "Иркутская область",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Барнаул",
                "region": "Алтайский край",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Кемерово",
                "region": "Кемеровская область",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Абакан",
                "region": "Республика Хакасия",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Улан-Удэ",
                "region": "Республика Бурятия",
                "delivery_zone": "Сибирь",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            
            # ЗОНА: ДАЛЬНИЙ ВОСТОК (Дальневосточный федеральный округ)
            {
                "id": str(uuid.uuid4()),
                "name": "Владивосток",
                "region": "Приморский край",
                "delivery_zone": "Дальний Восток",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Хабаровск",
                "region": "Хабаровский край",
                "delivery_zone": "Дальний Восток",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Благовещенск",
                "region": "Амурская область",
                "delivery_zone": "Дальний Восток",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Петропавловск-Камчатский",
                "region": "Камчатский край",
                "delivery_zone": "Дальний Восток",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Магадан",
                "region": "Магаданская область",
                "delivery_zone": "Дальний Восток",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Южно-Сахалинск",
                "region": "Сахалинская область",
                "delivery_zone": "Дальний Восток",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Анадырь",
                "region": "Чукотский автономный округ",
                "delivery_zone": "Дальний Восток",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        cities_collection.insert_many(default_cities)
        print("Default cities initialized")
        print(f"✅ Инициализировано {len(default_cities)} базовых городов")
    else:
        print("ℹ️ Коллекция городов уже содержит данные, инициализация не требуется")
