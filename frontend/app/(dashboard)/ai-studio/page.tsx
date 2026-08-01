'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE } from '@/components/api';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  Youtube,
  Send,
  Wand2,
  FileText,
  Lightbulb,
  Hash,
  Share2,
  RefreshCw
} from 'lucide-react';

function AIStudioContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams ? searchParams.get('topic') || '' : '';

  const [topic, setTopic] = useState(initialTopic || '5 Secret AI Tools for 10x Productivity');
  const [tone, setTone] = useState('viral');
  const [platform, setPlatform] = useState('youtube_shorts');
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [aiResult, setAiResult] = useState<any>({
    topic: '5 Secret AI Tools for 10x Productivity',
    titles: [
      'I Tried 5 Secret AI Tools For 30 Days (Crazy Results)',
      'The Ultimate AI Productivity Stack Nobody Is Talking About',
      'Stop Wasting Hours! Use These 5 AI Tools Instead',
      '5 AI Tools That Feel Illegal To Know in 2026',
      'How Top 1% Creators Automate 90% of Their Content'
    ],
    hooks: [
      '⚡ Stop scrolling! If you spend more than 2 hours making content, these 5 AI tools will save your life.',
      '👀 99% of creators are using AI wrong. Here is the exact stack million-view channels rely on.',
      '🚨 I tested over 100 AI tools so you don’t have to. Here are the top 5 winners.'
    ],
    script: `[0:00 - 0:03 HOOK]
(Visual: Fast jump-cut with neon text overlay)
"If you want to create 10x more content in half the time, stop doing it manually!"

[0:03 - 0:15 TOOL 1: TREND ENGINE]
"First up, TrendTube AI. It analyzes viral outlier scores so you know what works before you even hit record."

[0:15 - 0:30 TOOL 2: AUTO SCRIPTER]
"Second, use AI Studio to generate high-retention 15-second hooks that double your watch time completion rate."

[0:30 - 0:45 CALL TO ACTION]
"Save this video right now, and comment 'STACK' to get the full tool list sent to your DMs!"`,
    cta: 'Save this video and subscribe to TrendTube AI for daily viral breakdowns!',
    hashtags: ['#AITools', '#Productivity', '#ViralShorts', '#TrendTubeAI', '#CreatorEconomy'],
    keywords: ['ai tools', 'productivity', 'viral hooks', 'youtube shorts growth'],
    video_ideas: [
      { title: 'Testing The Most Hyped AI Tool of 2026', format: 'Experiment', est_virality: '98%' },
      { title: '3 AI Workflow Mistakes Destroying Your Reach', format: 'Problem-Solution', est_virality: '94%' }
    ]
  });

  const handleGenerate = async () => {
    if (!topic || !topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai-studio/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, target_platform: platform })
      });
      if (res.ok) {
        const json = await res.json();
        setAiResult(json.data);
      }
    } catch (e) {
      // Fallback retains client preview state
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-indigo-400" /> AI Studio Workshop
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Generate viral hooks, high-retention scripts, SEO titles, hashtags, and CTAs powered by AI.
        </p>
      </div>

      {/* Generator Controls Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-glass space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <Wand2 className="w-4 h-4" /> Content Prompt Configurator
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Topic or Seed Idea</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 Secret AI Tools for 10x Productivity..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tone of Voice</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="viral">🔥 Viral & High Energy</option>
              <option value="curiosity">👀 Intriguing & Curious</option>
              <option value="educational">🎓 Educational & Authoritative</option>
              <option value="controversial">🚨 Bold & Controversial</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white text-sm font-semibold flex items-center gap-2 shadow-glow transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate Content Suite</span>
          </button>
        </div>
      </div>

      {/* Generated Outputs Grid */}
      {aiResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Titles Section */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> High CTR Titles
              </h3>
              <button
                onClick={() => copyToClipboard(aiResult.titles?.join('\n'), 'titles')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedSection === 'titles' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All
              </button>
            </div>
            <div className="space-y-2">
              {aiResult.titles?.map((t: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center justify-between group">
                  <span>{t}</span>
                  <button
                    onClick={() => copyToClipboard(t, `title-${idx}`)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                  >
                    {copiedSection === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hooks Section */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> 3-Second Viral Hooks
              </h3>
              <button
                onClick={() => copyToClipboard(aiResult.hooks?.join('\n\n'), 'hooks')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedSection === 'hooks' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy All
              </button>
            </div>
            <div className="space-y-2">
              {aiResult.hooks?.map((h: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-200/90 leading-relaxed font-mono">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Full Script Section */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> High-Retention Short-Form Script
              </h3>
              <button
                onClick={() => copyToClipboard(aiResult.script, 'script')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedSection === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy Script
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
              {aiResult.script}
            </pre>
          </div>

          {/* Hashtags & Keywords */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Recommended Hashtags</span>
              <div className="flex flex-wrap gap-1.5">
                {aiResult.hashtags?.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <a
              href="/publishing"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap shadow-glow"
            >
              <Youtube className="w-4 h-4" /> Send to YouTube Publishing Scheduler
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIStudioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AIStudioContent />
    </Suspense>
  );
}
