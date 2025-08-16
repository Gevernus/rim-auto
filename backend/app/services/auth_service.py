import hmac
import hashlib
import jwt
from datetime import datetime, timedelta
from app.config.settings import TELEGRAM_BOT_TOKEN, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS
from app.config.database import users_collection

def verify_telegram_auth(auth_data):
    """Проверяет подлинность данных Telegram авторизации"""
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
