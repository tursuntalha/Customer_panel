from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from app.models.customer import Customer
from app.models.order import Order
from app.models.note import Note
from app.auth.auth_handler import get_current_user
from app.main import get_session

router = APIRouter()

@router.get("/customer/{customer_id}")
async def generate_customer_report(customer_id: int, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    customer = await session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    orders_result = await session.execute(select(Order).where(Order.customer_id == customer_id).order_by(Order.order_date.desc()).limit(20))
    orders = orders_result.scalars().all()
    notes_result = await session.execute(select(Note).where(Note.customer_id == customer_id).order_by(Note.created_at.desc()).limit(10))
    notes = notes_result.scalars().all()

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Customer Report: {customer.name}", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Email: {customer.email}", styles["Normal"]))
    elements.append(Paragraph(f"Status: {customer.status}", styles["Normal"]))
    elements.append(Paragraph(f"Churn Risk: {customer.churn_label.upper()}", styles["Normal"]))
    elements.append(Paragraph(f"Total Revenue: ${customer.total_revenue:.2f}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    if orders:
        elements.append(Paragraph("Recent Orders", styles["Heading2"]))
        order_data = [["Date", "Product", "Amount", "Status"]]
        for o in orders:
            order_data.append([o.order_date.strftime("%Y-%m-%d") if o.order_date else "", o.product_name or "", f"${o.total_amount:.2f}", o.status])
        t = Table(order_data)
        t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.grey), ("TEXTCOLOR", (0,0), (-1,0), colors.whitesmoke), ("ALIGN", (0,0), (-1,-1), "CENTER"), ("GRID", (0,0), (-1,-1), 1, colors.black)]))
        elements.append(t)

    if notes:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Recent Notes", styles["Heading2"]))
        for n in notes:
            elements.append(Paragraph(f"<b>{n.created_at.strftime('%Y-%m-%d') if n.created_at else ''}</b>: {n.content[:200]}", styles["Normal"]))

    doc.build(elements)
    pdf = buf.getvalue()
    buf.close()
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=customer_{customer_id}_report.pdf"})
