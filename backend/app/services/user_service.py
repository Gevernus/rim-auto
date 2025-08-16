import re
from datetime import datetime
from fastapi import HTTPException
from app.config.database import users_collection

def save_phone(phone: str, current_user: dict):
    """Сохраняет номер телефона в профиле пользователя"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

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

def get_user_profile(current_user: dict):
    """Возвращает профиль пользователя из БД"""
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

def save_phone_from_telegram(phone_number: str, owner_id: int):
    """Сохраняет номер телефона из Telegram webhook"""
    try:
        normalized = re.sub(r"[^0-9+]", "", str(phone_number))
        users_collection.update_one(
            {"telegram_id": owner_id},
            {"$set": {"phone": normalized, "updated_at": datetime.utcnow()}},
            upsert=True,
        )
        print(f"✅ Phone saved for user {owner_id}: {normalized}")
        return True
    except Exception as e:
        print(f"❌ Error saving phone: {e}")
        return False
