# TrendTube AI — Production Deployment Guide

This guide details how to deploy **TrendTube AI** to production using **Coolify**, **Docker Compose**, or a **VPS (Ubuntu/Debian)**.

---

## 🚀 Option 1: Deployment via Docker Compose (Recommended)

### Step 1: Clone Repository & Configure `.env`
```bash
git clone https://github.com/your-org/trendtube-ai.git
cd trendtube-ai
cp .env.example .env
```
Edit `.env` to set production passwords (`POSTGRES_PASSWORD`, `SECRET_KEY`, and optional API keys for OpenAI/YouTube/Stripe).

### Step 2: Start Multi-Container Stack
```bash
docker-compose up -d --build
```
This launches:
- **PostgreSQL 16** (Database automatically initialized using `schema.sql`)
- **Redis 7** (Caching & Job Queue)
- **FastAPI Engine** (Port 8000)
- **Next.js 16 Web App** (Port 3000)

### Step 3: Verify Services Health
```bash
docker-compose ps
```

---

## 🌐 Option 2: Deployment via Coolify / Dokku / CapRover

1. Connect your Git repository to **Coolify**.
2. Select **Docker Compose** as the build pack.
3. Set the compose path to `./docker-compose.yml`.
4. Add the environment variables from `.env.example` into Coolify's Environment Settings.
5. Click **Deploy**. Coolify will build both frontend & backend containers and automatically assign SSL certificates via Traefik.

---

## 🔒 Security & SSL Recommendations

- Point your domain DNS `A` records (`trendtube.ai` and `api.trendtube.ai`) to your VPS IP address.
- Use Caddy, Nginx, or Traefik with Let's Encrypt for automatic HTTPS/TLS termination.
- Set `SECRET_KEY` to a cryptographically strong 256-bit string.
