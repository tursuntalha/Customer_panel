from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/crmind")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        from app.models import customer, order, note, user
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="CRMind API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_session():
    async with async_session() as session:
        yield session

from app.routes import customers, analytics, ai_churn, ai_sentiment, ai_email, auth, forecasting, reports

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(ai_churn.router, prefix="/api/ai", tags=["ai"])
app.include_router(ai_sentiment.router, prefix="/api/ai", tags=["ai"])
app.include_router(ai_email.router, prefix="/api/ai", tags=["ai"])
app.include_router(forecasting.router, prefix="/api/forecast", tags=["forecasting"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "CRMind API"}
