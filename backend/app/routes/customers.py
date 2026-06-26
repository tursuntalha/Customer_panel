from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.customer import Customer
from app.models.order import Order
from app.models.note import Note
from app.auth.auth_handler import get_current_user, require_role
from app.main import get_session

router = APIRouter()

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    company: Optional[str] = ""
    status: str = "active"

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/")
async def list_customers(session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(select(Customer).order_by(Customer.created_at.desc()))
    return result.scalars().all()

@router.get("/{customer_id}")
async def get_customer(customer_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    customer = await session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.get("/{customer_id}/orders")
async def get_customer_orders(customer_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(select(Order).where(Order.customer_id == customer_id).order_by(Order.order_date.desc()))
    return result.scalars().all()

@router.get("/{customer_id}/notes")
async def get_customer_notes(customer_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(select(Note).where(Note.customer_id == customer_id).order_by(Note.created_at.desc()))
    return result.scalars().all()

class NoteCreate(BaseModel):
    content: str

@router.post("/{customer_id}/notes")
async def create_note(customer_id: int, note_data: NoteCreate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    customer = await session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    note = Note(customer_id=customer_id, content=note_data.content, created_by=current_user.get("id"))
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return note

@router.delete("/notes/{note_id}")
async def delete_note(note_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    note = await session.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await session.delete(note)
    await session.commit()
    return {"message": "Note deleted"}

@router.post("/")
async def create_customer(customer_data: CustomerCreate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    existing = await session.execute(select(Customer).where(Customer.email == customer_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists")
    customer = Customer(**customer_data.model_dump())
    session.add(customer)
    await session.commit()
    await session.refresh(customer)
    return customer

@router.put("/{customer_id}")
async def update_customer(customer_id: int, customer_data: CustomerUpdate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    customer = await session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in customer_data.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)
    await session.commit()
    await session.refresh(customer)
    return customer

@router.delete("/{customer_id}")
async def delete_customer(customer_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    customer = await session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    await session.execute(delete(Order).where(Order.customer_id == customer_id))
    await session.execute(delete(Note).where(Note.customer_id == customer_id))
    await session.delete(customer)
    await session.commit()
    return {"message": "Customer deleted"}
