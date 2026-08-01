'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  TrendingUp,
  Youtube,
  Eye,
  ArrowUpRight,
  Plus,
  Play,
  Share2,
  Bookmark,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const chartData = [
  { name: 'Mon', views: 420000, virality: 82 },
  { name: 'Tue', views: 580000, virality: 89 },
  { name: 'Wed', views: 720000, virality: 94 },
  { name: 'Thu', views: 980000, virality: 91 },
  { name: 'Fri', views: 1450000, virality: 97 },
  { name: 'Sat', views: 1890000, virality: 99 },
  { name: 'Sun', views: 2400000, virality: 96 },
];

const mockRecentViral = [
  {
    id: '1',
    title: '5 AI Secret Tools You Did Not Know Existed',
    author: '@techmindset',
    platform: 'youtube',
    views: '2.4M',
    virality: 98.4,
    outlier: '8.2x',
    thumbnail: 'https://picsum.photos/seed/dash1/600/800',
    time: '2h ago'
  },
  {
    id: '2',
    title: 'How I Built a $10k/mo Micro SaaS in 48 Hours',
    author: '@saasbuilder',
    platform: 'tiktok',
    views: '1.8M',
    virality: 94.1,
    outlier: '6.4x',
    thumbnail: 'https://picsum.photos/seed/dash2/600/800',
    time: '4h ago'
  },
  {
    id: '3',
    title: 'React 19 vs Next.js 16 - Complete Breakdown',
    author: '@codecraft',
    platform: 'instagram',
    views: '950K',
    virality: 91.2,
    outlier: '4.9x',
    thumbnail: 'https://picsum.photos/seed/dash3/600/800',
    time: '6h ago'
  }
];

export default function DashboardPage() {
  const [profileUrl, setProfileUrl] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome & Quick URL Scanner Input */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 shadow-glow overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> Next-Gen AI Trend Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            Discover Viral Trends. Scale Your YouTube Audience.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Paste any creator profile or channel URL to extract virality metrics, outlier scores, and generate AI-optimized scripts in seconds.
          </p>

          {/* URL Input Form */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="Paste TikTok @handle, IG profile, or YouTube channel URL..."
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
              />
            </div>
            <Link
              href={`/trends?url=${encodeURIComponent(profileUrl)}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-95 transition-all shadow-glow flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" /> Analyze Trends
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Scraped Videos</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">148,920</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% this week
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Virality Index</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">99.4 <span className="text-sm font-normal text-slate-400">/ 100</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> 8.4x Outlier Spike
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">YouTube Shorts Queue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Youtube className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">14 Scheduled</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            Next upload in 3h 15m
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Growth Velocity</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">+48.5K <span className="text-sm font-normal text-slate-400">views/hr</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Optimal Posting Time
          </div>
        </div>
      </div>

      {/* Main Charts & Live Radar Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Views Velocity Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Viral Views Trajectory
              </h3>
              <p className="text-xs text-slate-400">Aggregate view growth across monitored creator profiles</p>
            </div>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg">Real-Time Sync</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Live Viral Feed */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" /> Live Viral Radar
              </h3>
              <Link href="/trends" className="text-xs text-indigo-400 hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {mockRecentViral.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 transition-all flex gap-3 group">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/80 px-1 rounded text-white">{item.virality}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.author} • {item.views} views</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">{item.outlier} Outlier</span>
                      <span className="text-slate-500">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/ai-studio"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Generate Scripts in AI Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
