from fastapi import FastAPI, Query, HTTPException, Depends, Request
from fastapi import UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from pathlib import Path
import re

# Импорты из новых модулей
from app.config.settings import (
    CORS_ORIGINS, 
    STATIC_IMAGES_DIR, 
    CONTRACTS_DIR, 
    ALLOWED_CONTRACT_TYPES
)
from app.config.database import client
from app.services.auth_service import (
    verify_telegram_auth, 
    create_jwt_token, 
    verify_jwt_token, 
    save_user_to_db
)
from app.services.car_service import (
    get_scraped_cars, 
    refresh_cache, 
    get_cars_with_filters
)
from app.services.contract_service import (
    list_contracts, 
    get_contract, 
    upload_contract, 
    delete_contract
)
from app.services.application_service import (
    submit_credit_application, 
    submit_leasing_application,
    get_applications_stats,
    get_credit_applications,
    get_leasing_applications,
    update_application_status
)
from app.services.review_service import (
    get_reviews, 
    create_review, 
    reply_review, 
    delete_review, 
    update_review
)
from app.services.user_service import (
    save_phone, 
    get_user_profile, 
    save_phone_from_telegram
)
from app.services.system_service import (
    get_health_status,
    get_images_stats,
    get_volumes_stats,
    cleanup_images,
    cleanup_contracts,
    get_debug_page_source,
    test_selectors,
    test_custom_selector
)

app = FastAPI()

# Добавляем CORS middleware для доступа frontend к backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Пути для статических файлов (Docker volumes)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Security
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Получает текущего пользователя из JWT токена"""
    if not credentials:
        return None
    
    user_data = verify_jwt_token(credentials.credentials)
    if not user_data:
        return None
    
    return user_data

def get_current_user_or_debug(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Получает текущего пользователя из JWT токена или разрешает debug режим"""
    if not credentials:
        return None
    
    # Проверяем стандартный JWT токен
    user_data = verify_jwt_token(credentials.credentials)
    if user_data:
        return user_data
    
    # Если стандартный токен не работает, проверяем debug токен
    try:
        import base64
        import json
        
        # Декодируем Base64 токен
        decoded_token = base64.b64decode(credentials.credentials).decode('utf-8')
        debug_data = json.loads(decoded_token)
        
        # Проверяем что это debug токен
        if debug_data.get('debug') and debug_data.get('user'):
            user_info = debug_data['user']
            return {
                "user_id": user_info.get('id'),
                "username": user_info.get('username'),
                "first_name": user_info.get('name', '').split()[0] if user_info.get('name') else '',
                "last_name": ' '.join(user_info.get('name', '').split()[1:]) if user_info.get('name') else '',
                "is_debug": True
            }
    except Exception as e:
        print(f"Debug token parsing error: {e}")
        return None
    
    return None

