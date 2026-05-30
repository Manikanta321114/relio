from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.book import BookResponse
from app.models.user import UserModel
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

class WishlistToggleRequest(BaseModel):
    book_id: str

@router.post("/", status_code=status.HTTP_200_OK)
async def toggle_wishlist(payload: WishlistToggleRequest, current_user: UserModel = Depends(get_current_user)):
    book_id = payload.book_id
    try:
        obj_id = ObjectId(book_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Book ID")

    # Verify the book exists
    book = await db.db.books.find_one({"_id": obj_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    user_id = str(current_user.id)
    
    # Check if already wishlisted
    wishlist_item = await db.db.wishlist.find_one({"user_id": user_id, "book_id": book_id})
    
    if wishlist_item:
        # Unlike: Remove from wishlist and decrement count
        await db.db.wishlist.delete_one({"_id": wishlist_item["_id"]})
        await db.db.books.update_one({"_id": obj_id}, {"$inc": {"wishlist_count": -1}})
        
        # Get updated count
        updated_book = await db.db.books.find_one({"_id": obj_id})
        return {
            "liked": False,
            "wishlist_count": updated_book.get("wishlist_count", 0),
            "message": "Removed from wishlist"
        }
    else:
        # Like: Add to wishlist and increment count
        new_item = {
            "user_id": user_id,
            "book_id": book_id,
            "created_at": datetime.now(timezone.utc)
        }
        await db.db.wishlist.insert_one(new_item)
        await db.db.books.update_one({"_id": obj_id}, {"$inc": {"wishlist_count": 1}})
        
        # Get updated count
        updated_book = await db.db.books.find_one({"_id": obj_id})
        return {
            "liked": True,
            "wishlist_count": updated_book.get("wishlist_count", 0),
            "message": "Added to wishlist"
        }

@router.get("/", response_model=List[BookResponse])
async def get_wishlist(current_user: UserModel = Depends(get_current_user)):
    user_id = str(current_user.id)
    cursor = db.db.wishlist.find({"user_id": user_id})
    wishlist_items = await cursor.to_list(length=1000)
    
    if not wishlist_items:
        return []
        
    book_ids = [ObjectId(item["book_id"]) for item in wishlist_items]
    books_cursor = db.db.books.find({"_id": {"$in": book_ids}})
    books = await books_cursor.to_list(length=1000)
    
    return [BookResponse.from_mongo(b) for b in books]

@router.get("/ids", response_model=List[str])
async def get_wishlist_ids(current_user: UserModel = Depends(get_current_user)):
    user_id = str(current_user.id)
    cursor = db.db.wishlist.find({"user_id": user_id})
    wishlist_items = await cursor.to_list(length=1000)
    return [item["book_id"] for item in wishlist_items]

@router.delete("/clear", status_code=status.HTTP_200_OK)
async def clear_wishlist(current_user: UserModel = Depends(get_current_user)):
    user_id = str(current_user.id)
    
    # Find all items to adjust book counts before removing
    cursor = db.db.wishlist.find({"user_id": user_id})
    items = await cursor.to_list(length=1000)
    
    if items:
        book_ids = [ObjectId(item["book_id"]) for item in items]
        # Decrement wishlist_count by 1 for all these books
        await db.db.books.update_many({"_id": {"$in": book_ids}}, {"$inc": {"wishlist_count": -1}})
        # Delete from wishlist
        await db.db.wishlist.delete_many({"user_id": user_id})
        
    return {"message": "Wishlist cleared successfully"}
