from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.book import BookCreate, BookResponse, BookModel
from app.models.user import UserModel
from app.db.mongodb import db
from app.api.dependencies import get_current_user
from datetime import datetime, timezone
import pymongo

router = APIRouter()

# The indexes are created during application startup or lazily
async def create_books_indexes():
    await db.db.books.create_index([("category", pymongo.ASCENDING)])
    await db.db.books.create_index([("subcategory", pymongo.ASCENDING)])
    await db.db.books.create_index([("status", pymongo.ASCENDING)])
    await db.db.books.create_index([("created_at", pymongo.DESCENDING)])
    await db.db.books.create_index([("seller_id", pymongo.ASCENDING)])

@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(book_in: BookCreate, current_user: UserModel = Depends(get_current_user)):
    # Ensure indexes exist (safe to call multiple times)
    await create_books_indexes()
    
    book_dict = book_in.model_dump()
    book_dict["seller_id"] = str(current_user.id)
    book_dict["seller_price"] = book_dict.get("price", 0.0)
    book_dict["admin_price"] = book_dict.get("price", 0.0)
    book_dict["status"] = "pending" # Force default status
    book_dict["created_at"] = datetime.now(timezone.utc)
    book_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.db.books.insert_one(book_dict)
    created_book = await db.db.books.find_one({"_id": result.inserted_id})
    return BookResponse.from_mongo(created_book)

@router.get("/my-uploads", response_model=List[BookResponse])
async def get_my_uploads(current_user: UserModel = Depends(get_current_user)):
    cursor = db.db.books.find({"seller_id": str(current_user.id)}).sort("created_at", pymongo.DESCENDING)
    books = await cursor.to_list(length=100)
    return [BookResponse.from_mongo(book) for book in books]

from typing import Optional

@router.get("/", response_model=dict)
async def get_books(
    search: Optional[str] = None,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    condition: Optional[str] = None,
    sort: Optional[str] = "newest",
    page: int = 1,
    limit: int = 12
):
    query = {"status": "approved"}
    
    if search:
        query["title"] = {"$regex": search.strip(), "$options": "i"}
    
    if category:
        import re
        query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
        
    if subcategory:
        import re
        query["subcategory"] = {"$regex": f"^{re.escape(subcategory)}$", "$options": "i"}
        
    if condition:
        import re
        query["condition"] = {"$regex": f"^{re.escape(condition)}$", "$options": "i"}
        
    sort_options = [("created_at", pymongo.DESCENDING)]
    if sort == "oldest":
        sort_options = [("created_at", pymongo.ASCENDING)]
    elif sort == "low_to_high":
        sort_options = [("price", pymongo.ASCENDING)]
    elif sort == "high_to_low":
        sort_options = [("price", pymongo.DESCENDING)]
        
    skip = (page - 1) * limit
    
    cursor = db.db.books.find(query).sort(sort_options).skip(skip).limit(limit)
    books = await cursor.to_list(length=limit)
    total_count = await db.db.books.count_documents(query)
    
    return {
        "books": [BookResponse.from_mongo(book).model_dump() for book in books],
        "total": total_count,
        "page": page,
        "limit": limit
    }

from bson.errors import InvalidId

@router.get("/{id}", response_model=BookResponse)
async def get_book_by_id(id: str):
    try:
        from bson import ObjectId
        obj_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Book ID")
        
    book = await db.db.books.find_one({"_id": obj_id, "status": {"$in": ["approved", "sold"]}})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    return BookResponse.from_mongo(book)

@router.post("/{id}/share", status_code=status.HTTP_200_OK)
async def increment_share_count(id: str):
    try:
        from bson import ObjectId
        obj_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Book ID")
        
    # Increment share count in DB
    result = await db.db.books.update_one({"_id": obj_id}, {"$inc": {"share_count": 1}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
        
    # Get updated count
    updated_book = await db.db.books.find_one({"_id": obj_id})
    return {
        "share_count": updated_book.get("share_count", 0),
        "message": "Share count incremented successfully"
    }
