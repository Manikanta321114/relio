from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.models.common import PyObjectId
import random
import string

def generate_print_order_id():
    chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"#PRT{chars}"

class DeliveryDetails(BaseModel):
    student_name: str
    phone: str
    college_name: str
    delivery_type: str # College, Hostel, Home, Other
    full_address: str
    landmark: Optional[str] = None
    required_delivery_time: str # Today, Tomorrow, Custom Date
    special_instructions: Optional[str] = None

class PrintOrderModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    order_id: str = Field(default_factory=generate_print_order_id)
    user_id: str
    pdf_file: str # Base64 string or filename/url
    pages: int
    copies: int
    color_mode: str # bw, color
    binding: str # spiral, staple, none
    price: float
    delivery_details: DeliveryDetails
    order_status: str = "Pending" # Pending, Accepted, Printing, Out for Delivery, Delivered
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class PrintOrderCreate(BaseModel):
    pdf_file: str
    pages: int
    copies: int
    color_mode: str
    binding: str
    price: float
    delivery_details: DeliveryDetails

class PrintOrderResponse(BaseModel):
    id: str
    order_id: str
    user_id: str
    pdf_file: str
    pages: int
    copies: int
    color_mode: str
    binding: str
    price: float
    delivery_details: DeliveryDetails
    order_status: str
    created_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls(
            id=str(doc["_id"]),
            order_id=doc.get("order_id", ""),
            user_id=str(doc["user_id"]),
            pdf_file=doc.get("pdf_file", ""),
            pages=int(doc.get("pages", 1)),
            copies=int(doc.get("copies", 1)),
            color_mode=doc.get("color_mode", "bw"),
            binding=doc.get("binding", "none"),
            price=float(doc.get("price", 0.0)),
            delivery_details=DeliveryDetails(**doc.get("delivery_details", {})),
            order_status=doc.get("order_status", "Pending"),
            created_at=doc["created_at"]
        )
