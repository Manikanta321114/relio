from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.router import api_router
from app.api.routes import notifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Relio, a premium used-book marketplace.",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the exception details here or print
    print(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )

# Get frontend origins from settings or environment
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://relio-olive.vercel.app",
]

frontend_env = settings.FRONTEND_URL
if frontend_env:
    for url in frontend_env.split(","):
        clean_url = url.strip()
        if clean_url and clean_url not in origins:
            origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/api/debug")
async def debug_endpoint():
    from app.db.mongodb import db
    import certifi
    mongo_url = settings.MONGODB_URL or ""
    is_localhost = "localhost" in mongo_url or "127.0.0.1" in mongo_url
    db_status = "Not initialized"
    ping_result = "N/A"
    error_message = None
    
    if db.client:
        try:
            await db.client.admin.command('ping')
            db_status = "Connected"
            ping_result = "Success"
        except Exception as e:
            db_status = "Failed to ping"
            error_message = str(e)
    else:
        db_status = "No client"
        
    return {
        "is_localhost": is_localhost,
        "db_status": db_status,
        "ping_result": ping_result,
        "error_message": error_message,
        "database_name": settings.DATABASE_NAME,
        "has_mongo_url_env": bool(settings.MONGODB_URL),
        "version_tag": "468352f"
    }

@app.get("/")
async def root():
    return {"message": "Welcome to Relio API"}
