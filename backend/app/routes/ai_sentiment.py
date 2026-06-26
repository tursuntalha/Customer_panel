from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.models.note import Note
from app.models.customer import Customer
from app.llm.ollama_client import query_ollama
from app.auth.auth_handler import get_current_user
from app.main import get_session
import json

router = APIRouter()

SENTIMENT_PROMPT = """
Analyze the sentiment of this customer note. Return ONLY a JSON object:
{"score": -1.0 to 1.0, "label": "positive" or "neutral" or "negative", "summary": "one line summary in English"}
Note: """

@router.post("/analyze-sentiment/{note_id}")
async def analyze_sentiment(note_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    note = await session.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    raw = await query_ollama(SENTIMENT_PROMPT + note.content)
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        result = {"score": 0, "label": "neutral", "summary": "Could not analyze"}
    note.sentiment_score = result.get("score", 0)
    note.sentiment_label = result.get("label", "neutral")
    note.sentiment_summary = result.get("summary", "")
    await session.commit()
    customer = await session.get(Customer, note.customer_id)
    if customer:
        customer.sentiment_score = note.sentiment_score
        await session.commit()
    return result

@router.get("/sentiment-timeline/{customer_id}")
async def get_sentiment_timeline(customer_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.execute(
        select(Note).where(Note.customer_id == customer_id)
        .order_by(Note.created_at)
    )
    notes = result.scalars().all()
    return [{"date": n.created_at.isoformat() if n.created_at else "", "score": n.sentiment_score, "label": n.sentiment_label, "summary": n.sentiment_summary} for n in notes]
