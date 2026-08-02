import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME, hashPassword } from '@/lib/auth';
import { query } from '@/lib/db';
import { addCredits } from '@/lib/credits';

/**
 * Server-side Admin Verification Helper
 */
async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const user = await getSessionUser(sessionToken);
  if (!user || user.role !== 'admin') return null;
  return user;
}

// GET all platform users
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const usersRes = await query(
      `SELECT u.id, u.name, u.email, u.role, u.credits, u.subscription_plan, u.subscription_status, u.uploads_count, u.searches_count, u.is_banned, u.created_at,
              o.account_name as youtube_handle, o.is_connected as youtube_connected
       FROM Users u
       LEFT JOIN OAuthAccounts o ON u.id = o.user_id AND o.provider = 'youtube' AND o.is_connected = TRUE
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ users: usersRes.rows });
  } catch (err: any) {
    console.error('Admin Users API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST create user account manually from Admin Panel
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, credits, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query(`SELECT id FROM Users WHERE email = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const initialCredits = parseInt(credits) || 10000;
    const userRole = role === 'admin' ? 'admin' : 'user';

    const insertRes = await query(
      `INSERT INTO Users (name, email, password_hash, role, credits, subscription_plan, subscription_status)
       VALUES ($1, $2, $3, $4, $5, 'pro', 'active')
       RETURNING id, name, email, role, credits, created_at`,
      [name || cleanEmail.split('@')[0], cleanEmail, passwordHash, userRole, initialCredits]
    );

    const newUser = insertRes.rows[0];

    // Log admin action
    await query(
      `INSERT INTO AdminLogs (admin_id, action, details, target_user_id) VALUES ($1, 'create_user', $2, $3)`,
      [admin.id, `Created account ${cleanEmail} with ${initialCredits} credits`, newUser.id]
    );

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error('Admin Create User Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH update credits / ban status / reset password
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, amount, newPassword } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    if (action === 'add_credits') {
      const creditAmt = parseInt(amount) || 1000;
      await addCredits(userId, creditAmt, 'admin_add', `Granted by admin ${admin.email}`);
      await query(
        `INSERT INTO AdminLogs (admin_id, action, details, target_user_id) VALUES ($1, 'add_credits', $2, $3)`,
        [admin.id, `Added ${creditAmt} credits`, userId]
      );
      return NextResponse.json({ success: true, message: `Added ${creditAmt} credits` });
    }

    if (action === 'ban_user') {
      await query(`UPDATE Users SET is_banned = TRUE WHERE id = $1`, [userId]);
      await query(
        `INSERT INTO AdminLogs (admin_id, action, details, target_user_id) VALUES ($1, 'ban_user', 'Banned user', $2)`,
        [admin.id, userId]
      );
      return NextResponse.json({ success: true, message: 'User banned' });
    }

    if (action === 'unban_user') {
      await query(`UPDATE Users SET is_banned = FALSE WHERE id = $1`, [userId]);
      await query(
        `INSERT INTO AdminLogs (admin_id, action, details, target_user_id) VALUES ($1, 'unban_user', 'Unbanned user', $2)`,
        [admin.id, userId]
      );
      return NextResponse.json({ success: true, message: 'User unbanned' });
    }

    if (action === 'reset_password') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }
      const hash = hashPassword(newPassword);
      await query(`UPDATE Users SET password_hash = $1 WHERE id = $2`, [hash, userId]);
      await query(
        `INSERT INTO AdminLogs (admin_id, action, details, target_user_id) VALUES ($1, 'reset_password', 'Reset user password', $2)`,
        [admin.id, userId]
      );
      return NextResponse.json({ success: true, message: 'Password reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin PATCH User Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Prevent deleting admin account
    const targetRes = await query(`SELECT email FROM Users WHERE id = $1`, [userId]);
    if (targetRes.rows.length > 0 && targetRes.rows[0].email === admin.email) {
      return NextResponse.json({ error: 'Cannot delete primary admin account' }, { status: 400 });
    }

    await query(`DELETE FROM Users WHERE id = $1`, [userId]);
    await query(
      `INSERT INTO AdminLogs (admin_id, action, details, target_user_id) VALUES ($1, 'delete_user', 'Deleted user', $2)`,
      [admin.id, userId]
    );

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (err: any) {
    console.error('Admin DELETE User Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
