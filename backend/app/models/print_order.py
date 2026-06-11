from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from app.models.common import PyObjectId
from bson import ObjectId
import random
import string

def generate_print_order_id():
    # #PRT + 6 random alphanumeric characters
    chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"#PRT{chars}"

class PrintDeliveryDetails(BaseModel):
    student_name: str
    phone_number: str
    college_name: str
    delivery_location: str # College, Hostel, Home, Other
    address: str
    landmark: Optional[str] = None
    required_time: str # Today, Tomorrow, Specific Date (ISO string or text)

class PrintOrderModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    order_id: str = Field(default_factory=generate_print_order_id)
    user_id: str
    pdf_name: str
    pdf_url: str
    cloudinary_public_id: str
    pages: int
    copies: int
    print_type: str # B/W, Color
    binding: str # None, Spiral
    total_price: float
    payment_method: str = "COD" # COD, Online
    payment_status: str = "Pending" # Pending, Paid
    delivery_details: PrintDeliveryDetails
    status: str = "Pending" # Pending, Accepted, Printing, Out for Delivery, Delivered
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class PrintOrderCreate(BaseModel):
    pdf_name: str
    pdf_url: str
    cloudinary_public_id: str
    pages: int
    copies: int
    print_type: str
    binding: str
    total_price: float
    payment_method: str
    delivery_details: PrintDeliveryDetails

class PrintOrderResponse(BaseModel):
    id: str
    order_id: str
    user_id: str
    pdf_name: str
    pdf_url: str
    cloudinary_public_id: str
    pages: int
    copies: int
    print_type: str
    binding: str
    total_price: float
    payment_method: str
    payment_status: str
    delivery_details: PrintDeliveryDetails
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls(
            id=str(doc["_id"]),
            order_id=doc.get("order_id", ""),
            user_id=str(doc["user_id"]),
            pdf_name=doc.get("pdf_name", "document.pdf"),
            pdf_url=doc.get("pdf_url", ""),
            cloudinary_public_id=doc.get("cloudinary_public_id", ""),
            pages=doc.get("pages", 1),
            copies=doc.get("copies", 1),
            print_type=doc.get("print_type", "B/W"),
            binding=doc.get("binding", "None"),
            total_price=doc.get("total_price", 0.0),
            payment_method=doc.get("payment_method", "COD"),
            payment_status=doc.get("payment_status", "Pending"),
            delivery_details=PrintDeliveryDetails(**doc["delivery_details"]),
            status=doc.get("status", "Pending"),
            admin_notes=doc.get("admin_notes"),
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at", doc["created_at"])
        )
