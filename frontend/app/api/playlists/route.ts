import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { query } from '@/lib/db';

// GET playlists for user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ playlists: [] }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ playlists: [] }, { status: 401 });
    }

    const res = await query(
      `SELECT p.id, p.name, p.description, p.created_at, p.updated_at,
              COUNT(v.id) as videos_count
       FROM Playlists p
       LEFT JOIN PlaylistVideos v ON p.id = v.playlist_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.updated_at DESC`,
      [user.id]
    );

    return NextResponse.json({ playlists: res.rows });
  } catch (err: any) {
    console.error('GET Playlists Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create playlist or add video
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, name, description, playlistId, videoId, videoData } = body;

    // Action 1: Add Video to Playlist
    if (action === 'add_video' || (playlistId && videoData)) {
      const pId = playlistId;
      const vId = videoId || videoData.id;

      await query(
        `INSERT INTO PlaylistVideos (playlist_id, video_id, video_data) VALUES ($1, $2, $3)`,
        [pId, vId, JSON.stringify(videoData)]
      );

      await query(`UPDATE Playlists SET updated_at = NOW() WHERE id = $1`, [pId]);

      return NextResponse.json({ success: true, message: 'Video added to playlist' });
    }

    // Action 2: Create New Playlist
    if (!name) {
      return NextResponse.json({ error: 'Playlist name required' }, { status: 400 });
    }

    const insertRes = await query(
      `INSERT INTO Playlists (user_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [user.id, name.trim(), description || 'Custom viral video collection']
    );

    return NextResponse.json({ success: true, playlist: insertRes.rows[0] });
  } catch (err: any) {
    console.error('POST Playlist Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE playlist
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('id');

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 });
    }

    await query(`DELETE FROM Playlists WHERE id = $1 AND user_id = $2`, [playlistId, user.id]);

    return NextResponse.json({ success: true, message: 'Playlist deleted' });
  } catch (err: any) {
    console.error('DELETE Playlist Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
