from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from app.models.user import UserModel, ProfileUpdate, PasswordUpdate
from app.models.order import ShippingAddress
from app.core.security import verify_password, get_password_hash
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Dict, Any

router = APIRouter()

@router.get("/profile-data")
async def get_profile_data(current_user: UserModel = Depends(get_current_user)):
    # Fetch user details
    user = await db.db.users.find_one({"_id": ObjectId(str(current_user.id))})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Stats: Books Uploaded, Orders Placed, Orders Delivered
    books_uploaded = await db.db.books.count_documents({"seller_id": str(current_user.id)})
    orders_placed = await db.db.orders.count_documents({"buyer_id": str(current_user.id)})
    orders_delivered = await db.db.orders.count_documents({"buyer_id": str(current_user.id), "status": "Delivered"})
    
    # Extract notification settings (or default if not present)
    notification_settings = user.get("notification_settings", {
        "order_updates": True,
        "delivery_updates": True,
        "email_notifications": True
    })

    # Extract addresses list
    addresses = user.get("addresses", [])
    
    return {
        "profile": {
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone")
        },
        "stats": {
            "books_uploaded": books_uploaded,
            "orders_placed": orders_placed,
            "orders_delivered": orders_delivered
        },
        "notification_settings": notification_settings,
        "addresses": addresses
    }

@router.put("/profile")
async def update_profile(payload: ProfileUpdate, current_user: UserModel = Depends(get_current_user)):
    result = await db.db.users.update_one(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": {
            "name": payload.name,
            "email": payload.email,
            "phone": payload.phone,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Profile updated successfully"}

@router.put("/change-password")
async def change_password(payload: PasswordUpdate, current_user: UserModel = Depends(get_current_user)):
    user = await db.db.users.find_one({"_id": ObjectId(str(current_user.id))})
    if not user or not verify_password(payload.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    hashed_password = get_password_hash(payload.new_password)
    await db.db.users.update_one(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": {
            "password_hash": hashed_password,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Password updated successfully"}

# Address CRUD
@router.post("/addresses")
async def add_address(address: ShippingAddress, current_user: UserModel = Depends(get_current_user)):
    user = await db.db.users.find_one({"_id": ObjectId(str(current_user.id))})
    addresses = user.get("addresses", [])
    
    address_dict = address.model_dump()
    address_dict["id"] = str(ObjectId()) # Generate unique ID for front-end tracking
    addresses.append(address_dict)
    
    await db.db.users.update_one(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": {"addresses": addresses, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Address added successfully", "addresses": addresses}

@router.put("/addresses/{address_id}")
async def edit_address(address_id: str, address: ShippingAddress, current_user: UserModel = Depends(get_current_user)):
    user = await db.db.users.find_one({"_id": ObjectId(str(current_user.id))})
    addresses = user.get("addresses", [])
    
    updated = False
    for i, addr in enumerate(addresses):
        if addr.get("id") == address_id:
            address_dict = address.model_dump()
            address_dict["id"] = address_id
            addresses[i] = address_dict
            updated = True
            break
            
    if not updated:
        raise HTTPException(status_code=404, detail="Address not found")
        
    await db.db.users.update_one(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": {"addresses": addresses, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Address updated successfully", "addresses": addresses}

@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, current_user: UserModel = Depends(get_current_user)):
    user = await db.db.users.find_one({"_id": ObjectId(str(current_user.id))})
    addresses = user.get("addresses", [])
    
    filtered_addresses = [addr for addr in addresses if addr.get("id") != address_id]
    if len(filtered_addresses) == len(addresses):
        raise HTTPException(status_code=404, detail="Address not found")
        
    await db.db.users.update_one(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": {"addresses": filtered_addresses, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Address deleted successfully", "addresses": filtered_addresses}

@router.put("/notification-settings")
async def update_notification_settings(settings: Dict[str, bool], current_user: UserModel = Depends(get_current_user)):
    await db.db.users.update_one(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": {
            "notification_settings": {
                "order_updates": settings.get("order_updates", True),
                "delivery_updates": settings.get("delivery_updates", True),
                "email_notifications": settings.get("email_notifications", True)
            },
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Notification settings updated"}
