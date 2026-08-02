'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Bell,
  Sparkles,
  Youtube,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Zap
} from 'lucide-react';

export function Header({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const { user, logout, setCreditModalOpen } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isConnected = user?.isYouTubeConnected || false;

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
        {/* Credits Badge */}
        <button
          onClick={() => setCreditModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-mono font-bold transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>{user?.credits?.toLocaleString() ?? 10000} Credits</span>
        </button>

        {/* Dynamic YouTube Connection Status Badge */}
        <Link
          href="/accounts"
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className={`w-4 h-4 ${isConnected ? 'text-red-500 fill-red-500' : 'text-slate-500'}`} />
          <span>{isConnected ? `Connected: ${user?.youtubeAccount?.account_name || 'YouTube'}` : 'YouTube Not Connected'}</span>
          {isConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          )}
        </Link>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
          </button>

          {/* Notification Center Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-glass p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">System Status</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Active</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Real Backend & DB Active
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Apify scraper, Gemini AI, and YouTube OAuth synced.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'trendtube'}`}
                alt="User Avatar"
                className="w-full h-full rounded-[10px] bg-slate-900 object-cover"
              />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                {user?.name || 'Creator'}
                {user?.role === 'admin' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                )}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                {user?.role === 'admin' ? 'Super Admin' : `${user?.credits?.toLocaleString() || 10000} Credits`}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-glass p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                  user?.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {user?.role === 'admin' ? '👑 Executive Admin' : 'Pro Creator'}
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> Account Settings
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
