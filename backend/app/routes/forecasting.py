from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from prophet import Prophet
from app.models.order import Order
from app.auth.auth_handler import get_current_user
from app.main import get_session
from app.ml.anomaly import detect_anomaly

router = APIRouter()

@router.get("/revenue")
async def forecast_revenue(session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(select(Order.order_date, Order.total_amount).order_by(Order.order_date))
    rows = result.all()
    if len(rows) < 7:
        return {"error": "Not enough data for forecasting"}
    df = pd.DataFrame(rows, columns=["ds", "y"])
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.groupby("ds").sum().reset_index()
    model = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=False)
    model.fit(df)
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    last_30 = forecast.tail(30)
    return {
        "forecast_dates": last_30["ds"].dt.strftime("%Y-%m-%d").tolist(),
        "forecast_values": last_30["yhat"].round(2).tolist(),
        "lower_bound": last_30["yhat_lower"].round(2).tolist(),
        "upper_bound": last_30["yhat_upper"].round(2).tolist()
    }

@router.post("/detect-anomaly")
async def check_anomaly(features: list, current_user: dict = Depends(get_current_user)):
    if len(features) != 4:
        features = [0, 0, 0, 0]
    return detect_anomaly(features)
