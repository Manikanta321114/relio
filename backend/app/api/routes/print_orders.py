from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from app.models.user import UserModel
from app.models.print_order import PrintOrderCreate, PrintOrderModel, PrintOrderResponse
from app.models.notification import NotificationModel
from bson import ObjectId

router = APIRouter()

@router.post("/checkout", response_model=PrintOrderResponse)
async def checkout_print_order(order_data: PrintOrderCreate, current_user: UserModel = Depends(get_current_user)):
    new_order = PrintOrderModel(
        user_id=str(current_user.id),
        pdf_file=order_data.pdf_file,
        pages=order_data.pages,
        copies=order_data.copies,
        color_mode=order_data.color_mode,
        binding=order_data.binding,
        price=order_data.price,
        delivery_details=order_data.delivery_details,
        order_status="Pending"
    )
    
    result = await db.db.print_orders.insert_one(new_order.model_dump(by_alias=True, exclude_none=True))
    created_order = await db.db.print_orders.find_one({"_id": result.inserted_id})
    
    # Notify Student
    buyer_notif = NotificationModel(
        user_id=ObjectId(current_user.id),
        title="Print Order Placed Successfully",
        message=f"Your print order {new_order.order_id} has been placed. We are reviewing your document."
    )
    await db.db.notifications.insert_one(buyer_notif.model_dump(by_alias=True, exclude_none=True))

    # Notify Admin
    admin_user = await db.db.users.find_one({"role": "admin"})
    if admin_user:
        admin_notif = NotificationModel(
            user_id=admin_user["_id"],
            title="New Print Order Received",
            message=f"Print order {new_order.order_id} received from {current_user.name} for ₹{order_data.price}."
        )
        await db.db.notifications.insert_one(admin_notif.model_dump(by_alias=True, exclude_none=True))
    
    return PrintOrderResponse.from_mongo(created_order)

@router.get("/my-orders", response_model=list[PrintOrderResponse])
async def get_my_print_orders(current_user: UserModel = Depends(get_current_user)):
    cursor = db.db.print_orders.find({"user_id": str(current_user.id)}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    return [PrintOrderResponse.from_mongo(doc) for doc in orders]
