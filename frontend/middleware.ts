import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'trendtube_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Protected Dashboard Routes
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/trends') || 
                           pathname.startsWith('/ai-studio') || 
                           pathname.startsWith('/collections') || 
                           pathname.startsWith('/publishing') || 
                           pathname.startsWith('/analytics') || 
                           pathname.startsWith('/accounts') || 
                           pathname.startsWith('/settings') ||
                           pathname.startsWith('/billing') ||
                           pathname.startsWith('/scheduler');

  // Protected Admin Route (Only /alyautomates, never /admin)
  const isAdminRoute = pathname.startsWith('/alyautomates');

  // Auth Pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // 1. Unauthenticated users trying to access protected dashboard routes -> redirect to /login
  if (isDashboardRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Unauthenticated users trying to access admin panel -> redirect to /login
  if (isAdminRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated users trying to access login/register -> redirect to /dashboard
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Redirect legacy /admin requests to 404 or /dashboard to ensure /admin is never used
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trends/:path*',
    '/ai-studio/:path*',
    '/collections/:path*',
    '/publishing/:path*',
    '/analytics/:path*',
    '/accounts/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/scheduler/:path*',
    '/alyautomates/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
};
