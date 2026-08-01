'use client';

import React, { useState } from 'react';
import { Search, Bell, Sparkles, Youtube, CheckCircle2, ChevronDown, User, Moon, Sun } from 'lucide-react';

export function Header({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800/60 bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Input Quick Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs hover:border-slate-700 hover:text-slate-200 transition-all text-left shadow-inner group"
        >
          <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          <span>Paste profile URL (TikTok, IG, YT) or search trends...</span>
          <kbd className="ml-auto font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* YouTube Connection Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
          <span>YouTube API Connected</span>
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
          </button>

          {/* Notification Center Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-glass p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">2 New</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Viral Spike Alert
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">@techcreator's video reached 94.2 virality score.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Upload Scheduled
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">'5 AI Hacks' set for tomorrow 18:00 UTC.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 cursor-pointer">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Trendmaster"
              alt="User Avatar"
              className="w-full h-full rounded-[10px] bg-slate-900 object-cover"
            />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Alex Trendmaster</p>
            <p className="text-[10px] text-slate-400">Pro Account</p>
          </div>
        </div>
      </div>
    </header>
  );
}
