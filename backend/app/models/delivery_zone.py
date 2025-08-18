from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DeliveryZoneBase(BaseModel):
    name: str = Field(..., description="Название зоны доставки")
    description: str = Field(..., description="Описание зоны")
    
    # Дни доставки по странам импорта 
    china_prices: str = Field(..., description="Дни доставки из Китая (например: '30-40')")
    japan_prices: str = Field(..., description="Дни доставки из Японии")
    uae_prices: str = Field(..., description="Дни доставки из ОАЭ")
    korea_prices: str = Field(..., description="Дни доставки из Кореи")
    europe_prices: str = Field(..., description="Дни доставки из Европы")
    
    is_active: bool = Field(default=True, description="Активна ли зона")

class DeliveryZoneCreate(DeliveryZoneBase):
    pass

class DeliveryZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    china_prices: Optional[str] = None
    japan_prices: Optional[str] = None
    uae_prices: Optional[str] = None
    korea_prices: Optional[str] = None
    europe_prices: Optional[str] = None
    is_active: Optional[bool] = None

class DeliveryZone(DeliveryZoneBase):
    id: str = Field(..., description="Уникальный идентификатор зоны")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата последнего обновления")

    class Config:
        from_attributes = True
