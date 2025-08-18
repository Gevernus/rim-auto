from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class LeasingType(str, Enum):
    OPERATIONAL = "operational"
    FINANCIAL = "financial"
    RETURN = "return"

class ApplicationStatus(str, Enum):
    NEW = "new"
    PROCESSING = "processing"
    APPROVED = "approved"
    REJECTED = "rejected"

class DirectLeasingApplicationCreate(BaseModel):
    # Личные данные
    firstName: str = Field(..., min_length=1, max_length=100, description="Имя заявителя")
    lastName: str = Field(..., min_length=1, max_length=100, description="Фамилия заявителя")
    phone: str = Field(..., min_length=10, max_length=20, description="Номер телефона")
    email: Optional[str] = Field(None, max_length=255, description="Email адрес")
    
    # Информация о лизинге
    leasingType: LeasingType = Field(..., description="Тип лизинга")
    propertyValue: float = Field(..., gt=0, le=50000000, description="Стоимость имущества в рублях")
    term: int = Field(..., ge=12, le=60, description="Срок лизинга в месяцах")
    downPayment: Optional[float] = Field(None, ge=0, description="Первоначальный взнос")
    
    # Информация о компании
    companyName: Optional[str] = Field(None, max_length=255, description="Название компании")
    inn: Optional[str] = Field(None, min_length=10, max_length=12, description="ИНН")
    
    # Дополнительная информация
    comment: Optional[str] = Field(None, max_length=1000, description="Комментарий к заявке")
    
    # Telegram данные (опционально)
    telegramUser: Optional[dict] = Field(None, description="Данные Telegram пользователя")
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v:
            raise ValueError('Номер телефона обязателен')
        # Убираем все нецифровые символы для проверки
        digits_only = ''.join(filter(str.isdigit, str(v)))
        if len(digits_only) < 10:
            raise ValueError('Номер телефона должен содержать минимум 10 цифр')
        return v
    
    @validator('inn')
    def validate_inn(cls, v):
        if v and not str(v).isdigit():
            raise ValueError('ИНН должен содержать только цифры')
        if v and len(str(v)) not in [10, 12]:
            raise ValueError('ИНН должен содержать 10 или 12 цифр')
        return v
    
    @validator('propertyValue', 'term', 'downPayment', pre=True)
    def validate_numeric_fields(cls, v):
        if v is None or v == '':
            return v
        try:
            if isinstance(v, str):
                return float(v) if '.' in v else int(v)
            return v
        except (ValueError, TypeError):
            raise ValueError(f'Значение должно быть числом: {v}')

class DirectLeasingApplicationUpdate(BaseModel):
    status: ApplicationStatus = Field(..., description="Новый статус заявки")
    comment: Optional[str] = Field(None, max_length=1000, description="Комментарий к изменению статуса")

class DirectLeasingApplicationResponse(BaseModel):
    id: str = Field(..., description="ID заявки")
    application_type: str = Field(default="direct_leasing", description="Тип заявки")
    status: ApplicationStatus = Field(..., description="Статус заявки")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата последнего обновления")
    
    # Личные данные
    personal_data: dict = Field(..., description="Личные данные заявителя")
    
    # Информация о лизинге
    leasing_data: dict = Field(..., description="Данные о лизинге")
    
    # Информация о компании
    company_data: dict = Field(..., description="Данные о компании")
    
    # Документы
    documents: dict = Field(..., description="Загруженные документы")
    
    # Дополнительная информация
    comment: Optional[str] = Field(None, description="Комментарий к заявке")
    
    # Telegram данные
    telegram_data: Optional[dict] = Field(None, description="Данные Telegram пользователя")
    user_id: Optional[str] = Field(None, description="ID пользователя")

class DirectLeasingStats(BaseModel):
    total: int = Field(..., description="Общее количество заявок")
    new: int = Field(..., description="Количество новых заявок")
    processing: int = Field(..., description="Количество заявок в обработке")
    approved: int = Field(..., description="Количество одобренных заявок")
    rejected: int = Field(..., description="Количество отклоненных заявок")

class DirectLeasingListResponse(BaseModel):
    total: int = Field(..., description="Общее количество заявок")
    page: int = Field(..., description="Текущая страница")
    page_size: int = Field(..., description="Размер страницы")
    data: List[DirectLeasingApplicationResponse] = Field(..., description="Список заявок")
