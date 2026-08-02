'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Settings, Key, User, Download, Trash2, Youtube, Shield, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Disconnect state
  const [disconnecting, setDisconnecting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword.length < 6) {
      setPassMsg({ text: 'New password must be at least 6 characters', error: true });
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setPassMsg({ text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPassMsg({ text: data.error || 'Failed to update password', error: true });
      }
    } catch (err: any) {
      setPassMsg({ text: err.message || 'Connection error', error: true });
    } finally {
      setPassLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/user/settings');
      if (res.ok) {
        const data = await res.json();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trendtube_user_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to export data');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnectYouTube = async () => {
    if (!user?.youtubeAccount?.channel_id) return;
    if (!confirm('Are you sure you want to disconnect your YouTube Channel?')) return;

    setDisconnecting(true);
    try {
      const res = await fetch(`/api/accounts?id=${user.youtubeAccount.channel_id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshUser();
        alert('YouTube channel disconnected');
      } else {
        alert('Failed to disconnect YouTube account');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('WARNING: Are you sure you want to permanently delete your TrendTube account? This will erase all credits, playlists, and connected accounts.')) return;

    try {
      const res = await fetch('/api/user/settings', { method: 'DELETE' });
      if (res.ok) {
        alert('Account deleted successfully.');
        logout();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-400" /> Account Settings & Data Management
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Manage your password, YouTube OAuth integrations, credit history, and personal data exports.
        </p>
      </div>

      {/* Profile Details */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Profile Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">Full Name</span>
            <span className="font-bold text-white text-sm">{user?.name || 'Creator'}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-1">Email Address</span>
            <span className="font-mono font-bold text-indigo-300 text-sm">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" /> Change Security Password
        </h3>

        {passMsg && (
          <div className={`p-3 rounded-xl text-xs font-medium ${passMsg.error ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="password"
            required
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            required
            placeholder="New Password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={passLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Connected YouTube Channel */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" /> Connected YouTube Channel
        </h3>

        {user?.isYouTubeConnected ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <Youtube className="w-6 h-6 text-red-500 fill-red-500" />
              <div>
                <span className="font-bold text-white block">{user.youtubeAccount?.account_name || 'YouTube Channel'}</span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OAuth Token Persisted & Synced
                </span>
              </div>
            </div>
            <button
              onClick={handleDisconnectYouTube}
              disabled={disconnecting}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect Channel'}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">No YouTube channel currently connected.</span>
            <a
              href="/api/auth/youtube"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 shadow-glow"
            >
              <Youtube className="w-4 h-4 fill-white" /> Connect YouTube Channel
            </a>
          </div>
        )}
      </div>

      {/* Data Export & Danger Zone */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" /> Data Privacy & Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" /> Export All Personal SaaS Data (.json)
          </button>

          {user?.role !== 'admin' && (
            <button
              onClick={handleDeleteAccount}
              className="py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Account Permanently
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
