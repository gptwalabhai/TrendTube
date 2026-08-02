'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Flame,
  LayoutDashboard,
  Sparkles,
  FolderHeart,
  Youtube,
  Calendar,
  BarChart3,
  CreditCard,
  Settings,
  Users,
  ChevronRight,
  Zap
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, setCreditModalOpen } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trend Discovery', href: '/trends', icon: Flame, badge: 'HOT' },
    { name: 'AI Studio', href: '/ai-studio', icon: Sparkles, badge: 'PRO' },
    { name: 'Collections', href: '/collections', icon: FolderHeart },
    { name: 'YouTube Publishing', href: '/publishing', icon: Youtube },
    { name: 'Upload Scheduler', href: '/scheduler', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Connected Accounts', href: '/accounts', icon: Users },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const credits = user?.credits ?? 10000;

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0c0d14]/90 backdrop-blur-xl flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Logo */}
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1">
              TrendTube <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">AI</span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Viral Discovery Engine</p>
          </div>
        </Link>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Workspace
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  item.badge === 'HOT'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 opacity-80" />
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Bottom Credits Widget */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-xs font-semibold text-white">Credits Balance</span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300">{credits.toLocaleString()}</span>
        </div>
        <button
          onClick={() => setCreditModalOpen(true)}
          className="w-full text-center py-1.5 px-3 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white transition-opacity shadow-md"
        >
          Top Up Credits
        </button>
      </div>
    </aside>
  );
}
