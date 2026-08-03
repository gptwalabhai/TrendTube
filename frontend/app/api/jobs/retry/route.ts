import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { runDatabaseMigrations } from '@/lib/migrate';
import { processQueuedJobs } from '@/lib/jobs';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await runDatabaseMigrations();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID required' }, { status: 400 });
    }

    // Reset job to Queued with fresh retry count
    await query(
      `UPDATE UploadJobs
       SET status = 'Queued', progress_percent = 10, failure_reason = NULL,
           retry_count = 0, updated_at = NOW() - INTERVAL '31 minutes'
       WHERE id = $1 AND user_id = $2`,
      [jobId, user.id]
    );

    // Immediately trigger job processor
    await processQueuedJobs();

    return NextResponse.json({ success: true, message: 'Upload job re-queued for processing' });
  } catch (err: any) {
    console.error('Retry Job API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
