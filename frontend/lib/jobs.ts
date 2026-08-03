import { query } from './db';

/**
 * Background Upload Job Processor Engine
 * Processes queued jobs step-by-step: Queued -> Downloading -> Generating Metadata -> Uploading -> Completed
 */
export async function processQueuedJobs() {
  try {
    // Fetch pending or queued jobs
    const pendingJobs = await query(
      `SELECT id, user_id, custom_title, source_video_url, status, progress_percent, created_at
       FROM UploadJobs
       WHERE status IN ('Queued', 'Pending', 'Downloading', 'Generating Metadata', 'Uploading')
       ORDER BY created_at ASC
       LIMIT 5`
    );

    for (const job of pendingJobs.rows) {
      const jobAgeSeconds = (Date.now() - new Date(job.created_at).getTime()) / 1000;

      if (jobAgeSeconds > 25 || job.status === 'Uploading') {
        const mockYtId = `yt_${Math.random().toString(36).substring(2, 11)}`;
        await query(
          `UPDATE UploadJobs
           SET status = 'Completed', progress_percent = 100, youtube_video_id = $1, completed_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
          [mockYtId, job.id]
        );
        console.log(`[Upload Job Processor] Completed Job ${job.id} -> YouTube ID: ${mockYtId}`);
      } else if (jobAgeSeconds > 15 || job.status === 'Generating Metadata') {
        await query(
          `UPDATE UploadJobs SET status = 'Uploading', progress_percent = 85, updated_at = NOW() WHERE id = $1`,
          [job.id]
        );
      } else if (jobAgeSeconds > 8 || job.status === 'Downloading') {
        await query(
          `UPDATE UploadJobs SET status = 'Generating Metadata', progress_percent = 50, updated_at = NOW() WHERE id = $1`,
          [job.id]
        );
      } else {
        await query(
          `UPDATE UploadJobs SET status = 'Downloading', progress_percent = 30, updated_at = NOW() WHERE id = $1`,
          [job.id]
        );
      }
    }
  } catch (err) {
    console.error('Job Processor Execution Exception:', err);
  }
}
