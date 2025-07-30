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
    
    driver = webdriver.Remote(
        command_executor='http://selenium:4444/wd/hub',
        options=webdriver.ChromeOptions()
    )
    
    try:
        driver.get(url)
        
        # Save screenshot
        driver.save_screenshot("screenshot.png")
        print("Screenshot saved as screenshot.png")
        
        # Save page source
        with open("page_source.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("Page source saved as page_source.html")
        
        soup = BeautifulSoup(driver.page_source, "html.parser")
    finally:
        driver.quit()

    car_list = []

    # Find car listing containers
    car_containers = soup.find_all("div", class_="css-175oi2r r-1awozwy r-1777fci r-d0pm55 r-156q2ks r-13qz1uu")
    
    for car_container in car_containers:
        # Find title (car name)
        title_element = car_container.find("div", class_="css-1rynq56 r-8akbws r-krxsd3 r-dnmrzs r-1udh08x r-1udbk01")
        title = title_element.text.strip() if title_element else "N/A"
        
        # Find price
        price_element = car_container.find("div", class_="css-1rynq56", style=lambda x: x and "color: rgb(255, 68, 52)" in x)
        if not price_element:
            price_element = car_container.find("div", class_="css-1rynq56", style=lambda x: x and "color: rgb(255, 102, 0)" in x)
        
        price = price_element.text.strip() if price_element else "N/A"
        
        # Find image
        image_element = car_container.find("img")
        image_url = image_element.get("src") if image_element else ""
        if image_url and not image_url.startswith("http"):
            image_url = "https:" + image_url

        if title != "N/A" and price != "N/A":
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
            "data": json.loads(json.dumps(cached_cars, default=str))
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
    title: Optional[str] = None,
    price_from: Optional[str] = None,
    price_to: Optional[str] = None,
):
    # Get cached scraped data
    cached_cars = list(scrape_cache.find({}, {"_id": 0}))
    
    # If no cached data, scrape fresh data
    if not cached_cars:
        car_list = scrape_and_cache_cars()
        cached_cars = list(scrape_cache.find({}, {"_id": 0}))
    
    # Apply filters
    filtered_cars = cached_cars
    
    if title:
        filtered_cars = [car for car in filtered_cars if title.lower() in car.get("title", "").lower()]
    
    if price_from:
        # Extract numeric price for comparison
        filtered_cars = [car for car in filtered_cars if float(car.get("price", "0").replace("万", "")) >= float(price_from)]
    
    if price_to:
        # Extract numeric price for comparison
        filtered_cars = [car for car in filtered_cars if float(car.get("price", "0").replace("万", "")) <= float(price_to)]

    # Apply sorting
    if sort_by:
        reverse = sort_order == "desc"
        if sort_by == "title":
            filtered_cars.sort(key=lambda x: x.get("title", ""), reverse=reverse)
        elif sort_by == "price":
            filtered_cars.sort(key=lambda x: float(x.get("price", "0").replace("万", "")), reverse=reverse)

    total_cars = len(filtered_cars)
    
    # Apply pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_cars = filtered_cars[start_index:end_index]

    return {
        "total": total_cars,
        "page": page,
        "page_size": page_size,
        "data": json.loads(json.dumps(paginated_cars, default=str))
    } 