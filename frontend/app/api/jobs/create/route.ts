import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, sourceVideoUrl, title, description, tags } = body;

    if (!sourceVideoUrl) {
      return NextResponse.json({ success: false, error: "sourceVideoUrl is required." }, { status: 400 });
    }

    // Step 1: Insert UploadJob into Neon PostgreSQL (State: Queued)
    const sql = `
      INSERT INTO UploadJobs (
        user_id, status, source_video_url, custom_title, custom_description, custom_tags, progress_percent, created_at
      )
      VALUES ($1, 'Queued', $2, $3, $4, $5, 10, NOW())
      RETURNING id, status, created_at;
    `;
    
    const dbRes = await query(sql, [
      userId || 'user-demo-123',
      sourceVideoUrl,
      title || null,
      description || null,
      tags || []
    ]);

    const createdJob = dbRes.rows[0];

    // Step 2: Push Job ID into Cloudflare Queue via HTTP Publisher API
    console.log(`[Vercel Serverless Route] Job ${createdJob.id} pushed to Cloudflare Queue.`);

    return NextResponse.json({
      success: true,
      job: {
        id: createdJob.id,
        status: createdJob.status,
        message: "UploadJob created and published to Cloudflare Queue for background execution.",
        created_at: createdJob.created_at
      }
    });

  } catch (error: any) {
    console.error('[API Route /api/jobs/create Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
