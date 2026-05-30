from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.models.common import PyObjectId

class NotificationModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    title: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    read: bool
    created_at: datetime
    
    @classmethod
    def from_mongo(cls, notif_doc: dict):
        return cls(
            id=str(notif_doc["_id"]),
            user_id=str(notif_doc["user_id"]),
            title=notif_doc["title"],
            message=notif_doc["message"],
            read=notif_doc["read"],
            created_at=notif_doc["created_at"]
        )
