import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await getSessionUser(sessionToken);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // System overview metrics
    const totalUsers = await query(`SELECT COUNT(*) FROM Users`);
    const totalCredits = await query(`SELECT SUM(credits) FROM Users`);
    const totalSearches = await query(`SELECT COUNT(*) FROM Searches`);
    const totalUploads = await query(`SELECT COUNT(*) FROM UploadJobs`);
    const connectedChannels = await query(`SELECT COUNT(*) FROM OAuthAccounts WHERE provider = 'youtube' AND is_connected = TRUE`);

    // Search History log
    const searchHistory = await query(
      `SELECT s.id, s.query, s.platform, s.results_count, s.credits_deducted, s.created_at, u.email as user_email
       FROM Searches s
       JOIN Users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT 20`
    );

    // Upload History log
    const uploadHistory = await query(
      `SELECT j.id, j.status, j.custom_title, j.source_video_url, j.created_at, u.email as user_email
       FROM UploadJobs j
       JOIN Users u ON j.user_id = u.id
       ORDER BY j.created_at DESC LIMIT 20`
    );

    // Admin audit logs
    const adminLogs = await query(
      `SELECT a.id, a.action, a.details, a.created_at, u.email as admin_email
       FROM AdminLogs a
       JOIN Users u ON a.admin_id = u.id
       ORDER BY a.created_at DESC LIMIT 20`
    );

    // Error logs
    const errorLogs = await query(
      `SELECT id, endpoint, error_message, created_at FROM ErrorLogs ORDER BY created_at DESC LIMIT 20`
    );

    return NextResponse.json({
      stats: {
        totalUsers: parseInt(totalUsers.rows[0].count || '0'),
        totalCredits: parseInt(totalCredits.rows[0].sum || '0'),
        totalSearches: parseInt(totalSearches.rows[0].count || '0'),
        totalUploads: parseInt(totalUploads.rows[0].count || '0'),
        connectedChannels: parseInt(connectedChannels.rows[0].count || '0'),
        estimatedRevenue: (parseInt(totalUsers.rows[0].count || '0') * 49).toLocaleString()
      },
      searchHistory: searchHistory.rows,
      uploadHistory: uploadHistory.rows,
      adminLogs: adminLogs.rows,
      errorLogs: errorLogs.rows
    });
  } catch (err: any) {
    console.error('Admin Stats API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
