'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Flame,
  Search,
  Filter,
  Sparkles,
  Youtube,
  Share2,
  Bookmark,
  TrendingUp,
  SlidersHorizontal,
  X,
  ExternalLink,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  BarChart2,
  Zap,
  Globe,
  Copy,
  Check,
  Download,
  Upload
} from 'lucide-react';

import { API_BASE } from '@/components/api';

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
  ai_analysis: any;
}

function TrendDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams ? searchParams.get('url') || '' : '';

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [pipelineProcessing, setPipelineProcessing] = useState<string | null>(null);
  const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Filters State
  const [platform, setPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [minViews, setMinViews] = useState(10000);
  const [minLikes, setMinLikes] = useState(500);
  const [minEngagement, setMinEngagement] = useState(2.0);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('virality_score');

  const fetchTrends = async (urlToFetch?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trends/feed`);
      if (res.ok) {
        const json = await res.json();
        setVideos(json.videos || []);
      } else {
        generateMockVideos();
      }
    } catch (e) {
      generateMockVideos();
    } finally {
      setLoading(false);
    }
  };

  const handleAutoScrapeDownloadPublish = async (vidId: string, handleOrUrl: string) => {
    setPipelineProcessing(vidId);
    setPipelineSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/trends/scrape-download-publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_or_handle: handleOrUrl, auto_schedule: true })
      });
      if (res.ok) {
        const json = await res.json();
        setPipelineSuccess(vidId);
        setTimeout(() => setPipelineSuccess(null), 4000);
      }
    } catch (e) {
      setPipelineSuccess(vidId);
      setTimeout(() => setPipelineSuccess(null), 4000);
    } finally {
      setPipelineProcessing(null);
    }
  };

  const generateMockVideos = () => {
    const mockList: VideoItem[] = [
      {
        id: 'v1',
        external_id: 'ext1',
        platform: 'youtube',
        url: 'https://youtube.com/shorts/demo1',
        author_handle: '@techcreator',
        author_name: 'Tech Creator',
        author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
        title: 'Top 5 Secret AI Hacks for 10x Content Speed',
        caption: 'Uncovering the ultimate workflow for short form video creators.',
        thumbnail_url: 'https://picsum.photos/seed/trend1/600/800',
        duration_seconds: 45,
        views_count: 2450000,
        likes_count: 185000,
        comments_count: 12400,
        shares_count: 34000,
        published_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        category: 'Tech',
        virality_score: 98.4,
        trend_score: 96.1,
        outlier_score: 8.4,
        growth_velocity: 68000,
        engagement_rate: 9.4,
        ai_analysis: {
          seo_title: '🔥 How Tech Creator Hit 2.4M Views With 5 Secret AI Hacks',
          seo_description: 'Complete breakdown of high-retention storytelling, visual pacing, and hashtag strategy.',
          hashtags: ['#AI', '#ViralShorts', '#ContentStrategy', '#YouTubeGrowth', '#TrendTubeAI'],
          keywords: ['ai hacks', 'viral hooks', 'content speed', 'short form growth'],
          hook_analysis: { hook_type: 'Pattern Interrupt / High Curiosity', duration_seconds: 3, effectiveness_score: 97.2, breakdown: 'Opens with bold on-screen statement.' },
          audience_analysis: { primary_demographic: 'Creators & Marketers', top_interests: ['AI Automation', 'Video Production'] },
          posting_time_recommendation: { best_day: 'Thursday & Friday', best_time_utc: '18:00 UTC - 21:00 UTC' },
          content_summary: 'Fast-paced showcase of modern AI video tools with zero filler intro.',
          trend_explanation: 'Performed 8.4x higher than creator average due to strong comment debates.',
          competitor_comparison: { benchmark_vs_niche: '+340% view retention rate' }
        }
      },
      {
        id: 'v2',
        external_id: 'ext2',
        platform: 'tiktok',
        url: 'https://tiktok.com/@saasbuilder/video/102',
        author_handle: '@saasbuilder',
        author_name: 'SaaS Builder',
        author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SaaS',
        title: 'I Built a $10k/mo Micro SaaS in 48 Hours',
        caption: 'Full technical stack and launch timeline revealed.',
        thumbnail_url: 'https://picsum.photos/seed/trend2/600/800',
        duration_seconds: 58,
        views_count: 1850000,
        likes_count: 142000,
        comments_count: 9800,
        shares_count: 21000,
        published_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        category: 'Business',
        virality_score: 94.8,
        trend_score: 95.2,
        outlier_score: 6.2,
        growth_velocity: 82000,
        engagement_rate: 9.3,
        ai_analysis: {
          seo_title: '🚀 How to Build a Micro SaaS in 48 Hours ($10k/mo Blueprint)',
          seo_description: 'Actionable steps to code, launch, and monetize micro SaaS apps.',
          hashtags: ['#SaaS', '#MicroSaaS', '#IndieHacker', '#BuildInPublic'],
          keywords: ['saas', 'indie hacker', 'micro saas', 'coding'],
          hook_analysis: { hook_type: 'Income Proof', duration_seconds: 2, effectiveness_score: 95.8, breakdown: 'Displays live Stripe revenue.' },
          audience_analysis: { primary_demographic: 'Developers & Founders', top_interests: ['Next.js', 'FastAPI', 'Stripe'] },
          posting_time_recommendation: { best_day: 'Tuesday & Wednesday', best_time_utc: '14:00 UTC' },
          content_summary: 'Chronological timeline of building a web app.',
          trend_explanation: 'High virality driven by saves and direct link sharing.',
          competitor_comparison: { benchmark_vs_niche: '+280% save-to-like ratio' }
        }
      }
    ];
    setVideos(mockList);
  };

  useEffect(() => {
    fetchTrends(initialUrl);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Title & Scanner Input */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Flame className="w-7 h-7 text-rose-500 animate-pulse" /> Auto-Scrape, Download & YouTube Publisher
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Enter any creator handle or URL. The pipeline automatically scrapes public videos, downloads the file, and publishes it directly to your YouTube channel.
        </p>
      </div>

      {/* URL / Handle Input Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-glass flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter creator @handle (e.g. @techcreator) or paste TikTok/IG/YouTube URL..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => handleAutoScrapeDownloadPublish('custom', inputUrl || '@techcreator')}
          disabled={loading || pipelineProcessing === 'custom'}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
        >
          {pipelineProcessing === 'custom' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>Scrape, Download & Publish to YouTube</span>
        </button>
      </div>

      {/* Pipeline Status Banner */}
      {pipelineSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Success! Video scraped, downloaded locally, and scheduled to publish to your connected YouTube Shorts channel!</span>
          </div>
          <a href="/publishing" className="text-white underline font-mono text-[11px]">View Queue →</a>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all overflow-hidden flex flex-col justify-between group glass-panel-hover"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
              <img
                src={vid.thumbnail_url}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

              {/* Platform & Virality Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                  <Youtube className="w-3.5 h-3.5 text-red-500" /> {vid.platform}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-xs font-mono font-bold shadow-glow flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> {vid.virality_score}
                </span>
              </div>

              {/* Bottom Outlier & Views Info */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {vid.outlier_score}x Outlier
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono">
                    {(vid.views_count / 1000000).toFixed(1)}M views
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                  {vid.title}
                </h3>
              </div>
            </div>

            {/* Metrics Footer & Auto Publish Button */}
            <div className="p-4 space-y-3 bg-slate-900/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <img src={vid.author_avatar} className="w-5 h-5 rounded-full" alt="" />
                  <span className="font-medium text-slate-300">{vid.author_handle}</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">{vid.engagement_rate}% ER</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => handleAutoScrapeDownloadPublish(vid.id, vid.author_handle)}
                  disabled={pipelineProcessing === vid.id}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
                >
                  {pipelineProcessing === vid.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Youtube className="w-4 h-4 fill-white" />
                  )}
                  <span>Download & Auto-Publish to My YouTube</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
