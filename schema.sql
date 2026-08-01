-- TrendTube AI Production Neon PostgreSQL Schema
-- Serverless Schema for Next.js 16 + Cloudflare Workers + Cloudflare Queues

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'agency'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_customer_id VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'pro', -- 'starter', 'pro', 'enterprise'
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OAUTH ACCOUNTS TABLE (Google OAuth, YouTube OAuth, TikTok, IG)
CREATE TABLE IF NOT EXISTS OAuthAccounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'youtube', 'tiktok', 'instagram'
    account_handle VARCHAR(255) NOT NULL,
    account_name VARCHAR(255),
    provider_account_id VARCHAR(255),
    avatar_url TEXT,
    followers_count BIGINT DEFAULT 0,
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_connected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider, account_handle)
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS Projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    niche VARCHAR(100),
    target_country VARCHAR(10) DEFAULT 'US',
    target_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TIKTOK PROFILES TABLE
CREATE TABLE IF NOT EXISTS TikTokProfiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    handle VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(255),
    avatar_url TEXT,
    followers_count BIGINT DEFAULT 0,
    following_count BIGINT DEFAULT 0,
    total_videos INT DEFAULT 0,
    avg_views BIGINT DEFAULT 0,
    last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VIDEOS TABLE
CREATE TABLE IF NOT EXISTS Videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tiktok_profile_id UUID REFERENCES TikTokProfiles(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'tiktok',
    external_id VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    author_handle VARCHAR(255) NOT NULL,
    author_name VARCHAR(255),
    author_avatar TEXT,
    title TEXT,
    caption TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    duration_seconds INT DEFAULT 0,
    views_count BIGINT DEFAULT 0,
    likes_count BIGINT DEFAULT 0,
    comments_count BIGINT DEFAULT 0,
    shares_count BIGINT DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    country VARCHAR(10) DEFAULT 'US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, external_id)
);

-- TREND ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS TrendAnalysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES Videos(id) ON DELETE CASCADE UNIQUE,
    virality_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    outlier_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    growth_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    growth_velocity NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    seo_title TEXT,
    seo_description TEXT,
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    hook_analysis JSONB,
    audience_analysis JSONB,
    posting_time_recommendation JSONB,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS Collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES Projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#6366F1',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UPLOAD JOBS TABLE (9 States Machine processed by Cloudflare Workers)
CREATE TABLE IF NOT EXISTS UploadJobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES Videos(id) ON DELETE SET NULL,
    target_youtube_account_id UUID REFERENCES OAuthAccounts(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', 
    -- States: 'Pending', 'Queued', 'Downloading', 'Generating Metadata', 'Uploading', 'Completed', 'Failed', 'Retrying', 'Cancelled'
    custom_title TEXT,
    custom_description TEXT,
    custom_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    source_video_url TEXT NOT NULL,
    youtube_video_id VARCHAR(255),
    progress_percent INT DEFAULT 0,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    execution_time_ms BIGINT DEFAULT 0,
    failure_reason TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UPLOAD LOGS TABLE (Cloudflare Worker Audit Trail)
CREATE TABLE IF NOT EXISTS UploadLogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES UploadJobs(id) ON DELETE CASCADE,
    log_level VARCHAR(20) NOT NULL DEFAULT 'INFO', -- 'INFO', 'WARN', 'ERROR'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS Analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES OAuthAccounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views BIGINT DEFAULT 0,
    subscribers_gained INT DEFAULT 0,
    watch_time_minutes NUMERIC(12,2) DEFAULT 0.00,
    ctr NUMERIC(5,2) DEFAULT 0.00,
    estimated_revenue NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, date)
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS Notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'upload_status'
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS Settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE UNIQUE,
    default_youtube_channel_id VARCHAR(255),
    auto_generate_ai_metadata BOOLEAN DEFAULT TRUE,
    max_concurrent_jobs INT DEFAULT 5,
    notification_preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API KEYS TABLE
CREATE TABLE IF NOT EXISTS APIKeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix VARCHAR(10) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_upload_jobs_user_status ON UploadJobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_created ON UploadJobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_virality ON TrendAnalysis(virality_score DESC, outlier_score DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_profiles_handle ON TikTokProfiles(handle);
