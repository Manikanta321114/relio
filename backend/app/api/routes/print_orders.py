from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from app.models.user import UserModel
from app.models.print_order import PrintOrderCreate, PrintOrderModel, PrintOrderResponse
from app.models.notification import NotificationModel
from pydantic import BaseModel
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()

class PrintStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

def require_admin(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.post("/", response_model=PrintOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_print_order(order_data: PrintOrderCreate, current_user: UserModel = Depends(get_current_user)):
    try:
        # Validate calculations on the backend
        per_page_rate = 2.0 if order_data.print_type == "B/W" else 10.0
        binding_rate = 30.0 if order_data.binding == "Spiral" else 0.0
        calculated_total = ((order_data.pages * per_page_rate) + binding_rate) * order_data.copies
        
        # Store print order
        new_order = PrintOrderModel(
            user_id=str(current_user.id),
            pdf_name=order_data.pdf_name,
            pdf_url=order_data.pdf_url,
            cloudinary_public_id=order_data.cloudinary_public_id,
            pages=order_data.pages,
            copies=order_data.copies,
            print_type=order_data.print_type,
            binding=order_data.binding,
            total_price=calculated_total, # Use calculated total for security
            payment_method=order_data.payment_method,
            payment_status="Pending" if order_data.payment_method == "COD" else "Paid", # assume Paid for online for mock/demo
            delivery_details=order_data.delivery_details,
            status="Pending"
        )
        
        result = await db.db.print_orders.insert_one(new_order.model_dump(by_alias=True, exclude_none=True))
        created_order = await db.db.print_orders.find_one({"_id": result.inserted_id})
        if not created_order:
            raise Exception("Order inserted but could not be retrieved from database")
        
        # Notify User
        user_notif = NotificationModel(
            user_id=ObjectId(current_user.id),
            title="Print Order Placed (Beta)",
            message=f"Your print order {new_order.order_id} has been submitted. Status: Pending."
        )
        await db.db.notifications.insert_one(user_notif.model_dump(by_alias=True, exclude_none=True))

        # Notify Admin
        admin_user = await db.db.users.find_one({"role": "admin"})
        if admin_user:
            admin_notif = NotificationModel(
                user_id=admin_user["_id"],
                title="New Print Order",
                message=f"Print Order {new_order.order_id} received from {current_user.name}."
            )
            await db.db.notifications.insert_one(admin_notif.model_dump(by_alias=True, exclude_none=True))
            
        return PrintOrderResponse.from_mongo(created_order)
    except Exception as e:
        print("Backend Print Order Creation Failed:", e)
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to place print order: {str(e)}"
        )

@router.get("/my-orders", response_model=List[PrintOrderResponse])
async def get_my_print_orders(current_user: UserModel = Depends(get_current_user)):
    cursor = db.db.print_orders.find({"user_id": str(current_user.id)}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    return [PrintOrderResponse.from_mongo(doc) for doc in orders]

@router.post("/{order_id}/cancel", response_model=PrintOrderResponse)
async def cancel_print_order(order_id: str, current_user: UserModel = Depends(get_current_user)):
    order = await db.db.print_orders.find_one({"_id": ObjectId(order_id), "user_id": str(current_user.id)})
    if not order:
        raise HTTPException(status_code=404, detail="Print order not found")
        
    if order.get("status") != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancellation is disabled. Your order has already been accepted or is printing."
        )
        
    await db.db.print_orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "Cancelled", "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Notify User
    user_notif = NotificationModel(
        user_id=ObjectId(current_user.id),
        title="Print Order Cancelled",
        message=f"Your print order {order['order_id']} has been cancelled."
    )
    await db.db.notifications.insert_one(user_notif.model_dump(by_alias=True, exclude_none=True))

    # Notify Admin
    admin_user = await db.db.users.find_one({"role": "admin"})
    if admin_user:
        admin_notif = NotificationModel(
            user_id=admin_user["_id"],
            title="Print Order Cancelled",
            message=f"Print Order {order['order_id']} was cancelled by student {current_user.name}."
        )
        await db.db.notifications.insert_one(admin_notif.model_dump(by_alias=True, exclude_none=True))
        
    updated_order = await db.db.print_orders.find_one({"_id": ObjectId(order_id)})
    return PrintOrderResponse.from_mongo(updated_order)

@router.get("/admin/all", response_model=List[PrintOrderResponse])
async def get_all_print_orders(admin: UserModel = Depends(require_admin)):
    cursor = db.db.print_orders.find({}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    return [PrintOrderResponse.from_mongo(doc) for doc in orders]

@router.put("/admin/{order_id}/status", response_model=PrintOrderResponse)
async def update_print_order_status(order_id: str, payload: PrintStatusUpdate, admin: UserModel = Depends(require_admin)):
    order = await db.db.print_orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Print order not found")
        
    update_data = {
        "status": payload.status,
        "updated_at": datetime.now(timezone.utc)
    }
    if payload.admin_notes is not None:
        update_data["admin_notes"] = payload.admin_notes
        
    # Mark payment as Paid if status is Delivered
    if payload.status == "Delivered":
        update_data["payment_status"] = "Paid"
        
    await db.db.print_orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    
    # Send Notification to User
    status_msg = f"Your print order {order.get('order_id', '')} status updated to {payload.status}."
    if payload.admin_notes:
        status_msg += f" Note: {payload.admin_notes}"
        
    user_notif = NotificationModel(
        user_id=ObjectId(order["user_id"]),
        title=f"Print Order: {payload.status}",
        message=status_msg
    )
    await db.db.notifications.insert_one(user_notif.model_dump(by_alias=True, exclude_none=True))
    
    updated_order = await db.db.print_orders.find_one({"_id": ObjectId(order_id)})
    return PrintOrderResponse.from_mongo(updated_order)
