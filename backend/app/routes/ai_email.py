from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.models.customer import Customer
from app.llm.ollama_client import query_ollama
from app.auth.auth_handler import get_current_user
from app.main import get_session

router = APIRouter()

class EmailRequest(BaseModel):
    customer_id: int
    intent: str
    language: str = "Turkish"

EMAIL_PROMPT_TEMPLATE = """
Write a professional email in {language} to a customer named {customer_name}.
Intent: {intent}
Customer details: Last order was {days_ago} days ago, lifetime value is ${lifetime}, status is {status}.
Write the email body only, with a subject line starting with "Subject:".
Make it personalized and professional.
"""

@router.post("/generate-email")
async def generate_email(req: EmailRequest, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    customer = await session.get(Customer, req.customer_id)
    if not customer:
        return {"error": "Customer not found"}
    prompt = EMAIL_PROMPT_TEMPLATE.format(
        language=req.language,
        customer_name=customer.name,
        intent=req.intent,
        days_ago=customer.days_since_last_order or 30,
        lifetime=round(customer.lifetime_value or 0, 2),
        status=customer.status or "active"
    )
    result = await query_ollama(prompt)
    return {"email": result, "customer_name": customer.name}
