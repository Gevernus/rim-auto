from typing import List, Optional
from datetime import datetime, timezone
import uuid
from app.config.database import client
from app.models.delivery_zone import DeliveryZone, DeliveryZoneCreate, DeliveryZoneUpdate

# Получаем коллекцию зон доставки
delivery_zones_collection = client.rim_auto.delivery_zones

def create_delivery_zone(zone_data: DeliveryZoneCreate) -> DeliveryZone:
    """Создает новую зону доставки"""
    zone_dict = zone_data.dict()
    zone_dict["id"] = str(uuid.uuid4())
    zone_dict["created_at"] = datetime.now(timezone.utc)
    zone_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = delivery_zones_collection.insert_one(zone_dict)
    zone_dict["_id"] = result.inserted_id
    
    return DeliveryZone(**zone_dict)

def get_delivery_zones(skip: int = 0, limit: int = 100) -> List[DeliveryZone]:
    """Получает список зон доставки"""
    zones = delivery_zones_collection.find({"is_active": True}).skip(skip).limit(limit)
    return [DeliveryZone(**zone) for zone in zones]

def get_delivery_zone_by_id(zone_id: str) -> Optional[DeliveryZone]:
    """Получает зону по ID"""
    zone = delivery_zones_collection.find_one({"id": zone_id})
    return DeliveryZone(**zone) if zone else None

def get_delivery_zone_by_name(zone_name: str) -> Optional[DeliveryZone]:
    """Получает зону по названию"""
    zone = delivery_zones_collection.find_one({"name": zone_name, "is_active": True})
    return DeliveryZone(**zone) if zone else None

def update_delivery_zone(zone_id: str, zone_data: DeliveryZoneUpdate) -> Optional[DeliveryZone]:
    """Обновляет зону доставки"""
    update_data = {k: v for k, v in zone_data.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        result = delivery_zones_collection.update_one(
            {"id": zone_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return get_delivery_zone_by_id(zone_id)
    
    return None

def delete_delivery_zone(zone_id: str) -> bool:
    """Удаляет зону доставки"""
    result = delivery_zones_collection.delete_one({"id": zone_id})
    return result.deleted_count > 0

def get_delivery_price(zone_name: str, import_country: str) -> Optional[str]:
    """Получает дни доставки для зоны и страны импорта"""
    zone = get_delivery_zone_by_name(zone_name)
    if not zone:
        return None
    
    # Маппинг стран импорта на поля цен
    country_price_map = {
        'china': zone.china_prices,
        'japan': zone.japan_prices,
        'uae': zone.uae_prices,
        'korea': zone.korea_prices,
        'europe': zone.europe_prices
    }
    
    return country_price_map.get(import_country.lower())

def initialize_default_delivery_zones():
    """Инициализирует базовые зоны доставки если коллекция пуста"""
    if delivery_zones_collection.count_documents({}) == 0:
        default_zones = [
            {
                "id": str(uuid.uuid4()),
                "name": "Запад",
                "description": "Москва, СПб, Центральная Россия",
                "china_prices": "30-35", 
                "japan_prices":  "35-40", 
                "uae_prices":  "35-40", 
                "korea_prices": "35-40",
                "europe_prices": "25-30",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Урал",
                "description": "Уральский регион",
                "china_prices": "27-32",
                "japan_prices": "32-37",
                "uae_prices": "35-40",
                "korea_prices": "32-35",
                "europe_prices": "28-32",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Сибирь",
                "description": "Сибирский регион",
                "china_prices": "22-25",
                "japan_prices": "32-35",
                "uae_prices": "35-40",
                "korea_prices": "28-31",
                "europe_prices": "30-35",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Дальний Восток",
                "description": "Дальневосточный регион",
                "china_prices": "20-23",
                "japan_prices": "28-30",
                "uae_prices": "40-45",
                "korea_prices": "20-24",
                "europe_prices": "35-40",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        delivery_zones_collection.insert_many(default_zones)
        print("Default delivery zones initialized")
        print(f"✅ Инициализировано {len(default_zones)} базовых зон доставки")
    else:
        print("ℹ️ Коллекция зон доставки уже содержит данные, инициализация не требуется")
