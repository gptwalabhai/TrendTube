import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { deductCredits, UPLOAD_CREDIT_COST } from '@/lib/credits';
import { runDatabaseMigrations } from '@/lib/migrate';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await runDatabaseMigrations();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login to publish videos.' }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Session expired.' }, { status: 401 });
    }

    const body = await request.json();
    const { sourceVideoUrl, title, description, tags, playlistId, visibility, scheduleTime } = body;

    if (!sourceVideoUrl) {
      return NextResponse.json({ success: false, error: 'sourceVideoUrl is required.' }, { status: 400 });
    }

    // Deduct 1,000 credits per YouTube upload
    const creditRes = await deductCredits(
      user.id,
      UPLOAD_CREDIT_COST,
      'upload_deduction',
      `YouTube Shorts upload: ${title || sourceVideoUrl}`
    );

    if (!creditRes.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: creditRes.error || 'Insufficient credits for upload. 1,000 credits required.'
        },
        { status: 402 }
      );
    }

    const initialStatus = scheduleTime ? 'Scheduled' : 'Queued';

    const dbRes = await query(
      `INSERT INTO UploadJobs (
        user_id, status, source_video_url, custom_title, custom_description, custom_tags,
        playlist_id, visibility, progress_percent, started_at, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 10, $9, NOW())
      RETURNING id, status, custom_title, created_at`,
      [
        user.id,
        initialStatus,
        sourceVideoUrl,
        title || null,                       // null = let AI generate the title
        description || null,                  // null = let AI generate the description
        tags || ['#viral', '#shorts', '#fyp'],
        playlistId || null,
        visibility || 'public',
        scheduleTime ? new Date(scheduleTime).toISOString() : new Date().toISOString()
      ]
    );

    const createdJob = dbRes.rows[0];

    return NextResponse.json({
      success: true,
      newBalance: creditRes.newBalance,
      job: {
        id: createdJob.id,
        status: createdJob.status,
        title: createdJob.custom_title,
        message: scheduleTime
          ? `Shorts scheduled for ${new Date(scheduleTime).toLocaleString()}`
          : 'Shorts queued for instant YouTube publishing.',
        created_at: createdJob.created_at
      }
    });

  } catch (error: any) {
    console.error('Create Job API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
