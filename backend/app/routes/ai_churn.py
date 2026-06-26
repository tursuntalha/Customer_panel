from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.customer import Customer
from app.ml.churn import predict_churn, get_churn_label
from app.auth.auth_handler import get_current_user
from app.main import get_session

router = APIRouter()

@router.get("/churn-score/{customer_id}")
async def get_churn_score(customer_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    customer = await session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    features = [
        customer.days_since_last_order or 999,
        customer.order_count or 0,
        customer.lifetime_value or 0,
        customer.complaint_count or 0,
        customer.avg_order_value or 0,
        customer.days_since_registration or 0
    ]
    probability = predict_churn(features)
    label = get_churn_label(probability)
    customer.churn_probability = probability
    customer.churn_label = label
    await session.commit()
    return {"churn_probability": probability, "churn_label": label}

@router.post("/batch-update-churn")
async def batch_update_churn(session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(select(Customer))
    customers = result.scalars().all()
    for c in customers:
        features = [c.days_since_last_order or 999, c.order_count or 0, c.lifetime_value or 0, c.complaint_count or 0, c.avg_order_value or 0, c.days_since_registration or 0]
        prob = predict_churn(features)
        c.churn_probability = prob
        c.churn_label = get_churn_label(prob)
    await session.commit()
    return {"message": f"Updated {len(customers)} customers", "count": len(customers)}
