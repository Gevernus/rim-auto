import os
from pathlib import Path

# Пути для статических файлов (Docker volumes)
STATIC_IMAGES_DIR = Path("static/images")
CONTRACTS_DIR = Path("static/contracts")

# Telegram Bot Token
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 дней

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://mongo:27017/")
DB_NAME = "cars_db"

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "https://casa-de-costura.ru", 
    "*"
]

# Selenium settings
SELENIUM_URL = "http://selenium:4444/wd/hub"

# Scraping settings
SCRAPING_URL = "https://www.che168.com/china/list/"
SCRAPING_TIMEOUT = 30
SCRAPING_DELAY = 1

# Allowed contract types and extensions
ALLOWED_CONTRACT_TYPES = {"agency", "consignment", "sale"}
ALLOWED_CONTRACT_EXT = {".docx", ".doc"}
