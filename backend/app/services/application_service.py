from datetime import datetime
from fastapi import HTTPException
from app.config.database import credit_applications, leasing_applications

def submit_credit_application(application_data: dict, current_user: dict = None):
    """Отправка заявки на кредит"""
    try:
        # Валидация обязательных полей
        required_fields = ['firstName', 'lastName', 'phone', 'amount', 'term', 'monthlyIncome']
        missing_fields = [field for field in required_fields if not application_data.get(field)]
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Создаем объект заявки
        credit_application = {
            # Основные данные заявки
            "application_type": "credit",
            "status": "new",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            
            # Личные данные
            "personal_data": {
                "first_name": application_data.get("firstName"),
                "last_name": application_data.get("lastName"),
                "phone": application_data.get("phone"),
                "email": application_data.get("email")
            },
            
            # Данные о кредите
            "credit_data": {
                "amount": float(application_data.get("amount", 0)),
                "term": int(application_data.get("term", 0)),
                "down_payment": float(application_data.get("downPayment", 0)),
                "monthly_income": float(application_data.get("monthlyIncome", 0))
            },
            
            # Дополнительная информация
            "comment": application_data.get("comment", ""),
            
            # Telegram данные (если пользователь авторизован)
            "telegram_data": None,
            "user_id": None
        }
        
        # Добавляем данные Telegram пользователя если авторизован
        if current_user:
            credit_application["telegram_data"] = {
                "user_id": current_user.get("user_id"),
                "username": current_user.get("username"),
                "first_name": current_user.get("first_name"),
                "last_name": current_user.get("last_name")
            }
            credit_application["user_id"] = current_user.get("user_id")
        
        # Также проверяем telegramUser в данных заявки (для обратной совместимости)
        telegram_user = application_data.get("telegramUser")
        if telegram_user and not current_user:
            credit_application["telegram_data"] = {
                "user_id": telegram_user.get("id"),
                "username": telegram_user.get("username"),
                "first_name": telegram_user.get("first_name"),
                "last_name": telegram_user.get("last_name")
            }
            credit_application["user_id"] = telegram_user.get("id")
        
        # Сохраняем в БД
        result = credit_applications.insert_one(credit_application)
        
        print(f"✅ Кредитная заявка сохранена: ID {result.inserted_id}")
        print(f"   Пользователь: {application_data.get('firstName')} {application_data.get('lastName')}")
        print(f"   Сумма: {application_data.get('amount')} ₽")
        print(f"   Telegram авторизация: {'Да' if current_user or telegram_user else 'Нет'}")
        if credit_application["telegram_data"]:
            print(f"   Telegram: @{credit_application['telegram_data']['username']}")
        
        return {
            "success": True,
            "application_id": str(result.inserted_id),
            "message": "Credit application submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка сохранения кредитной заявки: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

def submit_leasing_application(application_data: dict, current_user: dict = None):
    """Отправка заявки на лизинг"""
    try:
        # Валидация обязательных полей
        required_fields = ['firstName', 'lastName', 'phone', 'leasingType', 'propertyValue', 'term']
        missing_fields = [field for field in required_fields if not application_data.get(field)]
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Создаем объект заявки
        leasing_application = {
            # Основные данные заявки
            "application_type": "leasing",
            "status": "new",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            
            # Личные данные
            "personal_data": {
                "first_name": application_data.get("firstName"),
                "last_name": application_data.get("lastName"),
                "phone": application_data.get("phone"),
                "email": application_data.get("email")
            },
            
            # Данные о лизинге
            "leasing_data": {
                "leasing_type": application_data.get("leasingType"),
                "property_value": float(application_data.get("propertyValue", 0)),
                "term": int(application_data.get("term", 0)),
                "down_payment": float(application_data.get("downPayment", 0))
            },
            
            # Данные о компании
            "company_data": {
                "company_name": application_data.get("companyName"),
                "inn": application_data.get("inn"),
                "monthly_income": float(application_data.get("monthlyIncome", 0)),
                "business_type": application_data.get("businessType")
            },
            
            # Дополнительная информация
            "comment": application_data.get("comment", ""),
            
            # Telegram данные (если пользователь авторизован)
            "telegram_data": None,
            "user_id": None
        }
        
        # Добавляем данные Telegram пользователя если авторизован
        if current_user:
            leasing_application["telegram_data"] = {
                "user_id": current_user.get("user_id"),
                "username": current_user.get("username"),
                "first_name": current_user.get("first_name"),
                "last_name": current_user.get("last_name")
            }
            leasing_application["user_id"] = current_user.get("user_id")
        
        # Также проверяем telegramUser в данных заявки (для обратной совместимости)
        telegram_user = application_data.get("telegramUser")
        if telegram_user and not current_user:
            leasing_application["telegram_data"] = {
                "user_id": telegram_user.get("id"),
                "username": telegram_user.get("username"),
                "first_name": telegram_user.get("first_name"),
                "last_name": telegram_user.get("last_name")
            }
            leasing_application["user_id"] = telegram_user.get("id")
        
        # Сохраняем в БД
        result = leasing_applications.insert_one(leasing_application)
        
        print(f"✅ Лизинговая заявка сохранена: ID {result.inserted_id}")
        print(f"   Пользователь: {application_data.get('firstName')} {application_data.get('lastName')}")
        print(f"   Тип лизинга: {application_data.get('leasingType')}")
        print(f"   Стоимость: {application_data.get('propertyValue')} ₽")
        print(f"   Telegram авторизация: {'Да' if current_user or telegram_user else 'Нет'}")
        if leasing_application["telegram_data"]:
            print(f"   Telegram: @{leasing_application['telegram_data']['username']}")
        
        return {
            "success": True,
            "application_id": str(result.inserted_id),
            "message": "Leasing application submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка сохранения лизинговой заявки: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

def get_applications_stats():
    """Получение статистики заявок"""
    try:
        # Статистика кредитных заявок
        credit_stats = {
            "total": credit_applications.count_documents({}),
            "new": credit_applications.count_documents({"status": "new"}),
            "processing": credit_applications.count_documents({"status": "processing"}),
            "approved": credit_applications.count_documents({"status": "approved"}),
            "rejected": credit_applications.count_documents({"status": "rejected"})
        }
        
        # Статистика лизинговых заявок
        leasing_stats = {
            "total": leasing_applications.count_documents({}),
            "new": leasing_applications.count_documents({"status": "new"}),
            "processing": leasing_applications.count_documents({"status": "processing"}),
            "approved": leasing_applications.count_documents({"status": "approved"}),
            "rejected": leasing_applications.count_documents({"status": "rejected"})
        }
        
        return {
            "credit": credit_stats,
            "leasing": leasing_stats,
            "total_applications": credit_stats["total"] + leasing_stats["total"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

def get_credit_applications(page: int = 1, page_size: int = 10, status: str = None):
    """Получение списка кредитных заявок"""
    try:
        # Фильтр по статусу
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        # Подсчет общего количества
        total = credit_applications.count_documents(filter_query)
        
        # Пагинация
        skip = (page - 1) * page_size
        applications = list(credit_applications.find(
            filter_query
        ).skip(skip).limit(page_size).sort("created_at", -1))
        
        # Конвертируем ObjectId в строки для JSON сериализации
        for app in applications:
            app["_id"] = str(app["_id"])
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": applications
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get applications: {str(e)}")

def get_leasing_applications(page: int = 1, page_size: int = 10, status: str = None):
    """Получение списка лизинговых заявок"""
    try:
        # Фильтр по статусу
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        # Подсчет общего количества
        total = leasing_applications.count_documents(filter_query)
        
        # Пагинация
        skip = (page - 1) * page_size
        applications = list(leasing_applications.find(
            filter_query
        ).skip(skip).limit(page_size).sort("created_at", -1))
        
        # Конвертируем ObjectId в строки для JSON сериализации
        for app in applications:
            app["_id"] = str(app["_id"])
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": applications
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get applications: {str(e)}")

def update_application_status(application_type: str, application_id: str, status_data: dict):
    """Обновление статуса заявки"""
    try:
        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")
        
        # Выбираем коллекцию
        collection = None
        if application_type == "credit":
            collection = credit_applications
        elif application_type == "leasing":
            collection = leasing_applications
        else:
            raise HTTPException(status_code=400, detail="Invalid application type")
        
        # Проверяем валидность ObjectId
        try:
            from bson import ObjectId
            object_id = ObjectId(application_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid application ID")
        
        # Обновляем статус
        result = collection.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "success": True,
            "message": f"Application status updated to {new_status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")
