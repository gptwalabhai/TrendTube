'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Activity,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function AdminPanelPage() {
  const [featureFlags, setFeatureFlags] = useState([
    { id: 'flag1', name: 'ai_studio_v2', description: 'Next-gen LLM script prompt builder', enabled: true, rollout: '100%' },
    { id: 'flag2', name: 'auto_youtube_upload', description: 'Direct YouTube Data API publishing', enabled: true, rollout: '100%' },
    { id: 'flag3', name: 'tiktok_direct_publishing', description: 'Experimental TikTok posting API', enabled: false, rollout: '20%' }
  ]);

  const toggleFlag = (id: string) => {
    setFeatureFlags(featureFlags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-7 h-7 text-indigo-400" /> Executive Admin Control Center
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          System health monitoring, user account provisioning, feature flag rollouts, and audit logs.
        </p>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Total SaaS Users</span>
          <p className="text-2xl font-bold font-display text-white">1,420 Users</p>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 348 Active Today
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Active Paid MRR</span>
          <p className="text-2xl font-bold font-display text-emerald-400">$74,800 / mo</p>
          <span className="text-xs text-emerald-400 font-medium">890 Pro • 62 Enterprise</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Redis Queue Lag</span>
          <p className="text-2xl font-bold font-display text-indigo-400">12 ms</p>
          <span className="text-xs text-indigo-300 font-medium">Healthy Worker Pool</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">PostgreSQL Database</span>
          <p className="text-2xl font-bold font-display text-white">14 / 50 Pool</p>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Normal Connections
          </span>
        </div>
      </div>

      {/* Feature Flags Manager */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" /> Platform Feature Flags
        </h3>

        <div className="space-y-3">
          {featureFlags.map((flag) => (
            <div key={flag.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-300">{flag.name}</span>
                <p className="text-xs text-slate-400 mt-0.5">{flag.description} • Rollout: {flag.rollout}</p>
              </div>
              <button onClick={() => toggleFlag(flag.id)} className="text-indigo-400 hover:text-indigo-300">
                {flag.enabled ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Systemic Log Stream */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" /> Live Audit Log & Error Stream
          </h3>
          <span className="text-xs text-slate-500 font-mono">Stream Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
          <p className="text-slate-500">[2026-08-01 12:44:10 UTC] INFO: Scraper proxy completed batch request (120 profiles parsed in 410ms)</p>
          <p className="text-emerald-400">[2026-08-01 12:42:05 UTC] SUCCESS: YouTube OAuth Refresh Token extended for user user-demo-123</p>
          <p className="text-slate-500">[2026-08-01 12:39:20 UTC] INFO: AI Studio generated 5 titles for prompt topic 'React 19'</p>
        </div>
      </div>
    </div>
  );
}
