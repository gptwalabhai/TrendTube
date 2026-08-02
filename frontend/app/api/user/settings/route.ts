import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME, comparePassword, hashPassword, destroySession } from '@/lib/auth';
import { query } from '@/lib/db';

// GET export user data
export async function GET() {
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

    const searches = await query(`SELECT * FROM Searches WHERE user_id = $1 ORDER BY created_at DESC`, [user.id]);
    const uploads = await query(`SELECT * FROM UploadJobs WHERE user_id = $1 ORDER BY created_at DESC`, [user.id]);
    const creditHistory = await query(`SELECT * FROM CreditHistory WHERE user_id = $1 ORDER BY created_at DESC`, [user.id]);
    const playlists = await query(`SELECT * FROM Playlists WHERE user_id = $1 ORDER BY created_at DESC`, [user.id]);
    const youtubeAccounts = await query(`SELECT id, provider, channel_id, account_name, subscriber_count, is_connected FROM OAuthAccounts WHERE user_id = $1`, [user.id]);

    return NextResponse.json({
      export_date: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        created_at: user.created_at
      },
      searches: searches.rows,
      uploads: uploads.rows,
      creditHistory: creditHistory.rows,
      playlists: playlists.rows,
      connectedAccounts: youtubeAccounts.rows
    });
  } catch (err: any) {
    console.error('Export user data error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST change password
export async function POST(request: Request) {
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

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Verify current password
    const userRes = await query(`SELECT password_hash FROM Users WHERE id = $1`, [user.id]);
    const currentHash = userRes.rows[0]?.password_hash;

    if (!currentHash || !comparePassword(currentPassword, currentHash)) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    await query(`UPDATE Users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, user.id]);

    return NextResponse.json({ success: true, message: 'Password updated successfully!' });
  } catch (err: any) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE delete account
export async function DELETE() {
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

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admin account cannot be self-deleted' }, { status: 400 });
    }

    await destroySession(sessionToken);
    await query(`DELETE FROM Users WHERE id = $1`, [user.id]);

    const response = NextResponse.json({ success: true, message: 'Account deleted successfully' });
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (err: any) {
    console.error('Delete account error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
