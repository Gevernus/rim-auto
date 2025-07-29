from fastapi import FastAPI, Query, HTTPException
from pymongo import MongoClient
import os
import json
from datetime import datetime, timedelta
from typing import Optional, List
import random
import hmac
import hashlib
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


app = FastAPI()

# Telegram Bot Token - REPLACE WITH YOURS
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")

# MongoDB setup
client = MongoClient(os.environ.get("MONGO_URL", "mongodb://mongo:27017/"))
db = client.cars_db
cars_collection = db.cars
scrape_cache = db.scrape_cache


def get_mock_cars():
    """Generates a list of mock car data."""
    brands = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi"]
    models = ["Camry", "Civic", "F-150", "Silverado", "Rogue", "X5", "C-Class", "A4"]
    cars = []
    for i in range(100):
        brand = random.choice(brands)
        cars.append({
            "seriesId": i,
            "brandName": brand,
            "seriesName": f"{random.choice(models)} {random.randint(2010, 2023)}",
            "price": f"{random.randint(10, 50)}万",
            "volume": round(random.uniform(1.0, 5.0), 1),
            "imageUrl": f"https://picsum.photos/seed/{i}/400/300"
        })
    return cars

def scrape_and_cache_cars():
    """Scrapes car data from the website and caches it."""
    url = "https://www.che168.com/china/list/"
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(url)
        soup = BeautifulSoup(driver.page_source, "html.parser")
    finally:
        driver.quit()

    car_list = []

    for car_item in soup.find_all("li", class_="cards-li"):
        title_tag = car_item.find("a", class_="carinfo")
        if not title_tag:
            continue
            
        title = title_tag.get("title")
        price_tag = car_item.find("span", class_="price")
        price = price_tag.text.strip() if price_tag else "N/A"
        image_tag = car_item.find("img")
        image_url = image_tag.get("src") if image_tag else ""
        if image_url and not image_url.startswith("http"):
            image_url = "https:" + image_url

        car_list.append({
            "title": title,
            "price": price,
            "image_url": image_url
        })
    
    if car_list:
        scrape_cache.delete_many({})
        scrape_cache.insert_many(car_list)
        
    return car_list


def verify_telegram_auth(auth_data):
    if not auth_data:
        return False

    received_hash = auth_data.pop('hash')
    auth_data_list = [f"{key}={value}" for key, value in sorted(auth_data.items())]
    data_check_string = "\n".join(auth_data_list)

    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    return received_hash == calculated_hash

@app.post("/api/auth/telegram")
def auth_telegram(auth_data: dict):
    if not verify_telegram_auth(auth_data.copy()):
        raise HTTPException(status_code=403, detail="Invalid authentication data")

    # Here you would typically create a session or a JWT for the user
    # For simplicity, we'll just return the user data
    return auth_data

@app.get("/api/scrape-cars")
def get_scraped_cars():
    """Returns scraped car data, using cache if available."""
    cached_cars = list(scrape_cache.find({}, {"_id": 0}))
    if cached_cars:
        return {
            "source": "cache",
            "data": cached_cars
        }

    car_list = scrape_and_cache_cars()
    return {
        "source": "live",
        "data": car_list
    }


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/cars")
def get_cars(
    page: int = 1,
    page_size: int = 10,
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
    brandName: Optional[str] = None,
    seriesName: Optional[str] = None,
    volume_from: Optional[float] = None,
    volume_to: Optional[float] = None,
):
    # Simple caching mechanism
    last_update_doc = db.system.find_one({"_id": "last_update"})
    if not last_update_doc or last_update_doc["timestamp"] < datetime.utcnow() - timedelta(hours=1):
        # Fetch data from mock function
        all_series_list = get_mock_cars()
        cars_collection.delete_many({})
        cars_collection.insert_many(all_series_list)
        # Update last update timestamp
        db.system.update_one({"_id": "last_update"}, {"$set": {"timestamp": datetime.utcnow()}}, upsert=True)

    query = {}
    if brandName:
        query["brandName"] = {"$regex": brandName, "$options": "i"}
    if seriesName:
        query["seriesName"] = {"$regex": seriesName, "$options": "i"}
    if volume_from is not None:
        query["volume"] = {"$gte": volume_from}
    if volume_to is not None:
        if "volume" in query:
            query["volume"]["$lte"] = volume_to
        else:
            query["volume"] = {"$lte": volume_to}

    cursor = cars_collection.find(query, {"_id": 0})

    if sort_by:
        from pymongo import ASCENDING, DESCENDING
        order = ASCENDING if sort_order == "asc" else DESCENDING
        cursor = cursor.sort(sort_by, order)

    total_cars = cars_collection.count_documents(query)
    cars = list(cursor.skip((page - 1) * page_size).limit(page_size))

    return {
        "total": total_cars,
        "page": page,
        "page_size": page_size,
        "data": json.loads(json.dumps(cars, default=str))
    } 