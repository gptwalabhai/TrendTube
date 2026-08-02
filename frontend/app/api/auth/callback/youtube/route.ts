import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/accounts?error=' + encodeURIComponent(error), request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/accounts?error=no_code', request.url));
    }

    const clientId = process.env.YOUTUBE_CLIENT_ID || '';
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || '';
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || '';

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(new URL('/accounts?error=oauth_not_configured', request.url));
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Token exchange failed:', errText);
      return NextResponse.redirect(new URL('/accounts?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenRes.json();

    // Fetch user's YouTube channel info
    let channelName = 'YouTube Channel';
    let channelId = '';
    let channelHandle = '@youtube';
    let subscriberCount = 0;
    let channelAvatar = '';

    try {
      const ytRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        if (ytData.items && ytData.items.length > 0) {
          const channel = ytData.items[0];
          channelName = channel.snippet?.title || 'YouTube Channel';
          channelId = channel.id || '';
          channelHandle = channel.snippet?.customUrl || `@${channelName.replace(/\s/g, '')}`;
          subscriberCount = parseInt(channel.statistics?.subscriberCount || '0', 10);
          channelAvatar = channel.snippet?.thumbnails?.default?.url || '';
        }
      }
    } catch (e) {
      console.error('Failed to fetch channel info:', e);
    }

    // Store in Neon database (matching schema.sql OAuthAccounts columns)
    const databaseUrl = process.env.DATABASE_URL || '';
    if (databaseUrl) {
      try {
        const sql = neon(databaseUrl);
        const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();

        // First ensure a default user exists
        await sql`
          INSERT INTO "Users" (id, email, display_name, auth_provider, auth_provider_id, created_at, updated_at)
          VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'default@trendtube.ai', 'Default User', 'google', ${channelId}, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `;

        // Upsert OAuth account matching schema columns
        await sql`
          INSERT INTO "OAuthAccounts" (
            id, user_id, provider, account_handle, account_name, 
            provider_account_id, avatar_url, followers_count,
            encrypted_access_token, encrypted_refresh_token, 
            token_expires_at, is_connected, created_at, updated_at
          )
          VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000001'::uuid,
            'youtube',
            ${channelHandle},
            ${channelName},
            ${channelId},
            ${channelAvatar},
            ${subscriberCount},
            ${tokens.access_token},
            ${tokens.refresh_token || ''},
            ${expiresAt}::timestamptz,
            TRUE,
            NOW(),
            NOW()
          )
          ON CONFLICT (user_id, provider, account_handle) 
          DO UPDATE SET 
            account_name = ${channelName},
            encrypted_access_token = ${tokens.access_token},
            encrypted_refresh_token = COALESCE(NULLIF(${tokens.refresh_token || ''}, ''), "OAuthAccounts".encrypted_refresh_token),
            token_expires_at = ${expiresAt}::timestamptz,
            avatar_url = ${channelAvatar},
            followers_count = ${subscriberCount},
            is_connected = TRUE,
            updated_at = NOW()
        `;
      } catch (dbErr) {
        console.error('Database save failed (non-fatal):', dbErr);
      }
    }

    // Redirect to accounts page with success
    const successParams = new URLSearchParams({
      connected: 'youtube',
      channel: channelName,
      channelId: channelId,
      subscribers: String(subscriberCount),
      avatar: channelAvatar
    });

    return NextResponse.redirect(new URL(`/accounts?${successParams.toString()}`, request.url));

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/accounts?error=' + encodeURIComponent(error.message), request.url));
  }
}
