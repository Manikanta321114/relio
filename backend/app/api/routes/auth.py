from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserLogin, UserResponse, UserModel
from app.db.mongodb import db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.dependencies import get_current_user
from datetime import timedelta, datetime, timezone
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    existing_user = await db.db.users.find_one({"$or": [{"email": user_in.email}, {"phone": user_in.phone}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")
    
    hashed_password = get_password_hash(user_in.password)
    user_dict = user_in.model_dump(exclude={"password"})
    user_dict["password_hash"] = hashed_password
    user_dict["role"] = "user"
    user_dict["created_at"] = datetime.now(timezone.utc)
    user_dict["updated_at"] = datetime.now(timezone.utc)
    
    count = await db.db.users.count_documents({})
    if count == 0:
        user_dict["role"] = "admin"
        
    result = await db.db.users.insert_one(user_dict)
    created_user = await db.db.users.find_one({"_id": result.inserted_id})
    return UserResponse.from_mongo(created_user)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse.from_mongo(user).model_dump()}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role,
        address=current_user.address
    )
