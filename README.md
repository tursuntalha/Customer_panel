# CRMind — AI-Powered Customer Intelligence Platform

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> **"Müşteriyi anlamak için tahmin gücü."**

A customer relationship management platform where AI doesn't just store data — it **predicts**, **interprets**, and **acts**. Know which customers are about to leave before they do. Understand sentiment in every interaction. Draft personalized emails in seconds.

---

## The Problem

Traditional CRM systems are passive databases. They record what happened, but they don't tell you:
- Which customers are likely to churn in the next 30 days?
- Is this customer satisfied, frustrated, or indifferent?
- What should you say to win back a customer who hasn't ordered in 3 months?

Sales teams spend hours analyzing data that a trained model could process in milliseconds.

---

## AI Features

| Feature | How AI Is Used | Technology |
|---------|---------------|-----------|
| **Churn Prediction** | ML model scores each customer's churn probability daily | Scikit-learn (Random Forest or XGBoost) |
| **Sentiment Analysis** | Every customer note → LLM rates sentiment + generates summary | Ollama (`qwen2.5:7b`) |
| **AI Email Drafter** | Select customer + intent → LLM drafts personalized email | Ollama |
| **Revenue Forecasting** | Time-series model predicts next 30 days of revenue | Prophet / SARIMA |
| **Anomaly Alerts** | Detects unusual order patterns (sudden drop, spike) | Isolation Forest |

---

## Churn Prediction Model

The churn model is trained on the RFM (Recency, Frequency, Monetary) framework extended with complaint history:

| Feature | Description |
|---------|-------------|
| `days_since_last_order` | Recency — how recently did they order? |
| `order_count_90d` | Frequency — how many orders in the last 90 days? |
| `total_revenue_lifetime` | Monetary — lifetime value |
| `complaint_count` | How many complaints filed? |
| `avg_order_value` | Average basket size |
| `days_since_registration` | Account age |

Output: `churn_probability` (0.0–1.0), updated nightly for every active customer.

---

## Sentiment Analysis Flow

```
Customer Note / Complaint Text
             │
             ▼
    ┌─────────────────────┐
    │   Ollama LLM        │
    │   qwen2.5:7b        │
    │                     │
    │  Prompt:            │
    │  "Analyze sentiment │
    │   of this customer  │
    │   interaction..."   │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │   Structured Output │
    │   score: -1.0→+1.0  │
    │   label: positive / │
    │          neutral /  │
    │          negative   │
    │   summary: 1 line   │
    └─────────────────────┘
```

**Example:**
```
Input: "Siparişim 2 hafta gecikti, müşteri hizmetleri de ilgilenmedi."

Output:
  score: -0.82
  label: negative
  summary: "Customer frustrated by 2-week delivery delay and
            unresponsive support."
```

---

## Dashboard Overview

```
┌────────────────────────────────────────────────────────────┐
│  CRMind Dashboard                                          │
├────────────────┬───────────────────────────────────────────┤
│  KPIs          │  Churn Risk Distribution                  │
│  ─ Total: 2841 │  ████████░░ High Risk:    142 (5%)        │
│  ─ Active: 2611│  ██████████ Medium Risk:  387 (14%)       │
│  ─ At Risk: 230│  ██████████ Low Risk:    2312 (81%)       │
│  ─ Revenue: ₺… │                                           │
├────────────────┴───────────────────────────────────────────┤
│  Sentiment Heatmap (last 30 days)                          │
│  Week 1: ████████░░ 82% positive                          │
│  Week 2: ██████░░░░ 64% positive  ← complaint spike        │
│  Week 3: █████████░ 88% positive                          │
│  Week 4: ████████░░ 81% positive                          │
└────────────────────────────────────────────────────────────┘
```

---

## Architecture

