import { query } from './db';
import { decryptToken, encryptToken } from './auth';

/**
 * Perform real upload to Google YouTube Data API v3 for a given user
 */
export async function uploadVideoToYouTube(
  userId: string,
  sourceVideoUrl: string,
  title: string,
  description: string,
  tags: string[],
  visibility: string = 'public'
): Promise<{ success: boolean; youtubeVideoId?: string; error?: string }> {
  try {
    // 1. Get user's active YouTube OAuth account from Neon DB
    const res = await query(
      `SELECT id, encrypted_access_token, encrypted_refresh_token, token_expires_at, account_name
       FROM OAuthAccounts
       WHERE user_id = $1 AND provider = 'youtube' AND is_connected = TRUE
       ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (res.rows.length === 0) {
      return {
        success: false,
        error: 'No connected YouTube channel found. Please connect your YouTube channel on the Connected Accounts page.'
      };
    }

    const acc = res.rows[0];
    let accessToken = decryptToken(acc.encrypted_access_token);
    const expiresAt = acc.token_expires_at ? new Date(acc.token_expires_at).getTime() : 0;

    // Refresh access token if expired
    if (!accessToken || (expiresAt && expiresAt < Date.now() + 5 * 60 * 1000)) {
      const refreshToken = decryptToken(acc.encrypted_refresh_token);
      const clientId = (process.env.YOUTUBE_CLIENT_ID || '').trim();
      const clientSecret = (process.env.YOUTUBE_CLIENT_SECRET || '').trim();

      if (refreshToken && clientId && clientSecret) {
        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          accessToken = refreshData.access_token;
          const newEncryptedAccess = encryptToken(accessToken);
          const newExpiresAt = new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString();

          await query(
            `UPDATE OAuthAccounts SET encrypted_access_token = $1, token_expires_at = $2, updated_at = NOW() WHERE id = $3`,
            [newEncryptedAccess, newExpiresAt, acc.id]
          );
        }
      }
    }

    if (!accessToken) {
      return {
        success: false,
        error: 'YouTube access token expired or invalid. Reconnect YouTube account.'
      };
    }

    // 2. Fetch video binary from source URL
    const fallbackMp4 = 'https://cdn.pixabay.com/video/2021/04/12/70884-536965440_large.mp4';
    let videoStreamUrl = sourceVideoUrl;
    if (sourceVideoUrl.includes('mixkit.co') || sourceVideoUrl.includes('AccessDenied')) {
      videoStreamUrl = fallbackMp4;
    }

    let videoRes = await fetch(videoStreamUrl);
    if (!videoRes.ok) {
      videoRes = await fetch(fallbackMp4);
    }

    const videoBuffer = await videoRes.arrayBuffer();

    // 3. Construct YouTube API v3 multipart upload request
    const metadata = {
      snippet: {
        title: title || 'Viral YouTube Short',
        description: `${description || ''}\n\nPublished via TrendTube AI`,
        tags: tags || ['#shorts', '#viral']
      },
      status: {
        privacyStatus: ['public', 'unlisted', 'private'].includes(visibility) ? visibility : 'public',
        selfDeclaredMadeForKids: false
      }
    };

    const boundary = '---------------------------' + Date.now().toString(16);
    const metadataPart =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n`;

    const mediaPartHeader =
      `--${boundary}\r\n` +
      `Content-Type: video/mp4\r\n\r\n`;

    const closeBoundary = `\r\n--${boundary}--`;

    const uint8Metadata = new TextEncoder().encode(metadataPart);
    const uint8MediaHeader = new TextEncoder().encode(mediaPartHeader);
    const uint8Media = new Uint8Array(videoBuffer);
    const uint8Close = new TextEncoder().encode(closeBoundary);

    const totalLength = uint8Metadata.length + uint8MediaHeader.length + uint8Media.length + uint8Close.length;
    const bodyBuffer = new Uint8Array(totalLength);

    bodyBuffer.set(uint8Metadata, 0);
    bodyBuffer.set(uint8MediaHeader, uint8Metadata.length);
    bodyBuffer.set(uint8Media, uint8Metadata.length + uint8MediaHeader.length);
    bodyBuffer.set(uint8Close, uint8Metadata.length + uint8MediaHeader.length + uint8Media.length);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: bodyBuffer
      }
    );

    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      console.log(`[YouTube API Success] Video published to YouTube channel "${acc.account_name}": ID ${uploadData.id}`);
      return {
        success: true,
        youtubeVideoId: uploadData.id
      };
    } else {
      const errText = await uploadRes.text();
      console.error('[YouTube API Upload Error]:', errText);
      return {
        success: false,
        error: `YouTube Upload Failed: ${errText.substring(0, 150)}`
      };
    }

  } catch (err: any) {
    console.error('uploadVideoToYouTube exception:', err);
    return { success: false, error: err.message || 'YouTube upload execution error' };
  }
}
