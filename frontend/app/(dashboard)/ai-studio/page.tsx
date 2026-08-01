'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  Youtube,
  Wand2,
  FileText,
  RefreshCw,
  Inbox
} from 'lucide-react';

function AIStudioContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams ? searchParams.get('topic') || '' : '';

  const [topic, setTopic] = useState(initialTopic);
  const [tone, setTone] = useState('viral');
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!topic || !topic.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, contentType: tone })
      });
      const json = await res.json();
      if (json.success && json.result) {
        setAiResult(json.result);
      } else {
        setErrorMsg(json.error || 'Failed to generate content. Check your Gemini API key in Vercel settings.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error connecting to AI service.');
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
          Generate viral hooks, high-retention scripts, SEO titles, hashtags, and CTAs powered by Gemini AI.
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
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
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
            disabled={loading || !topic.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white text-sm font-semibold flex items-center gap-2 shadow-glow transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Content Suite'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State — before generation */}
      {!aiResult && !loading && (
        <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Enter a topic to generate content</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Type any video topic above (e.g. "5 Secret AI Tools") and click <strong>Generate Content Suite</strong>. 
            Gemini AI will create SEO titles, viral hooks, scripts, hashtags, and more.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Generating content with Gemini AI...</p>
        </div>
      )}

      {/* Generated Outputs Grid */}
      {aiResult && !loading && (
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
