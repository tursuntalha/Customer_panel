from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.models.customer import Customer
from app.models.order import Order
from app.models.note import Note
from app.auth.auth_handler import get_current_user
from app.main import get_session
from collections import defaultdict

router = APIRouter()

@router.get("/kpi")
async def get_kpis(session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    total = await session.execute(select(func.count(Customer.id)))
    total_customers = total.scalar() or 0

    active = await session.execute(select(func.count(Customer.id)).where(Customer.is_active == True))
    active_customers = active.scalar() or 0

    at_risk = await session.execute(select(func.count(Customer.id)).where(Customer.churn_label == "high"))
    at_risk_customers = at_risk.scalar() or 0

    revenue = await session.execute(select(func.coalesce(func.sum(Order.total_amount), 0)))
    total_revenue = revenue.scalar() or 0.0

    return {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "at_risk_customers": at_risk_customers,
        "total_revenue": total_revenue
    }

@router.get("/revenue-chart")
async def get_revenue_chart(session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    six_months_ago = datetime.now() - timedelta(days=180)
    result = await session.execute(
        select(Order.order_date, Order.total_amount)
        .where(Order.order_date >= six_months_ago)
        .order_by(Order.order_date)
    )
    monthly = defaultdict(float)
    for row in result:
        month_key = row.order_date.strftime("%Y-%m")
        monthly[month_key] += row.total_amount
    return {"labels": sorted(monthly.keys()), "values": [monthly[k] for k in sorted(monthly.keys())]}

@router.get("/heatmap")
async def get_heatmap(session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(
        select(Order.order_date, func.count(Order.id))
        .group_by(Order.order_date)
        .order_by(Order.order_date)
    )
    data = {}
    for row in result:
        key = row.order_date.strftime("%Y-%m-%d") if row.order_date else "unknown"
        data[key] = row[1]
    return data

@router.get("/top-customers")
async def get_top_customers(session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(
        select(Customer).order_by(Customer.total_revenue.desc()).limit(10)
    )
    return result.scalars().all()
