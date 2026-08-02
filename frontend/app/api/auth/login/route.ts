import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, createSession, SESSION_COOKIE_NAME, ensureAdminUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await ensureAdminUser(); // Ensure seed admin user exists

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check user record
    const userRes = await query(
      `SELECT id, name, email, password_hash, role, credits, subscription_plan, subscription_status, is_banned, uploads_count, searches_count, created_at
       FROM Users WHERE email = $1`,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    if (user.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended. Please contact support.' },
        { status: 403 }
      );
    }

    if (!user.password_hash || !comparePassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        subscription_plan: user.subscription_plan,
        subscription_status: user.subscription_status,
        uploads_count: user.uploads_count,
        searches_count: user.searches_count,
        created_at: user.created_at
      }
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    console.error('Login API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during login' },
      { status: 500 }
    );
  }
}
