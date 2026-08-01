import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, videoUrl, contentType } = body;

    if (!topic && !videoUrl) {
      return NextResponse.json({ success: false, error: 'Topic or video URL is required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || '';
    if (!geminiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY environment variable is not configured. Please add it in Vercel settings.'
      }, { status: 400 });
    }

    const prompt = `You are a viral video SEO and content strategist for YouTube Shorts and TikTok.

Given this topic/video: "${topic || videoUrl}"

Generate the following in JSON format (return ONLY valid JSON, no markdown):
{
  "titles": ["5 catchy, SEO-optimized video titles with emojis"],
  "hooks": ["3 attention-grabbing opening hooks (first 3 seconds)"],
  "script": "A complete 30-60 second video script with timestamps",
  "cta": "A compelling call-to-action for the end of the video",
  "hashtags": ["10 relevant trending hashtags"],
  "keywords": ["8 SEO keywords for discoverability"],
  "description": "A YouTube Shorts optimized description (max 200 chars)",
  "videoIdeas": ["3 related video ideas for a content series"],
  "bestPostingTime": "Recommended posting time based on the topic niche",
  "targetAudience": "Primary target audience description"
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ success: false, error: `Gemini API error: ${errText}` }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON from Gemini's response (it may be wrapped in markdown code blocks)
    let parsed;
    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(textResponse);
      }
    } catch {
      // If JSON parsing fails, return the raw text
      parsed = {
        titles: ['Could not parse structured response'],
        hooks: [],
        script: textResponse,
        cta: '',
        hashtags: [],
        keywords: [],
        description: '',
        videoIdeas: [],
        bestPostingTime: '',
        targetAudience: ''
      };
    }

    return NextResponse.json({
      success: true,
      result: parsed,
      model: 'gemini-2.0-flash',
      topic: topic || videoUrl
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
