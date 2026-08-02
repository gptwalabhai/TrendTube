import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME, ensureAdminUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await ensureAdminUser();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);

    if (!user) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Check connected YouTube account in DB
    const ytAccountRes = await query(
      `SELECT channel_id, account_handle, account_name, avatar_url, subscriber_count, total_views, total_videos, is_connected
       FROM OAuthAccounts
       WHERE user_id = $1 AND provider = 'youtube' AND is_connected = TRUE
       ORDER BY updated_at DESC LIMIT 1`,
      [user.id]
    );

    const connectedYouTube = ytAccountRes.rows.length > 0 ? ytAccountRes.rows[0] : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        subscription_plan: user.subscription_plan,
        subscription_status: user.subscription_status,
        uploads_count: user.uploads_count,
        searches_count: user.searches_count,
        created_at: user.created_at
      },
      youtubeAccount: connectedYouTube
    });
  } catch (err: any) {
    console.error('/api/auth/me Error:', err);
    return NextResponse.json({ user: null, error: err.message }, { status: 500 });
  }
}
