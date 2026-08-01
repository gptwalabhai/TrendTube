'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  DollarSign,
  ArrowUpRight,
  Zap,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const analyticsData = [
  { date: '2026-07-25', views: 140000, subscribers: 1100, revenue: 180 },
  { date: '2026-07-26', views: 185000, subscribers: 1450, revenue: 240 },
  { date: '2026-07-27', views: 210000, subscribers: 1680, revenue: 290 },
  { date: '2026-07-28', views: 340000, subscribers: 2800, revenue: 450 },
  { date: '2026-07-29', views: 520000, subscribers: 4200, revenue: 720 },
  { date: '2026-07-30', views: 680000, subscribers: 5600, revenue: 940 },
  { date: '2026-07-31', views: 890000, subscribers: 7100, revenue: 1210 },
  { date: '2026-08-01', views: 1150000, subscribers: 9200, revenue: 1580 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-indigo-400" /> Channel Analytics & Growth Performance
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Track total views, subscriber velocity, click-through rates, watch time, and estimated revenue.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Total Channel Views</span>
          <p className="text-2xl font-bold font-display text-white">4,850,000</p>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +28.4% this month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Subscribers Gained</span>
          <p className="text-2xl font-bold font-display text-white">+38,400</p>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +34.1% this month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Average CTR</span>
          <p className="text-2xl font-bold font-display text-white">8.4%</p>
          <span className="text-xs text-indigo-400 font-medium flex items-center gap-1 mt-1">
            +1.2% above benchmark
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Estimated Revenue</span>
          <p className="text-2xl font-bold font-display text-emerald-400">$6,420.50</p>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +42.0% projected
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" /> Views Growth Trajectory
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Monetization & Revenue Velocity
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
