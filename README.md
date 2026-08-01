# TrendTube AI — Enterprise Viral Discovery & YouTube Publishing Engine

**TrendTube AI** is an enterprise-grade SaaS application designed to help short-form video creators discover viral public content (TikTok, Instagram, YouTube), analyze trend metrics using proprietary mathematical formulas, generate AI-powered hooks & scripts, organize research collections, and publish directly through official YouTube OAuth APIs.

---

## ⚡ Key Features

- **🔥 Trend Discovery Engine**: Analyze public creator profile & channel URLs. Calculates **Virality Score**, **Trend Score**, **Outlier Score**, **Growth Velocity**, and **Engagement Rate**.
- **🎯 Multi-Dimensional Filters**: Filter by Date Range (Today, 7D, 30D, 90D), Min Views, Min Likes, Min Engagement %, Category, Language, Country, and Platform.
- **🧠 AI Studio Workshop**: Generate high-CTR Titles, 3-Second Hooks, Full Scripts, CTAs, Hashtags, Keywords, and Video Ideas.
- **📁 Research Collections**: Organize saved video inspiration into custom folders with sticky notes, color tags, and search.
- **📺 Official YouTube Publishing**: Schedule Shorts uploads, edit titles/descriptions/tags, attach thumbnails, and monitor upload status.
- **📊 Channel Analytics**: Real-time trajectory charts for Views, Subscribers Gained, CTR, Watch Time, and Revenue Estimates.
- **🛡️ Executive Admin Panel**: User provisioning, subscription status, system health gauges, feature flags toggles, and systemic audit log stream.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons, Zustand, TanStack Query.
- **Backend**: FastAPI (Python 3.11+), Async SQLAlchemy ORM, Pydantic v2, Pytest, Uvicorn.
- **Database**: PostgreSQL 16 (`schema.sql` included with full indexing and UUIDs).
- **Cache & Queue**: Redis 7.
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD pipeline, Coolify deployment ready.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ & Python 3.11+

### Option A: Launch full stack with Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- FastAPI Backend & Swagger Docs: `http://localhost:8000/docs`

### Option B: Local Manual Run

#### 1. Backend Server
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000/dashboard`.

---

## 🧪 Testing

Run backend pytest suite:
```bash
cd backend
pytest tests/
```
