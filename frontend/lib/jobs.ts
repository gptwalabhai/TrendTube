import { query } from './db';
import { uploadVideoToYouTube } from './youtube-upload';

/**
 * Background Upload Job Processor Engine
 * Executes REAL YouTube Data API uploads using the user's persistent YouTube OAuth connection.
 */
export async function processQueuedJobs() {
  try {
    const pendingJobs = await query(
      `SELECT id, user_id, custom_title, custom_description, custom_tags, visibility, source_video_url, status, progress_percent, created_at
       FROM UploadJobs
       WHERE status IN ('Queued', 'Pending', 'Downloading', 'Generating Metadata', 'Uploading')
       ORDER BY created_at ASC
       LIMIT 5`
    );

    for (const job of pendingJobs.rows) {
      const jobAgeSeconds = (Date.now() - new Date(job.created_at).getTime()) / 1000;

      if (jobAgeSeconds > 15 || job.status === 'Uploading') {
        // Attempt REAL upload to Google YouTube Data API v3
        const result = await uploadVideoToYouTube(
          job.user_id,
          job.source_video_url,
          job.custom_title || 'Viral Short',
          job.custom_description || '',
          job.custom_tags || ['#shorts'],
          job.visibility || 'public'
        );

        if (result.success && result.youtubeVideoId) {
          await query(
            `UPDATE UploadJobs
             SET status = 'Completed', progress_percent = 100, youtube_video_id = $1, completed_at = NOW(), updated_at = NOW()
             WHERE id = $2`,
            [result.youtubeVideoId, job.id]
          );
          console.log(`[Job Processor] Successfully uploaded real video to YouTube: ID ${result.youtubeVideoId}`);
        } else {
          await query(
            `UPDATE UploadJobs
             SET status = 'Failed', failure_reason = $1, progress_percent = 0, updated_at = NOW()
             WHERE id = $2`,
            [result.error || 'YouTube API upload failed.', job.id]
          );
          console.error(`[Job Processor] Upload failed for Job ${job.id}:`, result.error);
        }
      } else if (jobAgeSeconds > 8 || job.status === 'Downloading') {
        await query(
          `UPDATE UploadJobs SET status = 'Generating Metadata', progress_percent = 60, updated_at = NOW() WHERE id = $1`,
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
