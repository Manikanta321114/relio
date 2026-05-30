from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

import certifi

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL, 
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        # Eagerly check connection
        await db.client.admin.command('ping')
        db.db = db.client[settings.DATABASE_NAME]
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise e

async def close_mongo_connection():
    if db.client is not None:
        db.client.close()
