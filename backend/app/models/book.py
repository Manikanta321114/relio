from pydantic import BaseModel, Field, ConfigDict, confloat
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from app.models.common import PyObjectId
from app.models.user import AddressModel

class BookModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    seller_id: str
    title: str
    author: Optional[str] = "Unknown"
    description: str
    price: float
    category: str
    condition: str
    front_image: str
    back_image: Optional[str] = None
    location: AddressModel
    status: str = "pending" # pending, approved, ordered, collected, packed, shipped, delivered, sold, rejected
    negotiable: bool = False
    approval_date: Optional[datetime] = None
    wishlist_count: int = 0
    share_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class BookCreate(BaseModel):
    title: str
    author: Optional[str] = "Unknown"
    description: str
    price: confloat(gt=0)
    category: str
    condition: str
    front_image: str
    back_image: Optional[str] = None
    location: AddressModel
    negotiable: Optional[bool] = False

class BookResponse(BaseModel):
    id: str
    seller_id: str
    title: str
    author: Optional[str] = "Unknown"
    description: str
    price: float
    seller_price: Optional[float] = None
    admin_price: Optional[float] = None
    category: str
    condition: str
    front_image: str
    back_image: Optional[str] = None
    location: AddressModel
    status: str
    negotiable: bool = False
    approval_date: Optional[datetime] = None
    wishlist_count: Optional[int] = 0
    share_count: Optional[int] = 0
    created_at: datetime
    
    @classmethod
    def from_mongo(cls, book_doc: dict):
        return cls(
            id=str(book_doc["_id"]),
            seller_id=str(book_doc["seller_id"]),
            title=book_doc["title"],
            author=book_doc.get("author", "Unknown"),
            description=book_doc["description"],
            price=book_doc["price"],
            seller_price=book_doc.get("seller_price", book_doc.get("price", 0.0)),
            admin_price=book_doc.get("admin_price"),
            category=book_doc["category"],
            condition=book_doc["condition"],
            front_image=book_doc["front_image"],
            back_image=book_doc.get("back_image"),
            location=AddressModel(**book_doc["location"]),
            status=book_doc["status"],
            negotiable=book_doc.get("negotiable", False),
            approval_date=book_doc.get("approval_date"),
            wishlist_count=book_doc.get("wishlist_count", 0),
            share_count=book_doc.get("share_count", 0),
            created_at=book_doc["created_at"]
        )