```
┌──────────────────┐       ┌──────────────────────────────┐
│  React Frontend  │       │  FastAPI Backend              │
│  Tailwind CSS    │◄─────►│  Python 3.11                 │
│  Chart.js        │  REST │  SQLAlchemy + PostgreSQL      │
│  JWT auth        │       │                              │
└──────────────────┘       │  ┌──────────┐ ┌───────────┐  │
                           │  │ Churn ML │ │  Ollama   │  │
                           │  │ Scikit   │ │  LLM      │  │
                           │  └──────────┘ └───────────┘  │
                           └──────────────────────────────┘
```

---

## Features

- **Customer CRUD** — full customer profile with order history, notes, tags
- **Churn Risk Score** — color-coded badge per customer (🔴 High / 🟡 Medium / 🟢 Low)
- **Sentiment Timeline** — per-customer sentiment history chart
- **AI Email Drafter** — choose customer + intent → LLM drafts email in Turkish or English
- **Revenue Forecasting** — 30-day forecast chart on dashboard
- **Anomaly Alerts** — highlights customers with sudden behavioral changes
- **Role-Based Auth** — Admin / Sales / Viewer access levels
- **PDF Reports** — export customer profile or weekly summary

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Chart.js, JWT |
| Backend | FastAPI (Python), Uvicorn |
| Database | PostgreSQL + SQLAlchemy ORM |
| ML — Churn | Scikit-learn (Random Forest, trained offline, served via FastAPI) |
| ML — Anomaly | Isolation Forest |
| LLM | Ollama — `qwen2.5:7b` (sentiment + email drafting) |
| Forecasting | Prophet |
| Containerization | Docker + docker-compose |

---

## Project Structure

```
Customer_panel/
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Customers, CustomerDetail, Emails
│   │   ├── components/      # ChurnBadge, SentimentChart, EmailComposer
│   │   └── services/        # api.ts (FastAPI client)
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models/          # SQLAlchemy models (Customer, Order, Note)
│   │   ├── routes/          # /customers, /analytics, /ai
│   │   ├── ml/
│   │   │   ├── churn.py     # Churn model training + inference
│   │   │   └── anomaly.py   # Isolation Forest
│   │   └── llm/
│   │       ├── sentiment.py # Ollama sentiment analysis
│   │       └── email.py     # Ollama email drafting
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## Roadmap

### Phase 1 — Core CRM
- [ ] PostgreSQL schema: Customer, Order, Note, User
- [ ] FastAPI CRUD endpoints for customers + orders
- [ ] JWT auth with role-based access (admin / sales / viewer)
- [ ] React frontend: customer list + detail page
- [ ] Customer notes (add, edit, delete)

### Phase 2 — Dashboard + Analytics
- [ ] KPI cards (total customers, active, at-risk, revenue)
- [ ] Revenue chart (monthly, Chart.js)
- [ ] Customer activity heatmap
- [ ] Top customers by revenue table

### Phase 3 — Churn Prediction Model
- [ ] Generate synthetic training data (RFM features)
- [ ] Train Random Forest classifier (Scikit-learn)
- [ ] FastAPI endpoint: `/customers/{id}/churn-score`
- [ ] Display churn badge on customer cards
- [ ] Nightly batch update (cron job)

### Phase 4 — Sentiment Analysis + AI Email Drafter
- [ ] Ollama integration endpoint
- [ ] Auto-analyze sentiment on new notes
- [ ] Sentiment timeline chart per customer
- [ ] Email Composer: customer select + intent select → LLM draft
- [ ] Copy-to-clipboard + edit before sending

### Phase 5 — Forecasting + PDF + Docker
- [ ] Prophet revenue forecast (30-day)
- [ ] Anomaly detection alerts (Isolation Forest)
- [ ] PDF report generation (customer profile + weekly summary)
- [ ] Docker + docker-compose for full stack
- [ ] `.env`-based configuration

---

## Getting Started

```bash
# Prerequisites: Docker, Ollama

ollama pull qwen2.5:7b

git clone https://github.com/tursuntalha/Customer_panel.git
cd Customer_panel

docker-compose up --build
```

Frontend: http://localhost:3000 · Backend API: http://localhost:8000/docs

---

> Built by [Talha Tursun](https://github.com/tursuntalha) · CRM that thinks ahead.
