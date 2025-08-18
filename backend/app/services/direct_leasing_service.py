import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from fastapi import HTTPException, UploadFile
from pydantic import ValidationError
from app.config.database import direct_leasing_applications
from app.models.direct_leasing import (
    DirectLeasingApplicationCreate,
    DirectLeasingApplicationUpdate,
    ApplicationStatus
)
from app.config.settings import DIRECT_LEASING_DOCS_DIR

# Создаем директорию для документов если её нет
DIRECT_LEASING_DOCS_DIR.mkdir(parents=True, exist_ok=True)

def _get_document_path(application_id: str, document_type: str, filename: str) -> Path:
    """Генерирует путь для сохранения документа"""
    return DIRECT_LEASING_DOCS_DIR / application_id / f"{document_type}_{filename}"

def _save_document(file: UploadFile, application_id: str, document_type: str) -> dict:
    """Сохраняет документ и возвращает словарь с относительным путем и url"""
    file_extension = Path(file.filename).suffix if file.filename else ''
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"

    application_dir = DIRECT_LEASING_DOCS_DIR / application_id
    application_dir.mkdir(parents=True, exist_ok=True)

    file_path = _get_document_path(application_id, document_type, unique_filename)
    with open(file_path, "wb") as f:
        content = file.file.read()
        f.write(content)

    relative_path = f"documents/{application_id}/{document_type}_{unique_filename}"
    url = f"/static/direct_leasing_docs/{application_id}/{document_type}_{unique_filename}"

    return {
        "filename": file.filename,
        "path": relative_path,
        "url": url,
        "size": getattr(file, 'size', 0) or 0,
        "content_type": file.content_type,
    }

async def submit_direct_leasing_application(
    application_data: dict,
    files: Optional[dict] = None,
    current_user: dict = None
):
    """Отправка заявки на Директ лизинг с документами"""
    try:
        print(f"🔍 Данные для валидации: {application_data}")

        application = DirectLeasingApplicationCreate(**application_data)
        print(f"✅ Валидация прошла успешно")

        application_id = str(uuid.uuid4())

        documents = {}
        if files:
            for doc_type, file_or_list in files.items():
                try:
                    if isinstance(file_or_list, list):
                        saved_list = [_save_document(f, application_id, doc_type) for f in file_or_list if getattr(f, 'filename', None)]
                        if saved_list:
                            documents[doc_type] = saved_list
                    else:
                        saved = _save_document(file_or_list, application_id, doc_type)
                        documents[doc_type] = [saved]
                except Exception as e:
                    print(f"Ошибка сохранения документа {doc_type}: {e}")
                    raise HTTPException(status_code=500, detail=f"Ошибка сохранения документа {doc_type}: {str(e)}")

        db_application = {
            "_id": application_id,
            "application_type": "direct_leasing",
            "status": "new",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "personal_data": {
                "first_name": application.firstName,
                "last_name": application.lastName,
                "phone": application.phone,
                "email": application.email
            },
            "leasing_data": {
                "leasing_type": application.leasingType,
                "property_value": application.propertyValue,
                "term": application.term,
                "down_payment": application.downPayment
            },
            "company_data": {
                "company_name": application.companyName,
                "inn": application.inn
            },
            "documents": documents,
            "comment": application.comment,
            "telegram_data": None,
            "user_id": None
        }

        if current_user:
            db_application["telegram_data"] = {
                "user_id": current_user.get("user_id"),
                "username": current_user.get("username"),
                "first_name": current_user.get("first_name"),
                "last_name": current_user.get("last_name")
            }
            db_application["user_id"] = current_user.get("user_id")

        if application.telegramUser and not current_user:
            db_application["telegram_data"] = {
                "user_id": application.telegramUser.get("id"),
                "username": application.telegramUser.get("username"),
                "first_name": application.telegramUser.get("first_name"),
                "last_name": application.telegramUser.get("last_name")
            }
            db_application["user_id"] = application.telegramUser.get("id")

        direct_leasing_applications.insert_one(db_application)

        print(f"✅ Заявка Директ лизинг сохранена: ID {application_id}")
        print(f"   Документ типов: {list(documents.keys())}")

        return {"success": True, "application_id": application_id, "message": "Direct leasing application submitted successfully"}

    except ValidationError as ve:
        # Возвращаем 400 с текстом ошибки валидации
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка сохранения заявки Директ лизинг: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

def get_direct_leasing_stats():
    """Получение статистики заявок Директ лизинг"""
    try:
        stats = {
            "total": direct_leasing_applications.count_documents({}),
            "new": direct_leasing_applications.count_documents({"status": "new"}),
            "processing": direct_leasing_applications.count_documents({"status": "processing"}),
            "approved": direct_leasing_applications.count_documents({"status": "approved"}),
            "rejected": direct_leasing_applications.count_documents({"status": "rejected"})
        }

        return stats

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

def get_direct_leasing_applications(page: int = 1, page_size: int = 10, status: str = None):
    """Получение списка заявок Директ лизинг"""
    try:
        # Фильтр по статусу
        filter_query = {}
        if status:
            filter_query["status"] = status

        # Подсчет общего количества
        total = direct_leasing_applications.count_documents(filter_query)

        # Пагинация
        skip = (page - 1) * page_size
        applications = list(direct_leasing_applications.find(
            filter_query
        ).skip(skip).limit(page_size).sort("created_at", -1))

        # Конвертируем ObjectId в строки для JSON сериализации
        for app in applications:
            app["id"] = str(app["_id"])
            del app["_id"]

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": applications
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get applications: {str(e)}")

def get_direct_leasing_application(application_id: str):
    """Получение заявки Директ лизинг по ID"""
    try:
        application = direct_leasing_applications.find_one({"_id": application_id})
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        # Конвертируем ObjectId в строку
        application["id"] = str(application["_id"])
        del application["_id"]

        return application

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get application: {str(e)}")

def update_direct_leasing_status(application_id: str, status_data: dict):
    """Обновление статуса заявки Директ лизинг"""
    try:
        # Валидация данных через Pydantic модель
        update_data = DirectLeasingApplicationUpdate(**status_data)

        # Обновляем статус
        result = direct_leasing_applications.update_one(
            {"_id": application_id},
            {
                "$set": {
                    "status": update_data.status,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")

        return {
            "success": True,
            "message": f"Application status updated to {update_data.status}"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

def delete_direct_leasing_application(application_id: str):
    """Удаление заявки Директ лизинг и связанных документов"""
    try:
        # Получаем заявку для удаления документов
        application = direct_leasing_applications.find_one({"_id": application_id})
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        # Удаляем документы с диска
        if application.get("documents"):
            application_dir = DIRECT_LEASING_DOCS_DIR / application_id
            if application_dir.exists():
                import shutil
                shutil.rmtree(application_dir)

        # Удаляем из БД
        result = direct_leasing_applications.delete_one({"_id": application_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")

        return {
            "success": True,
            "message": "Application deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")
