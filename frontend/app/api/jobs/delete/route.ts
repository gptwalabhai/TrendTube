import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId required' }, { status: 400 });
    }

    await query(
      `DELETE FROM UploadJobs WHERE id = $1 AND user_id = $2`,
      [jobId, user.id]
    );

    return NextResponse.json({ success: true, message: 'Job deleted.' });
  } catch (err: any) {
    console.error('Delete Job Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
