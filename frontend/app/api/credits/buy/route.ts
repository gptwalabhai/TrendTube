import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { addCredits } from '@/lib/credits';

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
    const { package: pkgName, amount } = body;

    const creditAmount = parseInt(amount) || 10000;

    const result = await addCredits(
      user.id,
      creditAmount,
      'admin_add',
      `Purchased package '${pkgName || 'Credit Boost'}': +${creditAmount.toLocaleString()} credits`
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to update credit balance' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      message: `Successfully added ${creditAmount.toLocaleString()} credits!`
    });
  } catch (err: any) {
    console.error('Buy credits error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
