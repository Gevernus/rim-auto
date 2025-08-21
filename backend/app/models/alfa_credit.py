from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class ApplicationStatus(str, Enum):
    NEW = "new"
    PROCESSING = "processing"
    APPROVED = "approved"
    REJECTED = "rejected"

class AlfaCreditApplicationCreate(BaseModel):
    # Личные данные
    firstName: str = Field(..., min_length=1, max_length=100, description="Имя заявителя")
    lastName: str = Field(..., min_length=1, max_length=100, description="Фамилия заявителя")
    phone: str = Field(..., min_length=10, max_length=32, description="Номер телефона")
    email: Optional[EmailStr] = Field(None, max_length=255, description="Email адрес")
    
    # Информация о кредите
    amount: float = Field(..., gt=0, le=10000000, description="Сумма кредита в рублях")
    term: int = Field(..., ge=12, le=60, description="Срок кредита в месяцах")
    downPayment: Optional[float] = Field(None, ge=0, description="Первоначальный взнос")
    monthlyIncome: float = Field(..., gt=0, description="Ежемесячный доход")
    
    # Дополнительная информация
    comment: Optional[str] = Field(None, max_length=1000, description="Комментарий к заявке")
    
    # Telegram данные (опционально)
    telegramUser: Optional[dict] = Field(None, description="Данные Telegram пользователя")
    
    @field_validator('phone', mode='before')
    @classmethod
    def normalize_and_check_phone(cls, v: str) -> str:
        if not v:
            raise ValueError('Номер телефона обязателен')
        digits = ''.join(ch for ch in str(v) if ch.isdigit())
        if len(digits) < 10:
            raise ValueError('Номер телефона должен содержать минимум 10 цифр')
        return digits

    @field_validator('term', mode='before')
    @classmethod
    def cast_term_int(cls, v):
        if v is None or v == '':
            return v
        return int(float(v))

    @field_validator('amount', 'downPayment', 'monthlyIncome', mode='before')
    @classmethod
    def cast_money_float(cls, v):
        if v is None or v == '':
            return None
        return float(v)

class AlfaCreditApplicationUpdate(BaseModel):
    status: ApplicationStatus = Field(..., description="Новый статус заявки")
    comment: Optional[str] = Field(None, max_length=1000, description="Комментарий к изменению статуса")

class AlfaCreditApplicationResponse(BaseModel):
    id: str = Field(..., description="ID заявки")
    application_type: str = Field(default="alfa_credit", description="Тип заявки")
    status: ApplicationStatus = Field(..., description="Статус заявки")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата последнего обновления")
    
    # Личные данные
    personal_data: dict = Field(..., description="Личные данные заявителя")
    
    # Информация о кредите
    credit_data: dict = Field(..., description="Данные о кредите")
    
    # Дополнительная информация
    comment: Optional[str] = Field(None, description="Комментарий к заявке")
    
    # Telegram данные
    telegram_data: Optional[dict] = Field(None, description="Данные Telegram пользователя")
    user_id: Optional[str] = Field(None, description="ID пользователя")

class AlfaCreditStats(BaseModel):
    total: int = Field(..., description="Общее количество заявок")
    new: int = Field(..., description="Количество новых заявок")
    processing: int = Field(..., description="Количество заявок в обработке")
    approved: int = Field(..., description="Количество одобренных заявок")
    rejected: int = Field(..., description="Количество отклоненных заявок")

class AlfaCreditListResponse(BaseModel):
    total: int = Field(..., description="Общее количество заявок")
    page: int = Field(..., description="Текущая страница")
    page_size: int = Field(..., description="Размер страницы")
    data: list[AlfaCreditApplicationResponse] = Field(..., description="Список заявок")
