import { query } from './db';

let isMigrated = false;

/**
 * Comprehensive Database Migration Engine for Neon PostgreSQL.
 * Ensures ALL tables and ALL columns exist so SQL queries never fail.
 */
export async function runDatabaseMigrations() {
  if (isMigrated) return;

  try {
    console.log('[DB Migration] Verifying all tables & columns on Neon PostgreSQL...');

    // 1. Extensions
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Users Table
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
    await query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);`);

    // 3. Sessions Table
    await query(`
      CREATE TABLE IF NOT EXISTS Sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. OAuthAccounts Table (All OAuth & YouTube channel fields)
    await query(`
      CREATE TABLE IF NOT EXISTS OAuthAccounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL DEFAULT 'youtube',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS channel_id VARCHAR(255);`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS account_handle VARCHAR(255);`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS provider_account_id VARCHAR(255);`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS followers_count BIGINT DEFAULT 0;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS subscriber_count BIGINT DEFAULT 0;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS total_views BIGINT DEFAULT 0;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS total_videos INT DEFAULT 0;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'US';`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS encrypted_access_token TEXT;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS encrypted_refresh_token TEXT;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;`);
    await query(`ALTER TABLE OAuthAccounts ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT TRUE;`);

    // 5. CreditHistory Table
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

    // 6. Searches Table
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

    // 7. UploadJobs Table
    await query(`
      CREATE TABLE IF NOT EXISTS UploadJobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        source_video_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS video_id UUID;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS target_youtube_account_id UUID REFERENCES OAuthAccounts(id) ON DELETE SET NULL;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'Pending';`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS custom_title TEXT;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS custom_description TEXT;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS custom_tags TEXT[] DEFAULT ARRAY[]::TEXT[];`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(255);`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS playlist_id UUID;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS execution_time_ms BIGINT DEFAULT 0;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS failure_reason TEXT;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;`);
    await query(`ALTER TABLE UploadJobs ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;`);

    // 8. Playlists Table
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

    // 9. PlaylistVideos Table
    await query(`
      CREATE TABLE IF NOT EXISTS PlaylistVideos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        playlist_id UUID NOT NULL REFERENCES Playlists(id) ON DELETE CASCADE,
        video_id VARCHAR(255) NOT NULL,
        video_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. AdminLogs Table
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

    // 11. ErrorLogs Table
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

    // 12. Subscriptions Table
    await query(`
      CREATE TABLE IF NOT EXISTS Subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
        plan VARCHAR(50) DEFAULT 'pro',
        status VARCHAR(50) DEFAULT 'active',
        current_period_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isMigrated = true;
    console.log('[DB Migration] All tables and columns verified & updated on Neon PostgreSQL!');
  } catch (err) {
    console.error('[DB Migration Error]:', err);
  }
}
