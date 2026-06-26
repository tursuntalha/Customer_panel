from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.models.user import User
from app.auth.auth_handler import get_password_hash, verify_password, create_access_token, get_current_user
from app.main import get_session

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "viewer"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_session)):
    existing = await session.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=req.name, email=req.email, hashed_password=get_password_hash(req.password), role=req.role)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@router.post("/login")
async def login(req: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user
