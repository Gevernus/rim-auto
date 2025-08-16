import os
import requests
from datetime import datetime
from pathlib import Path
from app.config.settings import STATIC_IMAGES_DIR, CONTRACTS_DIR, SELENIUM_URL
from app.config.database import client, scrape_cache

def get_health_status():
    """Проверяет статус системы и подключенных сервисов"""
    health_status = {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Проверка MongoDB
    try:
        client.admin.command('ping')
        health_status["services"]["mongodb"] = "ok"
    except Exception as e:
        health_status["services"]["mongodb"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # Проверка Selenium
    try:
        selenium_url = f"{SELENIUM_URL}/status"
        response = requests.get(selenium_url, timeout=5)
        if response.status_code == 200:
            health_status["services"]["selenium"] = "ok"
        else:
            health_status["services"]["selenium"] = f"error: status {response.status_code}"
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["selenium"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # Проверка кэша автомобилей
    try:
        car_count = scrape_cache.count_documents({})
        health_status["services"]["car_cache"] = f"ok ({car_count} cars)"
    except Exception as e:
        health_status["services"]["car_cache"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

def get_images_stats():
    """Возвращает статистику скачанных изображений"""
    try:
        images_dir = STATIC_IMAGES_DIR
        if not images_dir.exists():
            return {"total_images": 0, "total_size": 0, "status": "directory_not_found"}
        
        image_files = list(images_dir.glob("*"))
        total_size = sum(f.stat().st_size for f in image_files if f.is_file())
        
        return {
            "total_images": len(image_files),
            "total_size": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "directory": str(images_dir),
            "status": "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

def get_volumes_stats():
    """Возвращает статистику volumes (изображения и договоры)"""
    try:
        stats = {
            "images": {"files": 0, "size_mb": 0},
            "contracts": {"files": 0, "size_mb": 0}
        }
        
        # Статистика изображений
        if STATIC_IMAGES_DIR.exists():
            image_files = list(STATIC_IMAGES_DIR.glob("*"))
            total_size = sum(f.stat().st_size for f in image_files if f.is_file())
            stats["images"] = {
                "files": len(image_files),
                "size_mb": round(total_size / (1024 * 1024), 2)
            }
        
        # Статистика договоров
        if CONTRACTS_DIR.exists():
            contract_files = list(CONTRACTS_DIR.glob("*.docx"))
            total_size = sum(f.stat().st_size for f in contract_files if f.is_file())
            stats["contracts"] = {
                "files": len(contract_files),
                "size_mb": round(total_size / (1024 * 1024), 2)
            }
        
        return {
            "status": "ok",
            "volumes": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"error": str(e), "status": "error"}

def cleanup_images():
    """Очищает папку с изображениями"""
    try:
        images_dir = STATIC_IMAGES_DIR
        if not images_dir.exists():
            return {"message": "Directory not found", "status": "ok"}
        
        deleted_count = 0
        for image_file in images_dir.glob("*"):
            if image_file.is_file():
                image_file.unlink()
                deleted_count += 1
        
        return {
            "message": f"Deleted {deleted_count} images",
            "deleted_count": deleted_count,
            "status": "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

def cleanup_contracts():
    """Очищает папку с договорами"""
    try:
        contracts_dir = CONTRACTS_DIR
        if not contracts_dir.exists():
            return {"message": "Directory not found", "status": "ok"}
        
        deleted_count = 0
        for contract_file in contracts_dir.glob("*.docx"):
            if contract_file.is_file():
                contract_file.unlink()
                deleted_count += 1
        
        return {
            "message": f"Deleted {deleted_count} contracts",
            "deleted_count": deleted_count,
            "status": "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

def get_debug_page_source():
    """Возвращает последний сохраненный HTML источник страницы для отладки"""
    try:
        if os.path.exists("debug_page_source.html"):
            with open("debug_page_source.html", "r", encoding="utf-8") as f:
                content = f.read()
            return {
                "status": "ok",
                "content": content[:50000],  # Ограничиваем до 50KB
                "full_length": len(content),
                "message": "HTML source from last scraping attempt"
            }
        else:
            return {
                "status": "not_found",
                "message": "No debug page source found. Run scraping first."
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def test_selectors():
    """Тестирует различные селекторы на последней сохраненной странице"""
    try:
        if not os.path.exists("debug_page_source.html"):
            return {
                "status": "not_found",
                "message": "No debug page source found. Run scraping first."
            }
        
        from bs4 import BeautifulSoup
        
        with open("debug_page_source.html", "r", encoding="utf-8") as f:
            content = f.read()
        
        soup = BeautifulSoup(content, "html.parser")
        
        # Тестируем различные селекторы
        selectors_to_test = [
            # Основные селекторы для карточек автомобилей
            "li.cxc-card",
            "li.cards-li",
            "li.list-photo-li",
            ".cxc-card",
            ".cards-li",
            ".list-photo-li",
            
            # Комбинированные селекторы
            "li.cards-li.cxc-card",
            "li.list-photo-li.cxc-card",
            "li.cards-li.list-photo-li",
            
            # Альтернативные селекторы
            "div[class*='viewlist_li']",
            "li[class*='list-item']", 
            "div[class*='list-item']",
            "div[class*='car-card']",
            "div[class*='item-pic']",
            "div[class*='pic-box']",
            "div[class*='result']",
            ".list-item",
            "article",
            
            # Дополнительные селекторы из интересных классов
            ".vehicle-search-list",
            ".vehicle-second-list",
            ".tp-cards-tofu",
            ".right-sidebar-car"
        ]
        
        results = {}
        
        for selector in selectors_to_test:
            elements = soup.select(selector)
            results[selector] = {
                "count": len(elements),
                "sample_classes": [elem.get('class', []) for elem in elements[:3]],
                "sample_text": [elem.get_text()[:100].strip() for elem in elements[:3]]
            }
        
        # Также ищем все уникальные классы
        all_divs = soup.find_all(['div', 'li', 'article'])
        unique_classes = set()
        for div in all_divs:
            classes = div.get('class', [])
            for cls in classes:
                if any(keyword in cls.lower() for keyword in ['list', 'item', 'car', 'card', 'photo', 'wrap']):
                    unique_classes.add(cls)
        
        # Анализ структуры найденных карточек
        car_cards = soup.select("li.cxc-card")
        card_analysis = {}
        if car_cards:
            sample_card = car_cards[0]
            card_analysis = {
                "total_cards": len(car_cards),
                "sample_id": sample_card.get('id', ''),
                "sample_classes": sample_card.get('class', []),
                "sample_attributes": {k: v for k, v in sample_card.attrs.items() if k not in ['class', 'id']},
                "has_link": bool(sample_card.find('a')),
                "has_image": bool(sample_card.find('img')),
                "has_price": bool(sample_card.find(text=lambda text: text and '万' in text))
            }
        
        return {
            "status": "ok",
            "selector_results": results,
            "interesting_classes": sorted(list(unique_classes)),
            "total_divs": len(all_divs),
            "card_analysis": card_analysis
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def test_custom_selector(selector: str):
    """Тестирует пользовательский селектор на последней сохраненной странице"""
    try:
        if not selector:
            return {
                "status": "error",
                "message": "Selector is required"
            }
        
        if not os.path.exists("debug_page_source.html"):
            return {
                "status": "not_found",
                "message": "No debug page source found. Run scraping first."
            }
        
        from bs4 import BeautifulSoup
        
        with open("debug_page_source.html", "r", encoding="utf-8") as f:
            content = f.read()
        
        soup = BeautifulSoup(content, "html.parser")
        elements = soup.select(selector)
        
        # Анализ найденных элементов
        analysis = {
            "count": len(elements),
            "sample_classes": [elem.get('class', []) for elem in elements[:5]],
            "sample_text": [elem.get_text()[:200].strip() for elem in elements[:5]],
            "sample_ids": [elem.get('id', '') for elem in elements[:5]],
            "sample_attributes": []
        }
        
        # Анализ атрибутов первых 3 элементов
        for elem in elements[:3]:
            attrs = {k: v for k, v in elem.attrs.items() if k not in ['class', 'id']}
            analysis["sample_attributes"].append(attrs)
        
        return {
            "status": "ok",
            "selector": selector,
            "analysis": analysis
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
