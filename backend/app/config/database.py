from pymongo import MongoClient
from app.config.settings import MONGO_URL, DB_NAME

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
cars_collection = db.cars
scrape_cache = db.scrape_cache
users_collection = db.users
credit_applications = db.credit_applications
leasing_applications = db.leasing_applications
reviews_collection = db.reviews
