from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from app.models.user import UserModel, ProfileUpdate, PasswordUpdate
from app.core.security import verify_password, get_password_hash
from app.models.book import BookResponse
from app.models.order import OrderResponse
from app.models.notification import NotificationModel
from typing import List
from bson import ObjectId
from datetime import datetime, timezone
import pymongo

router = APIRouter()

def require_admin(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/dashboard/stats")
async def get_dashboard_stats(admin: UserModel = Depends(require_admin)):
    pending_books = await db.db.books.count_documents({"status": "pending"})
    approved_books = await db.db.books.count_documents({"status": "approved"})
    active_orders = await db.db.orders.count_documents({"status": {"$nin": ["delivered", "cancelled"]}})
    total_users = await db.db.users.count_documents({})
    
    # Active print orders (excluding delivered and cancelled)
    active_print_orders = await db.db.print_orders.count_documents({"status": {"$nin": ["Delivered", "Cancelled"]}})
    
    return {
        "pendingBooks": pending_books,
        "approvedBooks": approved_books,
        "activeOrders": active_orders,
        "totalUsers": total_users,
        "activePrintOrders": active_print_orders
    }

@router.get("/books/pending", response_model=List[dict])
async def get_pending_books(admin: UserModel = Depends(require_admin)):
    cursor = db.db.books.find({"status": "pending"}).sort("created_at", pymongo.ASCENDING)
    books = await cursor.to_list(length=100)
    
    enriched_books = []
    for book in books:
        seller = await db.db.users.find_one({"_id": ObjectId(book["seller_id"])})
        
        seller_pickup_address = "Not Available"
        if "location" in book:
            loc = book["location"]
            seller_pickup_address = f"{loc.get('area', '')}, {loc.get('city', '')}, {loc.get('state', '')} - {loc.get('pincode', '')}"
        elif seller and seller.get("address"):
            addr = seller["address"]
            seller_pickup_address = f"{addr.get('area', '')}, {addr.get('city', '')}, {addr.get('state', '')} - {addr.get('pincode', '')}"
            
        enriched_books.append({
            **BookResponse.from_mongo(book).model_dump(),
            "seller_name": seller.get("name", "Unknown") if seller else "Unknown",
            "seller_phone": seller.get("phone", "Unknown") if seller else "Unknown",
            "seller_email": seller.get("email", "Unknown") if seller else "Unknown",
            "seller_pickup_address": seller_pickup_address
        })
    return enriched_books

@router.put("/books/{id}/approve")
async def approve_book(id: str, payload: dict, admin: UserModel = Depends(require_admin)):
    admin_price = payload.get("admin_price")
    adjustment_reason = payload.get("adjustment_reason", "None")
    negotiable = bool(payload.get("negotiable", False))
    admin_message = payload.get("admin_message", "")
    
    if admin_price is None:
        raise HTTPException(status_code=400, detail="Admin approved price required")
        
    book = await db.db.books.find_one({"_id": ObjectId(id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    seller_price = book.get("seller_price", book.get("price", 0.0))
    
    result = await db.db.books.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "status": "approved",
            "seller_price": seller_price,
            "admin_price": float(admin_price),
            "price": float(admin_price),
            "negotiable": negotiable,
            "admin_message": admin_message,
            "approval_date": datetime.now(timezone.utc),
            "adjustment_reason": adjustment_reason,
            "last_updated_by": str(admin.id),
            "last_updated_date": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Book already approved or failed to update")
        
    # Notify Seller
    seller_notif = NotificationModel(
        user_id=ObjectId(book["seller_id"]),
        title="Book Approved",
        message=f"Congratulations! Your book {book.get('title')} has been approved."
    )
    await db.db.notifications.insert_one(seller_notif.model_dump(by_alias=True, exclude_none=True))
    
    return {"message": "Book approved successfully"}

@router.put("/books/{id}/reject")
async def reject_book(id: str, payload: dict = None, admin: UserModel = Depends(require_admin)):
    payload = payload or {}
    rejection_reason = payload.get("rejection_reason", "Images are not clear")
    
    book = await db.db.books.find_one({"_id": ObjectId(id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    result = await db.db.books.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "status": "rejected",
            "rejection_reason": rejection_reason,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Book already rejected or failed to update")
        
    # Notify Seller
    seller_notif = NotificationModel(
        user_id=ObjectId(book["seller_id"]),
        title="Book Rejected",
        message=f"Your book {book.get('title')} was rejected. Reason: {rejection_reason}."
    )
    await db.db.notifications.insert_one(seller_notif.model_dump(by_alias=True, exclude_none=True))
    
    return {"message": "Book rejected successfully"}

@router.get("/orders", response_model=List[dict])
async def get_all_orders(
    status: str = None,
    search: str = None,
    admin: UserModel = Depends(require_admin)
):
    query = {}
    if status and status != "All":
        query["status"] = status

    if search:
        query["$or"] = [
            {"order_id": {"$regex": search, "$options": "i"}},
            {"shipping_address.full_name": {"$regex": search, "$options": "i"}},
            {"shipping_address.phone": {"$regex": search, "$options": "i"}}
        ]
        
    cursor = db.db.orders.find(query).sort("created_at", pymongo.DESCENDING)
    orders = await cursor.to_list(length=100)
    
    enriched_orders = []
    for order in orders:
        buyer = await db.db.users.find_one({"_id": ObjectId(order["buyer_id"])})
        seller = await db.db.users.find_one({"_id": ObjectId(order["seller_id"])})
        book = await db.db.books.find_one({"_id": ObjectId(order["book_id"])})
        
        seller_pickup_address = "Not Available"
        if book and "location" in book:
            loc = book["location"]
            seller_pickup_address = f"{loc.get('area', '')}, {loc.get('city', '')}, {loc.get('state', '')} - {loc.get('pincode', '')}"
        elif seller and seller.get("address"):
            addr = seller["address"]
            seller_pickup_address = f"{addr.get('area', '')}, {addr.get('city', '')}, {addr.get('state', '')} - {addr.get('pincode', '')}"
            
        enriched_orders.append({
            "id": str(order["_id"]),
            "order_id": order.get("order_id", ""),
            "buyer_name": order.get("shipping_address", {}).get("full_name", buyer.get("name", "Unknown") if buyer else "Unknown"),
            "buyer_phone": order.get("shipping_address", {}).get("phone", buyer.get("phone", "Unknown") if buyer else "Unknown"),
            "buyer_email": buyer.get("email", "Unknown") if buyer else "Unknown",
            "shipping_address": order.get("shipping_address", {}),
            "book_id": order.get("book_id"),
            "book_title": order.get("book_title", "Unknown Book"),
            "book_image": order.get("book_image"),
            "book_category": book.get("category", "Unknown") if book else "Unknown",
            "book_condition": book.get("condition", "Unknown") if book else "Unknown",
            "book_price": order.get("price", 0.0),
            "price": order.get("price", 0.0),
            "delivery_charge": order.get("delivery_charge", 0.0),
            "packaging_charge": order.get("packaging_charge", 0.0),
            "discount": order.get("discount", 0.0),
            "book_description": book.get("description", "") if book else "",
            "book_back_image": book.get("back_image") if book else None,
            "book_created_at": book.get("created_at") if book else None,
            "seller_name": seller.get("name", "Unknown") if seller else "Unknown",
            "seller_phone": seller.get("phone", "Unknown") if seller else "Unknown",
            "seller_email": seller.get("email", "Unknown") if seller else "Unknown",
            "seller_pickup_address": seller_pickup_address,
            "total_amount": order.get("total_amount", 0.0),
            "payment_method": order.get("payment_method", "COD"),
            "payment_status": order.get("payment_status", "PENDING"),
            "status": order.get("status", "Pending"),
            "created_at": order["created_at"]
        })
        
    return enriched_orders

@router.put("/orders/{id}/status")
async def update_order_status(id: str, payload: dict, admin: UserModel = Depends(require_admin)):
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status required")
        
    order = await db.db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_fields = {"status": new_status, "updated_at": datetime.now(timezone.utc)}
    if new_status == "Delivered":
        update_fields["payment_status"] = "PAID"

    result = await db.db.orders.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_fields}
    )

    buyer_notif = NotificationModel(
        user_id=ObjectId(order["buyer_id"]),
        title=f"Order {new_status}",
        message=f"Your order {order.get('order_id', '')} is now {new_status}."
    )
    await db.db.notifications.insert_one(buyer_notif.model_dump(by_alias=True, exclude_none=True))

    return {"message": "Order status updated"}

@router.put("/orders/{id}/pricing")
async def update_order_pricing(id: str, payload: dict, admin: UserModel = Depends(require_admin)):
    price = float(payload.get("price", 0.0))
    delivery_charge = float(payload.get("delivery_charge", 0.0))
    packaging_charge = float(payload.get("packaging_charge", 0.0))
    discount = float(payload.get("discount", 0.0))
    total_amount = price + delivery_charge + packaging_charge - discount
    
    await db.db.orders.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "price": price,
            "delivery_charge": delivery_charge,
            "packaging_charge": packaging_charge,
            "discount": discount,
            "total_amount": total_amount,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Pricing updated successfully", "total_amount": total_amount}

@router.put("/profile")
async def update_profile(payload: ProfileUpdate, admin: UserModel = Depends(require_admin)):
    result = await db.db.users.update_one(
        {"_id": ObjectId(str(admin.id))},
        {"$set": {
            "name": payload.name,
            "email": payload.email,
            "phone": payload.phone,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Profile updated successfully"}

@router.put("/change-password")
async def change_password(payload: PasswordUpdate, admin: UserModel = Depends(require_admin)):
    if not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    hashed_password = get_password_hash(payload.new_password)
    await db.db.users.update_one(
        {"_id": ObjectId(str(admin.id))},
        {"$set": {
            "password_hash": hashed_password,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Password updated successfully"}


