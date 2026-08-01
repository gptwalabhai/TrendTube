'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  TrendingUp,
  Youtube,
  Eye,
  Zap,
  Activity,
  BarChart2,
  ArrowRight
} from 'lucide-react';

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
          <p className="text-2xl font-display font-bold text-white">0</p>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Connect APIs to see live data
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Virality Index</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">—</p>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Connect APIs to see live data
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">YouTube Shorts Queue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Youtube className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">0</p>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Connect APIs to see live data
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Growth Velocity</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">—</p>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Connect APIs to see live data
          </div>
        </div>
      </div>

      {/* Main Charts & Live Radar Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Views Velocity Chart Area */}
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

          <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 p-6 text-center">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              Analytics will appear here once you start scraping profiles
            </p>
          </div>
        </div>

        {/* Right 1 Col: Live Viral Feed / Recent Viral Videos */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" /> Live Viral Radar
              </h3>
              <Link href="/trends" className="text-xs text-indigo-400 hover:underline">View All</Link>
            </div>

            <div className="py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Scrape your first profile on the Trends page to see videos here
              </p>
              <Link
                href="/trends"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors"
              >
                Go to Trends <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
