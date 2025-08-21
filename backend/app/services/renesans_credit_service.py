import uuid
from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from pydantic import ValidationError
from app.config.database import renesans_credit_applications
from app.models.renesans_credit import (
    RenesansCreditApplicationCreate,
    RenesansCreditApplicationUpdate,
    ApplicationStatus
)

def submit_renesans_credit_application(
    application_data: dict,
    current_user: dict = None
):
    """Отправка заявки на кредит Ренессанс"""
    try:
        print(f"🔍 Данные для валидации Ренессанс: {application_data}")

        application = RenesansCreditApplicationCreate(**application_data)
        print(f"✅ Валидация Ренессанс прошла успешно")

        application_id = str(uuid.uuid4())

        db_application = {
            "_id": application_id,
            "application_type": "renesans_credit",
            "status": "new",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "personal_data": {
                "first_name": application.firstName,
                "last_name": application.lastName,
                "phone": application.phone,
                "email": application.email
            },
            "credit_data": {
                "amount": application.amount,
                "term": application.term,
                "down_payment": application.downPayment,
                "monthly_income": application.monthlyIncome
            },
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

        renesans_credit_applications.insert_one(db_application)

        print(f"✅ Заявка Ренессанс кредит сохранена: ID {application_id}")

        return {"success": True, "application_id": application_id, "message": "Renesans credit application submitted successfully"}

    except ValidationError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка сохранения заявки Ренессанс кредит: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

def get_renesans_credit_stats():
    """Получение статистики заявок Ренессанс кредит"""
    try:
        stats = {
            "total": renesans_credit_applications.count_documents({}),
            "new": renesans_credit_applications.count_documents({"status": "new"}),
            "processing": renesans_credit_applications.count_documents({"status": "processing"}),
            "approved": renesans_credit_applications.count_documents({"status": "approved"}),
            "rejected": renesans_credit_applications.count_documents({"status": "rejected"})
        }

        return stats

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

def get_renesans_credit_applications(page: int = 1, page_size: int = 10, status: str = None):
    """Получение списка заявок Ренессанс кредит"""
    try:
        # Фильтр по статусу
        filter_query = {}
        if status:
            filter_query["status"] = status

        # Подсчет общего количества
        total = renesans_credit_applications.count_documents(filter_query)

        # Пагинация
        skip = (page - 1) * page_size
        applications = list(renesans_credit_applications.find(
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

def get_renesans_credit_application(application_id: str):
    """Получение заявки Ренессанс кредит по ID"""
    try:
        application = renesans_credit_applications.find_one({"_id": application_id})
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

def update_renesans_credit_status(application_id: str, status_data: dict):
    """Обновление статуса заявки Ренессанс кредит"""
    try:
        # Валидация данных через Pydantic модель
        update_data = RenesansCreditApplicationUpdate(**status_data)

        # Обновляем статус
        result = renesans_credit_applications.update_one(
            {"_id": application_id},
            {
                "$set": {
                    "status": update_data.status.value,
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

def delete_renesans_credit_application(application_id: str):
    """Удаление заявки Ренессанс кредит"""
    try:
        result = renesans_credit_applications.delete_one({"_id": application_id})

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
