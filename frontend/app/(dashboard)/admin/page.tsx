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

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout: string;
}

export default function AdminPanelPage() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);

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
          <p className="text-2xl font-bold font-display text-white">0</p>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 0 Active Today
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Active Paid MRR</span>
          <p className="text-2xl font-bold font-display text-emerald-400">$0</p>
          <span className="text-xs text-slate-500 font-medium">0 Pro • 0 Enterprise</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Redis Queue Lag</span>
          <p className="text-2xl font-bold font-display text-indigo-400">—</p>
          <span className="text-xs text-slate-500 font-medium">Healthy Worker Pool</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">PostgreSQL Database</span>
          <p className="text-2xl font-bold font-display text-white">0 / 0 Pool</p>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
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
          {featureFlags.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs md:text-sm rounded-2xl bg-slate-950/40 border border-slate-800/50">
              No feature flags configured
            </div>
          ) : (
            featureFlags.map((flag) => (
              <div key={flag.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-300">{flag.name}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{flag.description} • Rollout: {flag.rollout}</p>
                </div>
                <button onClick={() => toggleFlag(flag.id)} className="text-indigo-400 hover:text-indigo-300">
                  {flag.enabled ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                </button>
              </div>
            ))
          )}
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

        <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-500 text-center">
          System logs will appear here
        </div>
      </div>
    </div>
  );
}

