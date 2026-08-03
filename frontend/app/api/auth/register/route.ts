import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSession, SESSION_COOKIE_NAME, ensureAdminUser } from '@/lib/auth';
import { runDatabaseMigrations } from '@/lib/migrate';
import { INITIAL_USER_CREDITS } from '@/lib/credits';

export async function POST(request: Request) {
  try {
    // Run database migrations to ensure password_hash and all columns exist on Neon PostgreSQL
    await runDatabaseMigrations();
    await ensureAdminUser();

    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await query(`SELECT id FROM Users WHERE email = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    // Insert user into DB with 10,000 initial credits
    const insertRes = await query(
      `INSERT INTO Users (name, email, password_hash, role, credits, subscription_plan, subscription_status)
       VALUES ($1, $2, $3, 'user', $4, 'pro', 'active')
       RETURNING id, name, email, role, credits, subscription_plan, subscription_status, created_at`,
      [name.trim(), cleanEmail, passwordHash, INITIAL_USER_CREDITS]
    );

    const newUser = insertRes.rows[0];

    // Log credit transaction history
    await query(
      `INSERT INTO CreditHistory (user_id, amount, action_type, description) VALUES ($1, $2, 'signup_bonus', 'Welcome bonus: 10,000 credits granted upon registration')`,
      [newUser.id, INITIAL_USER_CREDITS]
    );

    // Create persistent session
    const sessionToken = await createSession(newUser.id);

    const response = NextResponse.json({
      success: true,
      user: newUser,
      message: 'Registration successful'
    });

    // Set HTTP-only session cookie (30 days persistence)
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
