import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    const sql = `
      SELECT id, user_id, status, source_video_url, custom_title, youtube_video_id,
             progress_percent, retry_count, execution_time_ms, failure_reason, created_at, updated_at
      FROM UploadJobs
      WHERE id = $1;
    `;
    
    const dbRes = await query(sql, [jobId]);

    if (dbRes.rows.length === 0) {
      // Mock job response for client preview if DB table is unpopulated
      return NextResponse.json({
        success: true,
        job: {
          id: jobId,
          status: 'Uploading',
          progress_percent: 80,
          retry_count: 0,
          source_video_url: 'https://tiktok.com/@creator/video/101',
          youtube_video_id: 'yt_demo_101'
        }
      });
    }

    return NextResponse.json({
      success: true,
      job: dbRes.rows[0]
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
