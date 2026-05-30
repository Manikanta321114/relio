from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from app.models.common import PyObjectId
from bson import ObjectId

import random
import string

def generate_order_id():
    # #ORD + 6 random alphanumeric characters
    chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"#ORD{chars}"

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    alt_phone: Optional[str] = None
    house_no: str
    street: str
    area: str
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str

class OrderModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    order_id: str = Field(default_factory=generate_order_id)
    buyer_id: str
    seller_id: str
    book_id: str
    
    # Snapshot of book details at time of order
    book_title: str
    book_image: Optional[str] = None
    price: float
    delivery_charge: float = 40.0
    packaging_charge: float = 0.0
    discount: float = 0.0
    total_amount: float
    
    # Address
    shipping_address: ShippingAddress
    
    # Payment info
    payment_method: str = "COD" # COD, ONLINE
    payment_status: str = "PENDING" # PENDING, PAID, FAILED
    transaction_id: Optional[str] = None
    
    # Order Tracking Status
    status: str = "Pending" # Pending, Confirmed, Packed, Shipped, Out For Delivery, Delivered, Cancelled
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )


class OrderCreate(BaseModel):
    book_id: str
    shipping_address: ShippingAddress
    payment_method: str = "COD"

class OrderResponse(BaseModel):
    id: str
    order_id: str
    buyer_id: str
    book_id: str
    seller_id: str
    book_title: str
    book_image: Optional[str] = None
    price: float
    delivery_charge: float
    packaging_charge: float
    discount: float
    total_amount: float
    shipping_address: Optional[ShippingAddress] = None
    payment_method: str
    payment_status: str
    transaction_id: Optional[str] = None
    status: str
    created_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict):
        raw_addr = doc.get("shipping_address")
        shipping_addr_obj = None
        if raw_addr and isinstance(raw_addr, dict) and "full_name" in raw_addr:
            try:
                shipping_addr_obj = ShippingAddress(**raw_addr)
            except Exception:
                pass
        return cls(
            id=str(doc["_id"]),
            order_id=doc.get("order_id", ""),
            buyer_id=str(doc["buyer_id"]),
            book_id=str(doc["book_id"]),
            seller_id=str(doc["seller_id"]),
            book_title=doc.get("book_title", "Unknown"),
            book_image=doc.get("book_image"),
            price=doc.get("price", 0.0),
            delivery_charge=doc.get("delivery_charge", 0.0),
            packaging_charge=doc.get("packaging_charge", 0.0),
            discount=doc.get("discount", 0.0),
            total_amount=doc.get("total_amount", 0.0),
            shipping_address=shipping_addr_obj,
            payment_method=doc.get("payment_method", "COD"),
            payment_status=doc.get("payment_status", "PENDING"),
            transaction_id=doc.get("transaction_id"),
            status=doc.get("status", "Pending"),
            created_at=doc["created_at"]
        )
