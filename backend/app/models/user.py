from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.models.common import PyObjectId

class AddressModel(BaseModel):
    state: str
    city: str
    area: str
    pincode: str

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    phone: str
    password_hash: str
    role: str = "user"
    address: Optional[AddressModel] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    address: Optional[AddressModel] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    role: str
    address: Optional[AddressModel] = None
    
    @classmethod
    def from_mongo(cls, user_doc: dict):
        return cls(
            id=str(user_doc["_id"]),
            name=user_doc["name"],
            email=user_doc["email"],
            phone=user_doc["phone"],
            role=user_doc["role"],
            address=user_doc.get("address")
        )
