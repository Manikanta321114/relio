from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from app.models.user import UserModel
from app.models.order import OrderCreate, OrderModel, OrderResponse
from app.models.notification import NotificationModel
from bson import ObjectId
import time

RATE_LIMIT_COOLDOWNS = {}

def check_rate_limit(user_id: str, action: str, cooldown_seconds: float = 2.0):
    now = time.time()
    key = (str(user_id), action)
    if key in RATE_LIMIT_COOLDOWNS:
        elapsed = now - RATE_LIMIT_COOLDOWNS[key]
        if elapsed < cooldown_seconds:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait a moment before trying to {action.replace('_', ' ')} again."
            )
    RATE_LIMIT_COOLDOWNS[key] = now

router = APIRouter()

@router.post("/checkout", response_model=OrderResponse)
async def checkout_order(order_data: OrderCreate, current_user: UserModel = Depends(get_current_user)):
    check_rate_limit(current_user.id, "checkout_order")
    
    # Verify book exists and is approved
    book = await db.db.books.find_one({"_id": ObjectId(order_data.book_id), "status": "approved"})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found or not available")
        
    # Check if buyer is trying to buy their own book
    if str(book["seller_id"]) == str(current_user.id):
        raise HTTPException(status_code=400, detail="You cannot buy your own book")
        
    price = float(book.get("price", 0.0))
    delivery_charge = 40.0
    discount = 0.0
    total_amount = price + delivery_charge - discount

    # Atomically lock purchase to prevent duplicate orders
    result_update = await db.db.books.update_one(
        {"_id": ObjectId(order_data.book_id), "status": "approved"},
        {"$set": {"status": "sold"}}
    )
    if result_update.modified_count == 0:
        raise HTTPException(status_code=400, detail="This book is already sold")
        
    # Create order
    new_order = OrderModel(
        buyer_id=str(current_user.id),
        book_id=order_data.book_id,
        seller_id=str(book["seller_id"]),
        book_title=book.get("title", "Unknown"),
        book_image=book.get("front_image"),
        price=price,
        delivery_charge=delivery_charge,
        discount=discount,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        payment_method="COD",
        payment_status="PENDING",
        status="Pending"
    )
    
    result = await db.db.orders.insert_one(new_order.model_dump(by_alias=True, exclude_none=True))
    created_order = await db.db.orders.find_one({"_id": result.inserted_id})
    
    # Notify Buyer
    buyer_notif = NotificationModel(
        user_id=ObjectId(current_user.id),
        title="Order Successfully Placed",
        message=f"Your order {new_order.order_id} for '{book.get('title')}' has been placed using COD."
    )
    await db.db.notifications.insert_one(buyer_notif.model_dump(by_alias=True, exclude_none=True))

    # Notify Admin
    admin_user = await db.db.users.find_one({"role": "admin"})
    if admin_user:
        admin_notif = NotificationModel(
            user_id=admin_user["_id"],
            title="New Order Received",
            message=f"Order {new_order.order_id} received from {current_user.name} for ₹{total_amount}."
        )
        await db.db.notifications.insert_one(admin_notif.model_dump(by_alias=True, exclude_none=True))
    
    return OrderResponse.from_mongo(created_order)

@router.get("/my-orders", response_model=list[OrderResponse])
async def get_my_orders(current_user: UserModel = Depends(get_current_user)):
    cursor = db.db.orders.find({"buyer_id": str(current_user.id)}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    return [OrderResponse.from_mongo(doc) for doc in orders]

@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(order_id: str, current_user: UserModel = Depends(get_current_user)):
    order = await db.db.orders.find_one({"_id": ObjectId(order_id), "buyer_id": str(current_user.id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    current_status = order.get("status", "Pending")
    allowed_to_cancel = ["Pending", "Packed"]
    if current_status not in allowed_to_cancel:
        raise HTTPException(status_code=400, detail="Cannot cancel order at this stage")
        
    await db.db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "Cancelled", "payment_status": "CANCELLED"}}
    )
    
    await db.db.books.update_one(
        {"_id": ObjectId(order["book_id"])},
        {"$set": {"status": "approved"}}
    )
    
    buyer_notif = NotificationModel(
        user_id=ObjectId(current_user.id),
        title="Order Cancelled",
        message=f"Your order {order['order_id']} has been successfully cancelled."
    )
    await db.db.notifications.insert_one(buyer_notif.model_dump(by_alias=True, exclude_none=True))
    
    admin_notif = None
    admin_user = await db.db.users.find_one({"role": "admin"})
    if admin_user:
        admin_notif = NotificationModel(
            user_id=admin_user["_id"],
            title="Order Cancelled by Buyer",
            message=f"Order {order['order_id']} has been cancelled by buyer {current_user.name}."
        )
        await db.db.notifications.insert_one(admin_notif.model_dump(by_alias=True, exclude_none=True))
        
    updated_order = await db.db.orders.find_one({"_id": ObjectId(order_id)})
    return OrderResponse.from_mongo(updated_order)

