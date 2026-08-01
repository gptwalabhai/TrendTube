'use client';

import React from 'react';
import { Youtube, Instagram, Video, Users } from 'lucide-react';

export default function AccountsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-indigo-400" /> Connected Creator Accounts
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Manage OAuth connections to official YouTube, TikTok, and Instagram accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* YouTube */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <Youtube className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700/50">
              Not Connected
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">YouTube Channel</h3>
            <p className="text-xs text-slate-400">Direct video publishing & channel analytics</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all">
            Connect YouTube
          </button>
        </div>

        {/* TikTok */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700">
              <Video className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700/50">
              Not Connected
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">TikTok Profile</h3>
            <p className="text-xs text-slate-400">Direct publishing & metric scraping</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all">
            Connect TikTok
          </button>
        </div>

        {/* Instagram */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700">
              <Instagram className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700/50">
              Not Connected
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Instagram Profile</h3>
            <p className="text-xs text-slate-400">Reels analytics & auto-publish</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all">
            Connect Instagram
          </button>
        </div>
      </div>
    </div>
  );
}
