from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CityBase(BaseModel):
    name: str = Field(..., description="Название города")
    region: str = Field(..., description="Регион/область")
    delivery_zone: str = Field(..., description="Зона доставки (например: 'Запад', 'Урал')")
    is_active: bool = Field(default=True, description="Активен ли город для доставки")

class CityCreate(CityBase):
    pass

class CityUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    delivery_zone: Optional[str] = None
    is_active: Optional[bool] = None

class City(CityBase):
    id: str = Field(..., description="Уникальный идентификатор города")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата последнего обновления")

    class Config:
        from_attributes = True
