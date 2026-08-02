import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME, decryptToken, encryptToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ accounts: [] }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ accounts: [] }, { status: 401 });
    }

    // Fetch user OAuth accounts from Neon DB
    const res = await query(
      `SELECT id, provider, channel_id, account_handle, account_name, avatar_url, subscriber_count, total_views, total_videos, encrypted_access_token, encrypted_refresh_token, token_expires_at, is_connected, updated_at
       FROM OAuthAccounts
       WHERE user_id = $1 AND is_connected = TRUE
       ORDER BY updated_at DESC`,
      [user.id]
    );

    const accounts = [];

    for (const acc of res.rows) {
      let isTokenValid = true;
      const expiresAt = acc.token_expires_at ? new Date(acc.token_expires_at).getTime() : 0;

      // Check if access token is expired (or about to expire in 5 mins)
      if (expiresAt && expiresAt < Date.now() + 5 * 60 * 1000) {
        const refreshToken = decryptToken(acc.encrypted_refresh_token);
        const clientId = process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

        if (refreshToken && clientId && clientSecret) {
          try {
            const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
              })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newEncryptedAccess = encryptToken(refreshData.access_token);
              const newExpiresAt = new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString();

              await query(
                `UPDATE OAuthAccounts SET encrypted_access_token = $1, token_expires_at = $2, updated_at = NOW() WHERE id = $3`,
                [newEncryptedAccess, newExpiresAt, acc.id]
              );
              console.log(`[YouTube OAuth] Successfully refreshed access token for channel ${acc.account_name}`);
            } else {
              isTokenValid = false;
            }
          } catch (e) {
            console.error('Token refresh exception:', e);
            isTokenValid = false;
          }
        }
      }

      accounts.push({
        id: acc.id,
        provider: acc.provider,
        channel_id: acc.channel_id,
        account_handle: acc.account_handle,
        account_name: acc.account_name,
        avatar_url: acc.avatar_url,
        subscriber_count: parseInt(acc.subscriber_count || '0'),
        total_views: parseInt(acc.total_views || '0'),
        total_videos: parseInt(acc.total_videos || '0'),
        is_connected: isTokenValid,
        updated_at: acc.updated_at
      });
    }

    return NextResponse.json({ accounts });
  } catch (err: any) {
    console.error('GET Accounts Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE disconnect account
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    await query(`UPDATE OAuthAccounts SET is_connected = FALSE WHERE id = $1 AND user_id = $2`, [accountId, user.id]);

    return NextResponse.json({ success: true, message: 'Account disconnected successfully' });
  } catch (err: any) {
    console.error('DELETE Account Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
