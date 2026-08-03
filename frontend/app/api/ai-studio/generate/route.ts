import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, videoUrl, tone } = body;
    const queryTopic = (topic || videoUrl || 'Viral Video Strategy').trim();

    const geminiKey = process.env.GEMINI_API_KEY || '';

    const prompt = `You are an elite viral video content strategist and SEO expert for YouTube Shorts and TikTok.

Topic: "${queryTopic}"
Tone: "${tone || 'Viral & High Energy'}"

Generate the following in strict JSON format (return ONLY JSON without markdown block wrappers):
{
  "titles": [
    "🔥 5 Catchy, high-CTR video titles with emojis tailored to ${queryTopic}"
  ],
  "hooks": [
    "3 attention-grabbing 3-second opening hooks"
  ],
  "script": "[0:00-0:03] Hook... \\n[0:03-0:15] Problem/Story... \\n[0:15-0:40] High value breakdown... \\n[0:40-0:50] Call to action",
  "cta": "Compelling call-to-action for subscribers and shares",
  "hashtags": ["#10", "#viral", "#hashtags"],
  "keywords": ["8", "SEO", "keywords"],
  "description": "Shorts optimized description under 200 characters",
  "videoIdeas": ["3 related video ideas for a content series"],
  "bestPostingTime": "Best posting time range (e.g. 6:00 PM - 9:00 PM EST)",
  "targetAudience": "Target demographic details"
}`;

    // Try multiple Gemini models in order of quota availability
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash'
    ];

    let geminiResult: any = null;

    if (geminiKey) {
      for (const modelName of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.85, maxOutputTokens: 2048 }
            })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              geminiResult = JSON.parse(jsonMatch[0]);
              break;
            }
          }
        } catch (e) {
          // Continue to next model on 429 or quota limit
        }
      }
    }

    // High Quality Intelligent Fallback Generator if Gemini quota is exhausted (429)
    if (!geminiResult) {
      const topicCap = queryTopic.charAt(0).toUpperCase() + queryTopic.slice(1);
      geminiResult = {
        titles: [
          `🔥 The UNTOLD Truth About ${topicCap} in 2027!`,
          `⚡ Why Everyone is WRONG About ${topicCap} (Watch Before It's Too Late)`,
          `🚨 3 ${topicCap} Hacks That Will Change Everything!`,
          `💡 How to Master ${topicCap} Faster Than 99% of People`,
          `📈 The Secret ${topicCap} Blueprint for Explosive Growth`
        ],
        hooks: [
          `"Stop scrolling! If you're ignoring ${queryTopic}, you're already behind..."`,
          `"Here's the 1 secret about ${queryTopic} that nobody is talking about..."`,
          `"What if I told you that everything you knew about ${queryTopic} is about to change?"`
        ],
        script: `[0:00 - 0:03] HOOK: "Stop scrolling! If you care about ${queryTopic}, listen to this carefully."\n` +
                `[0:03 - 0:12] THE SETUP: "Most creators make the mistake of treating ${queryTopic} like it's 2024. But in 2027, algorithms demand pure value retention."\n` +
                `[0:12 - 0:35] CORE BLUEPRINT:\n` +
                `1️⃣ Focus on 3-second visual hooks.\n` +
                `2️⃣ Use dynamic captions & high-energy cuts.\n` +
                `3️⃣ Deliver the punchline before second 45.\n` +
                `[0:35 - 0:50] CALL TO ACTION: "Save this video for later and hit subscribe for daily viral tactics!"`,
        cta: `🔥 Save this short & subscribe to TrendTube AI for daily viral breakdown scripts!`,
        hashtags: [
          `#${queryTopic.replace(/\s+/g, '')}`,
          '#ViralShorts',
          '#ContentCreator',
          '#GrowthHacks',
          '#SEOStrategy',
          '#YouTubeShorts',
          '#ShortsAlgorithms',
          '#CreatorEconomy'
        ],
        keywords: [queryTopic, 'viral script', 'shorts tips', 'algorithm hacks', 'SEO 2027', 'content strategy'],
        description: `Complete viral breakdown and script guide for ${topicCap}. Boost your CTR and audience retention fast!`,
        videoIdeas: [
          `Part 2: 5 Common ${topicCap} Mistakes to Avoid`,
          `Case Study: How Top Creators Built 1M Followers With ${topicCap}`,
          `The Future of ${topicCap}: 2027 Predictions`
        ],
        bestPostingTime: '6:00 PM - 9:00 PM EST (Peak Evening Retention)',
        targetAudience: 'Short-form content creators, digital marketers, and video strategists.'
      };
    }

    return NextResponse.json({
      success: true,
      result: geminiResult,
      topic: queryTopic
    });

  } catch (error: any) {
    console.error('AI Studio Generate Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
