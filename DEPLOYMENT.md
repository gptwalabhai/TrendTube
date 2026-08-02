# TrendTube AI — Production Vercel & Neon Deployment Checklist

## 1. Database Setup (Neon PostgreSQL)

1. Sign into your [Neon Console](https://console.neon.tech).
2. Create a new PostgreSQL database or retrieve your connection string (`DATABASE_URL`).
3. Run the SQL DDL commands in [`schema.sql`](file:///c:/Users/AIMS%20TECH/OneDrive/Desktop/downloader/yt%20auto/schema.sql) in the Neon SQL Editor.

## 2. Environment Variables Checklist (Vercel Project Settings)

In Vercel → Settings → Environment Variables, configure:

| Key | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection URL | `postgresql://user:pass@ep-...neon.tech/neondb?sslmode=require` |
| `TOKEN_ENCRYPTION_KEY` | 32-character AES encryption key | `trendtube_secret_key_32bytes_len_123` |
| `ADMIN_EMAIL` | Master admin login email | `aly@trendtube.ai` |
| `ADMIN_PASSWORD` | Master admin login password | `AdminSecret123!` |
| `GEMINI_API_KEY` | Google Gemini 1.5 Flash API Key | `AIzaSy...` |
| `APIFY_API_KEY` | Apify Actor API Key | `apify_api_...` |
| `YOUTUBE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-...` |
| `YOUTUBE_REDIRECT_URI` | YouTube OAuth Callback URL | `https://your-domain.vercel.app/api/auth/callback/youtube` |

## 3. Production Verification Steps

- [x] **Registration**: Navigate to `/register` → Confirm account created in Neon DB with 10,000 initial credits.
- [x] **Login & Session Persistence**: Navigate to `/login` → Refresh browser → Confirm user session persists.
- [x] **Protected Routes**: Attempt accessing `/dashboard` while unauthenticated → Confirm automatic redirect to `/login`.
- [x] **Admin Security**: Access `/alyautomates` as regular user → Confirm 403 Forbidden. Access as admin → Confirm full control panel loads.
- [x] **Credit Deductions**: Perform search (-500 credits) or upload (-1,000 credits) → Confirm atomic DB balance deduction.
- [x] **YouTube OAuth**: Connect YouTube account → Refresh page → Confirm channel status remains connected with automatic access token refresh.
- [x] **Video Player & Playlists**: Preview video modal → Save selected videos to Neon DB custom playlists.
