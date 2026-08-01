'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Flame,
  Search,
  Sparkles,
  Youtube,
  Check,
  Upload,
  Inbox
} from 'lucide-react';

interface VideoItem {
  id: string;
  external_id: string;
  platform: string;
  url: string;
  author_handle: string;
  author_name: string;
  author_avatar: string;
  title: string;
  caption: string;
  thumbnail_url: string;
  duration_seconds: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  published_at: string;
  category: string;
  virality_score: number;
  trend_score: number;
  outlier_score: number;
  growth_velocity: number;
  engagement_rate: number;
}

function TrendDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams ? searchParams.get('url') || '' : '';

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [pipelineProcessing, setPipelineProcessing] = useState<string | null>(null);
  const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleScrapeProfile = async () => {
    const target = inputUrl.trim();
    if (!target) return;

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    try {
      const res = await fetch('/api/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_or_handle: target })
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.videos)) {
        setVideos(json.videos);
        if (json.videos.length === 0) {
          setErrorMsg('No videos found for this profile. Try a different handle.');
        }
      } else {
        setErrorMsg(json.error || 'Failed to scrape videos. Check your Apify API key in Vercel settings.');
        setVideos([]);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error connecting to scraper.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToYouTube = async (vidId: string, videoUrl: string) => {
    setPipelineProcessing(vidId);
    setPipelineSuccess(null);
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceVideoUrl: videoUrl, title: 'Auto-Published Video' })
      });
      if (res.ok) {
        setPipelineSuccess(vidId);
        setTimeout(() => setPipelineSuccess(null), 5000);
      } else {
        setErrorMsg('Failed to queue video for publishing. Check database connection.');
      }
    } catch (e) {
      setErrorMsg('Error creating publish job.');
    } finally {
      setPipelineProcessing(null);
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return String(n);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Flame className="w-7 h-7 text-rose-500 animate-pulse" /> Live Profile Scraper & Virality Analyzer
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Enter any creator handle or profile URL (e.g. <code className="text-indigo-400 font-mono">@wildtraillife</code>). 
          Apify scrapes real videos, calculates Virality & Outlier scores.
        </p>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-glass flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrapeProfile()}
            placeholder="Enter creator handle (e.g. @wildtraillife) or paste TikTok/IG URL..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleScrapeProfile}
          disabled={loading || !inputUrl.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{loading ? 'Scraping...' : 'Scrape & Analyze Profile'}</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pipeline Success Banner */}
      {pipelineSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Video queued for YouTube publishing!</span>
          </div>
          <a href="/publishing" className="text-white underline font-mono text-[11px]">View Queue →</a>
        </div>
      )}

      {/* Empty State — before any search */}
      {!searched && videos.length === 0 && !loading && (
        <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Paste a profile to start scraping</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Enter a TikTok handle like <code className="text-indigo-300">@wildtraillife</code> or a full profile URL above and click <strong>Scrape & Analyze Profile</strong>. 
            Real videos will appear here with virality scores.
          </p>
        </div>
      )}

      {/* Empty State — after search with no results */}
      {searched && videos.length === 0 && !loading && !errorMsg && (
        <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No videos found</h3>
          <p className="text-xs text-slate-400">Try a different creator handle or check the URL format.</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-slate-800"></div>
              <div className="p-4 space-y-3">
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real Videos Grid */}
      {videos.length > 0 && !loading && (
        <div>
          <p className="text-xs text-slate-500 mb-4">{videos.length} videos scraped from Apify</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                  <img
                    src={vid.thumbnail_url}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${vid.id}`; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                      <Youtube className="w-3.5 h-3.5 text-red-500" /> {vid.platform}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-xs font-mono font-bold shadow-glow flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {vid.virality_score}
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {vid.outlier_score}x Outlier
                      </span>
                      <span className="text-[11px] text-slate-300 font-mono">
                        {formatCount(vid.views_count)} views
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {vid.title}
                    </h3>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 space-y-3 bg-slate-900/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <img src={vid.author_avatar} className="w-5 h-5 rounded-full" alt="" 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${vid.author_handle}`; }}
                      />
                      <span className="font-medium text-slate-300">{vid.author_handle}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">{vid.engagement_rate}% ER</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>❤️ {formatCount(vid.likes_count)}</span>
                    <span>💬 {formatCount(vid.comments_count)}</span>
                    <span>🔄 {formatCount(vid.shares_count)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handlePublishToYouTube(vid.id, vid.url)}
                      disabled={pipelineProcessing === vid.id}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
                    >
                      {pipelineProcessing === vid.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Youtube className="w-4 h-4 fill-white" />
                      )}
                      <span>Push & Auto-Publish to YouTube</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrendDiscoveryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <TrendDiscoveryContent />
    </Suspense>
  );
}
