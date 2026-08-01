'use client';

import React, { useState } from 'react';
import { Settings, Key, Bell, User, Copy, Check, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: 'key1', name: 'Production Scraper Backend', key: 'tt_live_948a291f0a2...', created: '2026-07-15' }
  ]);

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-400" /> Account Settings & API Keys
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Manage profile settings, security API keys, and notification channels.
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Creator Profile Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 mb-1 block">Full Name</label>
            <input type="text" defaultValue="Alex Trendmaster" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-slate-400 mb-1 block">Email Address</label>
            <input type="email" defaultValue="creator@trendtube.ai" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" /> Developer API Keys
          </h3>
          <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-glow">
            <Plus className="w-3.5 h-3.5" /> Generate Secret Key
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {apiKeys.map((k) => (
            <div key={k.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <p className="font-semibold text-white">{k.name}</p>
                <p className="text-[11px] text-slate-500">{k.key}</p>
              </div>
              <button onClick={() => copyKey(k.key)} className="text-slate-400 hover:text-white p-1">
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Channels */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Notification Channels
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span>Email Daily Digest & Trend Alerts</span>
            <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span>Discord Webhook Alerts</span>
            <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span>Slack Workspace Integration</span>
            <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
