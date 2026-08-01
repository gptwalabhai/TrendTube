# TrendTube AI — Architectural System Design

## System Architecture Diagram

```
                             ┌───────────────────────────────────┐
                             │       Next.js 16 Frontend         │
                             │  React 19 + Tailwind v4 + Recharts│
                             └─────────────────┬─────────────────┘
                                               │ (REST / JSON)
                                               ▼
                             ┌───────────────────────────────────┐
                             │        FastAPI Python Engine      │
                             │   (App Router & Middleware API)   │
                             └─────────┬──────────────┬──────────┘
                                       │              │
                    ┌──────────────────┘              └──────────────────┐
                    ▼                                                    ▼
      ┌───────────────────────────┐                        ┌───────────────────────────┐
      │   PostgreSQL 16 Database  │                        │    Redis Caching Queue    │
      │ (Users, Videos, Analysis) │                        │ (Job Scheduler & Metrics) │
      └───────────────────────────┘                        └───────────────────────────┘
```

## Core Modules & Data Flow

1. **Trend Engine (`app.services.trend_engine`)**
   - Implements Virality Score, Trend Score, Outlier Score, Growth Velocity, and Engagement Rate.
   - Applies exponential half-life time decay curve against recency to prioritize fresh viral breakouts.

2. **AI Studio Engine (`app.services.ai_studio`)**
   - Synthesizes video scripts, hooks, SEO titles, and hashtags using LLM API integration with heuristic fallback fallback handlers.

3. **Social Media Metadata Scraper (`app.services.scrapers`)**
   - Parses public creator URLs (TikTok `@handle`, IG profile, YouTube channel) and builds video metric feeds.

4. **YouTube Publishing Scheduler (`app.services.youtube_publisher`)**
   - Manages OAuth tokens, schedule queues, thumbnail placement, upload retries, and status monitoring.
