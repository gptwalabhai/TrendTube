'use client';

import React from 'react';
import {
  BarChart3,
  Eye,
  DollarSign
} from 'lucide-react';

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
          <p className="text-2xl font-bold font-display text-white">—</p>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Connect YouTube to see real analytics
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Subscribers Gained</span>
          <p className="text-2xl font-bold font-display text-white">—</p>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Connect YouTube to see real analytics
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Average CTR</span>
          <p className="text-2xl font-bold font-display text-white">—</p>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Connect YouTube to see real analytics
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Estimated Revenue</span>
          <p className="text-2xl font-bold font-display text-emerald-400">—</p>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Connect YouTube to see real analytics
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" /> Views Growth Trajectory
          </h3>
          <div className="h-72 w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
            <BarChart3 className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 font-medium max-w-xs">
              Connect your YouTube channel on the Accounts page to view real analytics
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Monetization & Revenue Velocity
          </h3>
          <div className="h-72 w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
            <BarChart3 className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 font-medium max-w-xs">
              Connect your YouTube channel on the Accounts page to view real analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
