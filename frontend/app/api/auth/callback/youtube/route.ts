import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME, encryptToken } from '@/lib/auth';
import { query } from '@/lib/db';

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

    // Get current authenticated user session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = sessionToken ? await getSessionUser(sessionToken) : null;

    if (!user) {
      return NextResponse.redirect(new URL('/login?from=/accounts', request.url));
    }

    const clientId = (process.env.YOUTUBE_CLIENT_ID || '').trim();
    const clientSecret = (process.env.YOUTUBE_CLIENT_SECRET || '').trim();
    const redirectUri = (process.env.YOUTUBE_REDIRECT_URI || '').trim();

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
    let totalViews = 0;
    let totalVideos = 0;
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
          totalViews = parseInt(channel.statistics?.viewCount || '0', 10);
          totalVideos = parseInt(channel.statistics?.videoCount || '0', 10);
          channelAvatar = channel.snippet?.thumbnails?.default?.url || '';
        }
      }
    } catch (e) {
      console.error('Failed to fetch YouTube channel info:', e);
    }

    const encryptedAccess = encryptToken(tokens.access_token);
    const encryptedRefresh = encryptToken(tokens.refresh_token || '');
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();

    // Upsert into OAuthAccounts table linked to real user
    await query(
      `INSERT INTO OAuthAccounts (
        user_id, provider, channel_id, account_handle, account_name,
        provider_account_id, avatar_url, subscriber_count, total_views, total_videos,
        encrypted_access_token, encrypted_refresh_token, token_expires_at, is_connected
      )
      VALUES ($1, 'youtube', $2, $3, $4, $2, $5, $6, $7, $8, $9, $10, $11, TRUE)
      ON CONFLICT (user_id, provider, account_handle)
      DO UPDATE SET
        channel_id = $2,
        account_name = $4,
        avatar_url = $5,
        subscriber_count = $6,
        total_views = $7,
        total_videos = $8,
        encrypted_access_token = $9,
        encrypted_refresh_token = CASE WHEN $10 != '' THEN $10 ELSE OAuthAccounts.encrypted_refresh_token END,
        token_expires_at = $11,
        is_connected = TRUE,
        updated_at = NOW()`,
      [
        user.id,
        channelId,
        channelHandle,
        channelName,
        channelAvatar,
        subscriberCount,
        totalViews,
        totalVideos,
        encryptedAccess,
        encryptedRefresh,
        expiresAt
      ]
    );

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
