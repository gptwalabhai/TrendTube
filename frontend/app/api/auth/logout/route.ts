import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await destroySession(sessionToken);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (err: any) {
    console.error('Logout Error:', err);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
