import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { runDatabaseMigrations } from '@/lib/migrate';
import { processQueuedJobs } from '@/lib/jobs';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await runDatabaseMigrations();
    await processQueuedJobs();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ jobs: [] }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ jobs: [] }, { status: 401 });
    }

    // Fetch user's upload jobs from Neon DB
    const res = await query(
      `SELECT
        id,
        custom_title AS title,
        source_video_url AS source_url,
        status,
        failure_reason,
        progress_percent AS progress,
        youtube_video_id,
        visibility,
        started_at,
        created_at
       FROM UploadJobs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    );

    const jobs = res.rows.map((j) => ({
      id: j.id,
      title: j.title || 'Viral YouTube Short',
      source_url: j.source_url,
      status: j.status || 'Queued',
      failure_reason: j.failure_reason,
      progress: j.progress || 10,
      youtube_video_id: j.youtube_video_id,
      visibility: j.visibility || 'public',
      retry_count: 0,
      created_at: j.created_at
    }));

    return NextResponse.json({ jobs });
  } catch (err: any) {
    console.error('GET Jobs List Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
