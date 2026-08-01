# TrendTube AI — Enterprise Viral Discovery & YouTube Publishing Engine

**TrendTube AI** is an enterprise-grade SaaS application designed to help short-form video creators discover viral public content (TikTok, Instagram, YouTube), analyze trend metrics using proprietary mathematical formulas, generate AI-powered hooks & scripts, organize research collections, and publish directly through official YouTube OAuth APIs.

---

## ⚡ Key Features

- **🔥 Trend Discovery Engine**: Analyze public creator profile & channel URLs. Calculates **Virality Score**, **Trend Score**, **Outlier Score**, **Growth Velocity**, and **Engagement Rate**.
- **🎯 Multi-Dimensional Filters**: Filter by Date Range (Today, 7D, 30D, 90D), Min Views, Min Likes, Min Engagement %, Category, Language, Country, and Platform.
- **🧠 AI Studio Workshop**: Generate high-CTR Titles, 3-Second Hooks, Full Scripts, CTAs, Hashtags, Keywords, and Video Ideas powered by Google Gemini 1.5 API.
- **📁 Research Collections**: Organize saved video inspiration into custom folders with sticky notes, color tags, and search.
- **📺 Official YouTube Publishing**: Schedule Shorts uploads, edit titles/descriptions/tags, attach thumbnails, and monitor upload status.
- **📊 Channel Analytics**: Real-time trajectory charts for Views, Subscribers Gained, CTR, Watch Time, and Revenue Estimates.
- **🛡️ Executive Admin Panel**: User provisioning, subscription status, system health gauges, feature flags toggles, and systemic audit log stream.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons, Zustand, TanStack Query.
- **Database**: Serverless Neon PostgreSQL (`schema.sql` included with full indexing and UUIDs).
- **Workers & Queues**: Cloudflare Queues & Workers (`workers/upload-processor`).
- **DevOps**: Vercel Serverless Hosting, Cloudflare Workers, GitHub Actions CI/CD pipeline.

---

## 🚀 Quick Start (Local Development)

### Option A: Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000/dashboard`.

### Option B: Python FastAPI Engine
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Navigate to `http://localhost:8000/docs`.

---

## 🧪 Testing

Run backend pytest suite:
```bash
cd backend
python -m pytest tests/
```
