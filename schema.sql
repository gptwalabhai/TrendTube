-- TrendTube AI Enterprise Production Neon PostgreSQL Schema
-- Serverless Schema for Next.js 16 + Neon PostgreSQL + Cloudflare Workers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash TEXT,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'user'
    credits INT NOT NULL DEFAULT 10000,
    subscription_plan VARCHAR(50) DEFAULT 'pro', -- 'starter', 'pro', 'enterprise'
    subscription_status VARCHAR(50) DEFAULT 'active',
    uploads_count INT NOT NULL DEFAULT 0,
    searches_count INT NOT NULL DEFAULT 0,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SESSIONS TABLE
CREATE TABLE IF NOT EXISTS Sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OAUTH ACCOUNTS / YOUTUBE CHANNELS TABLE
CREATE TABLE IF NOT EXISTS OAuthAccounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'youtube', -- 'youtube', 'google', 'tiktok', 'instagram'
    channel_id VARCHAR(255),
    account_handle VARCHAR(255),
    account_name VARCHAR(255),
    provider_account_id VARCHAR(255),
    avatar_url TEXT,
    followers_count BIGINT DEFAULT 0,
    subscriber_count BIGINT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    total_videos INT DEFAULT 0,
    country VARCHAR(10) DEFAULT 'US',
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_connected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CREDIT HISTORY TABLE
CREATE TABLE IF NOT EXISTS CreditHistory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'signup_bonus', 'search_deduction', 'upload_deduction', 'admin_add', 'admin_deduct'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEARCHES TABLE
CREATE TABLE IF NOT EXISTS Searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    platform VARCHAR(50) DEFAULT 'tiktok',
    results_count INT DEFAULT 0,
    credits_deducted INT DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- UPLOAD JOBS TABLE
CREATE TABLE IF NOT EXISTS UploadJobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES Videos(id) ON DELETE SET NULL,
    target_youtube_account_id UUID REFERENCES OAuthAccounts(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', 
    custom_title TEXT,
    custom_description TEXT,
    custom_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    source_video_url TEXT NOT NULL,
    youtube_video_id VARCHAR(255),
    thumbnail_url TEXT,
    playlist_id UUID,
    visibility VARCHAR(20) DEFAULT 'public',
    progress_percent INT DEFAULT 0,
    execution_time_ms BIGINT DEFAULT 0,
    failure_reason TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PLAYLISTS TABLE
CREATE TABLE IF NOT EXISTS Playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    videos_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PLAYLIST VIDEOS TABLE
CREATE TABLE IF NOT EXISTS PlaylistVideos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES Playlists(id) ON DELETE CASCADE,
    video_id VARCHAR(255) NOT NULL,
    video_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS AdminLogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    target_user_id UUID REFERENCES Users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ERROR LOGS TABLE
CREATE TABLE IF NOT EXISTS ErrorLogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS Subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    plan VARCHAR(50) DEFAULT 'pro',
    status VARCHAR(50) DEFAULT 'active',
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON Sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_credit_history_user ON CreditHistory(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_user_status ON UploadJobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON Playlists(user_id);
