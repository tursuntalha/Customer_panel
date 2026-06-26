from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.main import Base

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50))
    company = Column(String(255))
    status = Column(String(50), default="active")
    total_revenue = Column(Float, default=0.0)
    order_count = Column(Integer, default=0)
    last_order_date = Column(DateTime, nullable=True)
    days_since_last_order = Column(Integer, default=999)
    avg_order_value = Column(Float, default=0.0)
    lifetime_value = Column(Float, default=0.0)
    complaint_count = Column(Integer, default=0)
    days_since_registration = Column(Integer, default=0)
    churn_probability = Column(Float, default=0.0)
    churn_label = Column(String(20), default="low")
    sentiment_score = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
