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
        raw_details = doc.get("delivery_details", {})
        
        # Resilient mapping for legacy documents
        student_name = raw_details.get("student_name", "")
        phone_number = raw_details.get("phone_number") or raw_details.get("phone") or ""
        college_name = raw_details.get("college_name", "")
        delivery_location = raw_details.get("delivery_location") or raw_details.get("delivery_type") or "College"
        address = raw_details.get("address") or raw_details.get("full_address") or ""
        landmark = raw_details.get("landmark")
        required_time = raw_details.get("required_time") or raw_details.get("required_delivery_time") or "Today"
        
        details = PrintDeliveryDetails(
            student_name=student_name,
            phone_number=phone_number,
            college_name=college_name,
            delivery_location=delivery_location,
            address=address,
            landmark=landmark,
            required_time=required_time
        )
        
        # Print options mapping
        ptype = doc.get("print_type") or doc.get("color_mode") or "B/W"
        if ptype.lower() == "bw":
            ptype = "B/W"
        elif ptype.lower() == "color":
            ptype = "Color"
            
        binding = (doc.get("binding") or "None").title()
        
        # Status mapping
        status = doc.get("status") or doc.get("order_status") or "Pending"
        status = status.title()
        if status == "Out For Delivery":
            status = "Out for Delivery"
            
        return cls(
            id=str(doc["_id"]),
            order_id=doc.get("order_id", ""),
            user_id=str(doc["user_id"]),
            pdf_name=doc.get("pdf_name") or doc.get("pdf_file") or "document.pdf",
            pdf_url=doc.get("pdf_url", ""),
            cloudinary_public_id=doc.get("cloudinary_public_id", ""),
            pages=doc.get("pages", 1),
            copies=doc.get("copies", 1),
            print_type=ptype,
            binding=binding,
            total_price=doc.get("total_price") or doc.get("price") or 0.0,
            payment_method=doc.get("payment_method", "COD"),
            payment_status=doc.get("payment_status", "Pending"),
            delivery_details=details,
            status=status,
            admin_notes=doc.get("admin_notes"),
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at", doc["created_at"])
        )
