import re
from datetime import datetime
from fastapi import HTTPException
from bson import ObjectId
from app.config.database import reviews_collection, users_collection

def get_reviews(page: int = 1, page_size: int = 10, rating: int = None, status: str = None):
    """Получение списка отзывов с фильтрацией и пагинацией"""
    try:
        skip = (page - 1) * page_size
        # Формируем фильтр
        query: dict = {}
        if rating is not None:
            try:
                rating_int = int(rating)
                if rating_int < 1 or rating_int > 5:
                    raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
                query["rating"] = rating_int
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid rating")
        if status:
            if status not in ("new", "processed"):
                raise HTTPException(status_code=400, detail="Invalid status")
            if status == "new":
                # Статус новый: либо явно status=new, либо нет ответа
                query["$or"] = [{"status": "new"}, {"reply": None}]
            elif status == "processed":
                # Статус обработан: либо явно status=processed, либо есть ответ
                query["$or"] = [{"status": "processed"}, {"reply": {"$ne": None}}]

        total = reviews_collection.count_documents(query)
        items = list(
            reviews_collection
            .find(query)
            .skip(skip)
            .limit(page_size)
            .sort("created_at", -1)
        )
        for item in items:
            item["_id"] = str(item["_id"]) 
        return {"total": total, "page": page, "page_size": page_size, "data": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reviews: {str(e)}")

def create_review(payload: dict, current_user: dict):
    """Создание нового отзыва"""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Берем данные пользователя из токена с fallback на БД
        telegram_id = (current_user or {}).get("user_id")
        db_user = users_collection.find_one({"telegram_id": telegram_id}) or {}
        first_name = (current_user or {}).get("first_name") or db_user.get("first_name") or ""
        last_name = (current_user or {}).get("last_name") or db_user.get("last_name") or ""
        username = (current_user or {}).get("username") or db_user.get("username") or ""
        full_name = (f"{first_name} {last_name}".strip()) or (f"@{username}" if username else "Пользователь")

        message = (payload or {}).get("message", "").strip()
        rating = int((payload or {}).get("rating", 0))
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        if not message or len(message) < 3:
            raise HTTPException(status_code=400, detail="Сообщение слишком короткое")
        doc = {
            "name": full_name,
            "message": message,
            "rating": rating,
            "created_at": datetime.utcnow(),
            "reply": None,
            "reply_author": None,
            "reply_at": None,
            "user": None,
            "status": "new",
        }
        doc["user"] = {
            "user_id": telegram_id,
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
        }
        result = reviews_collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return {"success": True, "data": doc}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

def reply_review(review_id: str, payload: dict, current_user: dict):
    """Ответ менеджера на отзыв"""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        reply_text = (payload or {}).get("reply", "").strip()
        # Формируем автора ответа из профиля текущего пользователя (fallback на БД)
        telegram_id = (current_user or {}).get("user_id")
        db_user = users_collection.find_one({"telegram_id": telegram_id}) or {}
        first_name = (current_user or {}).get("first_name") or db_user.get("first_name") or ""
        last_name = (current_user or {}).get("last_name") or db_user.get("last_name") or ""
        username = (current_user or {}).get("username") or db_user.get("username") or ""
        reply_author = (f"{first_name} {last_name}".strip()) or (f"@{username}" if username else "Менеджер")
        if not reply_text:
            raise HTTPException(status_code=400, detail="Reply is required")
        try:
            oid = ObjectId(review_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid review ID")
        result = reviews_collection.update_one(
            {"_id": oid},
            {"$set": {"reply": reply_text, "reply_author": reply_author, "reply_at": datetime.utcnow(), "status": "processed"}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reply: {str(e)}")

def delete_review(review_id: str):
    """Удаление отзыва"""
    try:
        try:
            oid = ObjectId(review_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid review ID")
        result = reviews_collection.delete_one({"_id": oid})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")

def update_review(review_id: str, payload: dict, current_user: dict):
    """Редактирование собственного отзыва пользователем"""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        try:
            oid = ObjectId(review_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid review ID")

        review = reviews_collection.find_one({"_id": oid})
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        # Разрешаем редактировать только владельцу
        owner_id = str(((review or {}).get("user") or {}).get("user_id") or "")
        current_id = str(current_user.get("user_id") or "")
        if not owner_id or owner_id != current_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        updates = {}
        if "message" in payload:
            message = (payload.get("message") or "").strip()
            if len(message) < 3:
                raise HTTPException(status_code=400, detail="Сообщение слишком короткое")
            updates["message"] = message
        if "rating" in payload:
            try:
                rating = int(payload.get("rating"))
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid rating")
            if rating < 1 or rating > 5:
                raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
            updates["rating"] = rating

        if not updates:
            return {"success": True}

        updates["updated_at"] = datetime.utcnow()
        reviews_collection.update_one({"_id": oid}, {"$set": updates})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update review: {str(e)}")
