from fastapi import APIRouter
from app.api.routes import auth, books, admin, orders, users, wishlist, print_orders

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(books.router, prefix="/books", tags=["books"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(print_orders.router, prefix="/print-orders", tags=["print_orders"])