# ====== АВТОРИЗАЦИЯ ======
@app.post("/api/auth/telegram-webapp")
def auth_telegram_webapp(auth_data: dict):
    """Авторизация из Telegram WebApp"""
    try:
        init_data = auth_data.get("initData")
        user_data = auth_data.get("user")
        
        if not init_data or not user_data:
            raise HTTPException(status_code=400, detail="Missing initData or user data")
        
        # Здесь должна быть валидация initData
        # Для упрощения пропускаем валидацию initData в тестовой версии
        
        # Сохраняем пользователя в БД
        saved_user = save_user_to_db(user_data)
        
        # Создаем JWT токен
        token = create_jwt_token(user_data)
        
        return {
            "success": True,
            "user": saved_user,
            "token": token,
            "message": "Successful authentication"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@app.post("/api/auth/telegram-web")
def auth_telegram_web(auth_data: dict):
    """Авторизация через Telegram Login Widget"""
    if not verify_telegram_auth(auth_data.copy()):
        raise HTTPException(status_code=403, detail="Invalid authentication data")
    
    # Сохраняем пользователя в БД
    saved_user = save_user_to_db(auth_data)
    
    # Создаем JWT токен
    token = create_jwt_token(auth_data)
    
    return {
        "success": True,
        "user": saved_user,
        "token": token,
        "message": "Successful authentication"
    }

@app.get("/api/auth/validate")
def validate_token(current_user = Depends(get_current_user)):
    """Валидация JWT токена"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return {
        "valid": True,
        "user": current_user
    }

@app.post("/api/auth/logout")
def logout(current_user = Depends(get_current_user)):
    """Выход из системы"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # В простой реализации просто возвращаем успех
    # В продакшене здесь можно добавить blacklist токенов
    return {
        "success": True,
        "message": "Successfully logged out"
    }

@app.post("/api/auth/telegram")
async def auth_telegram(request: Request):
    """Единая точка для Login Widget (поддержка JSON и form-data)"""
    try:
        content_type = request.headers.get("content-type", "")
        auth_data = None

        if "application/json" in content_type:
            auth_data = await request.json()
        elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
            form = await request.form()
            # Приводим значения к str как ожидает алгоритм проверки
            auth_data = {k: (v if isinstance(v, str) else str(v)) for k, v in form.items()}
        else:
            # Попробуем JSON как fallback
            try:
                auth_data = await request.json()
            except Exception:
                auth_data = None

        if not isinstance(auth_data, dict) or not auth_data:
            raise HTTPException(status_code=400, detail="Invalid or empty auth data")

        if not verify_telegram_auth(auth_data.copy()):
            raise HTTPException(status_code=403, detail="Invalid authentication data")
        
        # Сохраняем пользователя в БД
        saved_user = save_user_to_db(auth_data)
        
        # Создаем JWT токен
        token = create_jwt_token(auth_data)
        
        return {
            "success": True,
            "user": saved_user,
            "token": token,
            "message": "Successful authentication"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@app.post("/api/auth/save-phone")
def auth_save_phone(data: dict, current_user = Depends(get_current_user)):
    """Сохраняет номер телефона в профиле пользователя"""
    phone = (data or {}).get("phone", "")
    return save_phone(phone, current_user)

@app.get("/api/auth/me")
def auth_get_me(current_user = Depends(get_current_user)):
    """Возвращает профиль пользователя из БД"""
    return get_user_profile(current_user)

# ====== АВТОМОБИЛИ ======
@app.get("/api/scrape-cars")
def api_get_scraped_cars():
    """Returns scraped car data, using cache if available."""
    return get_scraped_cars()

@app.post("/api/refresh-cache")
def api_refresh_cache():
    """Force refresh the car cache by scraping new data."""
    return refresh_cache()

@app.get("/api/cars")
def api_get_cars(
    page: int = 1,
    page_size: int = 10,
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
    title: Optional[str] = None,
    price_from: Optional[str] = None,
    price_to: Optional[str] = None,
    year_from: Optional[str] = None,
    year_to: Optional[str] = None,
    country: Optional[str] = None,
):
    """Получает автомобили с фильтрацией, сортировкой и пагинацией"""
    return get_cars_with_filters(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        title=title,
        price_from=price_from,
        price_to=price_to,
        year_from=year_from,
        year_to=year_to,
        country=country
    )

# ====== СИСТЕМА ======
@app.get("/api/health")
def api_get_health():
    """Проверяет статус системы и подключенных сервисов."""
    return get_health_status()

@app.get("/api/images/stats")
def api_get_images_stats():
    """Возвращает статистику скачанных изображений."""
    return get_images_stats()

@app.get("/api/volumes/stats")
def api_get_volumes_stats():
    """Возвращает статистику volumes (изображения и договоры)."""
    return get_volumes_stats()

@app.post("/api/images/cleanup")
def api_cleanup_images():
    """Очищает папку с изображениями."""
    return cleanup_images()

@app.post("/api/contracts/cleanup")
def api_cleanup_contracts():
    """Очищает папку с договорами."""
    return cleanup_contracts()

# ====== ДОГОВОРЫ ======
@app.get("/api/contracts")
def api_list_contracts():
    """Возвращает список доступных договоров"""
    return list_contracts()

@app.get("/api/contracts/{contract_type}")
def api_get_contract(contract_type: str):
    """Возвращает метаданные договора по типу"""
    return get_contract(contract_type)

@app.get("/static/contracts/{contract_type}.docx")
def serve_contract_file(contract_type: str):
    """Раздает файлы контрактов с правильным MIME типом"""
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")
    
    file_path = CONTRACTS_DIR / f"{contract_type}.docx"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Принудительно устанавливаем заголовки
    response = FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{contract_type}.docx"
    )
    
    # Дополнительно устанавливаем заголовок
    response.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return response

@app.post("/api/contracts/{contract_type}")
async def api_upload_contract(
    contract_type: str,
    file: UploadFile = File(...),
):
    """Загружает договор указанного типа"""
    return await upload_contract(contract_type, file)

@app.delete("/api/contracts/{contract_type}")
def api_delete_contract(contract_type: str):
    """Удаляет файл договора указанного типа."""
    return delete_contract(contract_type)

# ====== ЗАЯВКИ ======
@app.post("/api/applications/credit")
def api_submit_credit_application(application_data: dict, current_user = Depends(get_current_user)):
    """Отправка заявки на кредит"""
    return submit_credit_application(application_data, current_user)

@app.post("/api/applications/leasing")
def api_submit_leasing_application(application_data: dict, current_user = Depends(get_current_user)):
    """Отправка заявки на лизинг"""
    return submit_leasing_application(application_data, current_user)

@app.get("/api/applications/stats")
def api_get_applications_stats():
    """Получение статистики заявок"""
    return get_applications_stats()

@app.get("/api/applications/credit")
def api_get_credit_applications(
    page: int = 1,
    page_size: int = 10,
    status: Optional[str] = None,
):
    """Получение списка кредитных заявок"""
    return get_credit_applications(page, page_size, status)

@app.get("/api/applications/leasing")
def api_get_leasing_applications(
    page: int = 1,
    page_size: int = 10,
    status: Optional[str] = None,
):
    """Получение списка лизинговых заявок"""
    return get_leasing_applications(page, page_size, status)

@app.put("/api/applications/{application_type}/{application_id}/status")
def api_update_application_status(
    application_type: str,
    application_id: str,
    status_data: dict,
):
    """Обновление статуса заявки"""
    return update_application_status(application_type, application_id, status_data)

# ====== ОТЗЫВЫ ======
@app.get("/api/reviews")
def api_get_reviews(
    page: int = 1, 
    page_size: int = 10, 
    rating: Optional[int] = None, 
    status: Optional[str] = None
):
    """Получение списка отзывов с фильтрацией и пагинацией"""
    return get_reviews(page, page_size, rating, status)

@app.post("/api/reviews")
def api_create_review(payload: dict, current_user = Depends(get_current_user)):
    """Создание нового отзыва"""
    return create_review(payload, current_user)

@app.post("/api/reviews/{review_id}/reply")
def api_reply_review(review_id: str, payload: dict, current_user = Depends(get_current_user)):
    """Ответ менеджера на отзыв"""
    return reply_review(review_id, payload, current_user)

@app.delete("/api/reviews/{review_id}")
def api_delete_review(review_id: str):
    """Удаление отзыва"""
    return delete_review(review_id)

@app.patch("/api/reviews/{review_id}")
def api_update_review(review_id: str, payload: dict, current_user = Depends(get_current_user)):
    """Редактирование собственного отзыва пользователем"""
    return update_review(review_id, payload, current_user)

# ====== TELEGRAM WEBHOOK ======
@app.post("/api/telegram/webhook/{token}")
async def telegram_webhook(token: str, request: Request):
    """Прием апдейтов Telegram. Сохраняет телефон при шаринге контакта."""
    from app.config.settings import TELEGRAM_BOT_TOKEN
    
    if token != TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")

    try:
        update = await request.json()
    except Exception:
        update = {}

    message = (update or {}).get("message", {})
    contact = message.get("contact") or {}

    if contact and contact.get("phone_number"):
        phone_number = contact.get("phone_number")
        owner_id = contact.get("user_id") or (message.get("from") or {}).get("id")
        if owner_id:
            save_phone_from_telegram(phone_number, owner_id)

    return {"ok": True}

# ====== DEBUG ======
@app.get("/api/debug/page-source")
def api_get_debug_page_source():
    """Возвращает последний сохраненный HTML источник страницы для отладки."""
    return get_debug_page_source()

@app.get("/api/debug/selectors-test")
def api_test_selectors():
    """Тестирует различные селекторы на последней сохраненной странице."""
    return test_selectors()

@app.post("/api/debug/test-selector")
def api_test_custom_selector(data: dict):
    """Тестирует пользовательский селектор на последней сохраненной странице."""
    selector = data.get("selector", "")
    if not selector:
        return {
            "status": "error",
            "message": "Selector is required"
        }
    return test_custom_selector(selector)

# ====== КОРНЕВОЙ ЭНДПОИНТ ======
@app.get("/")
def read_root():
    return {"Hello": "World"}