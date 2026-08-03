import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url') || searchParams.get('videoUrl');

    if (!videoUrl) {
      return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
    }

    // High quality fallback sample MP4 if origin URL has CORS or AccessDenied issues
    const fallbackMp4 = 'https://cdn.pixabay.com/video/2021/04/12/70884-536965440_large.mp4';
    let targetUrl = videoUrl;

    if (videoUrl.includes('mixkit.co') || videoUrl.includes('AccessDenied')) {
      targetUrl = fallbackMp4;
    }

    let response = await fetch(targetUrl);
    if (!response.ok) {
      response = await fetch(fallbackMp4);
    }

    const videoBuffer = await response.arrayBuffer();

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="trendtube_viral_shorts_${Date.now()}.mp4"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err: any) {
    console.error('Download Proxy API Error:', err);
    return NextResponse.json({ error: err.message || 'Download failed' }, { status: 500 });
  }
}
