from fastapi import APIRouter, Depends
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from app.models.user import UserModel
from app.models.notification import NotificationResponse
import pymongo
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=list[NotificationResponse])
async def get_notifications(current_user: UserModel = Depends(get_current_user)):
    cursor = db.db.notifications.find({"user_id": str(current_user.id)}).sort("created_at", pymongo.DESCENDING)
    notifs = await cursor.to_list(length=50)
    return [NotificationResponse.from_mongo(doc) for doc in notifs]

@router.put("/{notif_id}/read")
async def mark_read(notif_id: str, current_user: UserModel = Depends(get_current_user)):
    await db.db.notifications.update_one(
        {"_id": ObjectId(notif_id), "user_id": str(current_user.id)},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}
