import { query } from './db';
import { uploadVideoToYouTube } from './youtube-upload';

/**
 * Background Upload Job Processor
 *
 * Fixes applied:
 * 1. Only processes 1 job per run (prevents quota exhaustion)
 * 2. Auto-retries failed jobs after a 30-minute cooldown
 * 3. Caps retries at 3 attempts before permanently marking failed
 * 4. Skips quota-exceeded jobs and reschedules for next day
 */
export async function processQueuedJobs() {
  try {
    // 1. Auto-retry: Reset Failed jobs that are eligible for retry
    //    - Must have failed < 3 times (retry_count < 3)
    //    - Must have been updated > 30 minutes ago
    //    - Skip "quota exceeded" jobs — those need 24h cooldown
    await query(`
      UPDATE UploadJobs
      SET status = 'Queued', progress_percent = 0, updated_at = NOW()
      WHERE status = 'Failed'
        AND (retry_count IS NULL OR retry_count < 3)
        AND updated_at < NOW() - INTERVAL '30 minutes'
        AND (failure_reason IS NULL OR failure_reason NOT LIKE '%exceeded the number of videos%')
    `);

    // 2. Auto-retry quota-exceeded jobs after 24-hour cooldown
    await query(`
      UPDATE UploadJobs
      SET status = 'Queued', progress_percent = 0, updated_at = NOW()
      WHERE status = 'Failed'
        AND (retry_count IS NULL OR retry_count < 3)
        AND updated_at < NOW() - INTERVAL '24 hours'
        AND failure_reason LIKE '%exceeded the number of videos%'
    `);

    // 3. Pick ONLY 1 pending job to process at a time — prevents quota spikes
    const pendingJobs = await query(`
      SELECT id, user_id, custom_title, custom_description, custom_tags, visibility, source_video_url, status, progress_percent, created_at, retry_count
      FROM UploadJobs
      WHERE status IN ('Queued', 'Pending', 'Uploading')
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (pendingJobs.rows.length === 0) {
      console.log('[Job Processor] No pending jobs.');
      return;
    }

    const job = pendingJobs.rows[0];
    const retryCount = job.retry_count || 0;

    console.log(`[Job Processor] Processing job ${job.id} (attempt ${retryCount + 1}/3)`);

    // Mark as uploading
    await query(
      `UPDATE UploadJobs SET status = 'Uploading', progress_percent = 40, updated_at = NOW() WHERE id = $1`,
      [job.id]
    );

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
         SET status = 'Completed', progress_percent = 100, youtube_video_id = $1,
             completed_at = NOW(), updated_at = NOW()
         WHERE id = $2`,
        [result.youtubeVideoId, job.id]
      );
      console.log(`[Job Processor] ✅ Upload OK: YouTube ID ${result.youtubeVideoId}`);
    } else {
      const newRetryCount = retryCount + 1;
      const isPermanentFail = newRetryCount >= 3;

      await query(
        `UPDATE UploadJobs
         SET status = 'Failed',
             failure_reason = $1,
             progress_percent = 0,
             retry_count = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [result.error || 'Upload failed.', newRetryCount, job.id]
      );

      if (isPermanentFail) {
        console.error(`[Job Processor] ❌ Job ${job.id} permanently failed after 3 attempts.`);
      } else {
        const isQuotaError = (result.error || '').includes('exceeded the number of videos');
        console.log(
          `[Job Processor] ⏳ Job ${job.id} failed (attempt ${newRetryCount}/3). ` +
          `Auto-retrying in ${isQuotaError ? '24 hours' : '30 minutes'}.`
        );
      }
    }
  } catch (err) {
    console.error('[Job Processor] Exception:', err);
  }
}
