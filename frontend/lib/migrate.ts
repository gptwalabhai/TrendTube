import { query } from './db';

let isMigrated = false;

/**
 * Automatically applies SQL schema migrations to Neon PostgreSQL database
 * to ensure all columns (password_hash, credits, searches_count, etc.) exist.
 */
export async function runDatabaseMigrations() {
  if (isMigrated) return;

  try {
    console.log('[Database Migration] Running schema verification on Neon PostgreSQL...');

    // 1. Create UUID & Trgm Extensions
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Create Users Table if missing
    await query(`
      CREATE TABLE IF NOT EXISTS Users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Add missing columns to Users table safely
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS password_hash TEXT;`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS credits INT NOT NULL DEFAULT 10000;`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'pro';`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS uploads_count INT NOT NULL DEFAULT 0;`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS searches_count INT NOT NULL DEFAULT 0;`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE;`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;`);
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;`);

    // 4. Create Sessions Table
    await query(`
      CREATE TABLE IF NOT EXISTS Sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create OAuthAccounts Table
    await query(`
      CREATE TABLE IF NOT EXISTS OAuthAccounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL DEFAULT 'youtube',
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
    `);

    // 6. Create CreditHistory Table
    await query(`
      CREATE TABLE IF NOT EXISTS CreditHistory (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        amount INT NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create Searches Table
    await query(`
      CREATE TABLE IF NOT EXISTS Searches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        query TEXT NOT NULL,
        platform VARCHAR(50) DEFAULT 'tiktok',
        results_count INT DEFAULT 0,
        credits_deducted INT DEFAULT 500,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Create UploadJobs Table
    await query(`
      CREATE TABLE IF NOT EXISTS UploadJobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        video_id UUID,
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
    `);

    // 9. Create Playlists Table
    await query(`
      CREATE TABLE IF NOT EXISTS Playlists (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        videos_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Create PlaylistVideos Table
    await query(`
      CREATE TABLE IF NOT EXISTS PlaylistVideos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        playlist_id UUID NOT NULL REFERENCES Playlists(id) ON DELETE CASCADE,
        video_id VARCHAR(255) NOT NULL,
        video_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Create AdminLogs Table
    await query(`
      CREATE TABLE IF NOT EXISTS AdminLogs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        target_user_id UUID REFERENCES Users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. Create ErrorLogs Table
    await query(`
      CREATE TABLE IF NOT EXISTS ErrorLogs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES Users(id) ON DELETE SET NULL,
        endpoint VARCHAR(255) NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isMigrated = true;
    console.log('[Database Migration] Migration successfully completed on Neon PostgreSQL!');
  } catch (err) {
    console.error('[Database Migration Error]:', err);
  }
}
