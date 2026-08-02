import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = (process.env.YOUTUBE_CLIENT_ID || '').trim();
  const redirectUri = (process.env.YOUTUBE_REDIRECT_URI || '').trim();

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'YouTube OAuth not configured. Add YOUTUBE_CLIENT_ID and YOUTUBE_REDIRECT_URI in Vercel settings.' },
      { status: 500 }
    );
  }

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', 'youtube_oauth');

  return NextResponse.redirect(authUrl.toString());
}
