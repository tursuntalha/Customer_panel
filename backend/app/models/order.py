from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.main import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product_name = Column(String(255))
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    status = Column(String(50), default="completed")
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
