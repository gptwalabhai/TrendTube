'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Youtube, Instagram, Video, Users, CheckCircle2, ExternalLink, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

function AccountsContent() {
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [ytConnected, setYtConnected] = useState(false);
  const [ytAccountData, setYtAccountData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch connected accounts from database
  const fetchAccountsFromDB = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        const yt = (data.accounts || []).find((a: any) => a.provider === 'youtube' && a.is_connected);
        if (yt) {
          setYtConnected(true);
          setYtAccountData(yt);
        } else {
          setYtConnected(false);
          setYtAccountData(null);
        }
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsFromDB();

    if (!searchParams) return;

    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const channel = searchParams.get('channel');

    if (connected === 'youtube' && channel) {
      setSuccessMsg(`YouTube channel "${channel}" connected successfully!`);
      refreshUser();
      fetchAccountsFromDB();
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        'access_denied': 'You denied access. Try again to connect your YouTube channel.',
        'no_code': 'No authorization code received. Please try again.',
        'oauth_not_configured': 'YouTube OAuth is not configured on the server.',
        'token_exchange_failed': 'Failed to exchange token with Google. Please try again.',
      };
      setErrorMsg(errorMessages[error] || `OAuth error: ${error}`);
    }
  }, [searchParams, refreshUser]);

  const handleConnectYouTube = () => {
    window.location.href = '/api/auth/youtube';
  };

  const handleDisconnectYouTube = async () => {
    if (!ytAccountData?.id) return;
    if (!confirm('Are you sure you want to disconnect your YouTube channel?')) return;

    try {
      const res = await fetch(`/api/accounts?id=${ytAccountData.id}`, { method: 'DELETE' });
      if (res.ok) {
        setYtConnected(false);
        setYtAccountData(null);
        setSuccessMsg(null);
        refreshUser();
      } else {
        alert('Failed to disconnect YouTube account');
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const formatSubscribers = (count: number | string) => {
    const n = typeof count === 'number' ? count : parseInt(count || '0', 10);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-400" /> Connected Creator Accounts
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Manage persistent OAuth connections to YouTube and social media profiles.
          </p>
        </div>

        <button
          onClick={fetchAccountsFromDB}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Account Status
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* YouTube */}
        <div className={`p-6 rounded-3xl bg-slate-900/60 border space-y-4 ${ytConnected ? 'border-emerald-500/40' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-2xl ${ytConnected ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-500'} border border-red-500/20`}>
              <Youtube className="w-6 h-6" />
            </div>
            {ytConnected ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected (DB Synced)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700/50">
                Not Connected
              </span>
            )}
          </div>

          {ytConnected && ytAccountData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={ytAccountData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ytAccountData.account_name}`}
                  alt=""
                  className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950"
                />
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{ytAccountData.account_name}</h3>
                  <p className="text-xs text-slate-400">{formatSubscribers(ytAccountData.subscriber_count)} subscribers</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                <a
                  href={`https://youtube.com/channel/${ytAccountData.channel_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Channel
                </a>
                <button
                  onClick={handleDisconnectYouTube}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title="Disconnect YouTube Channel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-base font-bold text-white">YouTube Channel</h3>
                <p className="text-xs text-slate-400">Direct video publishing & persistent OAuth tokens</p>
              </div>
              <button
                onClick={handleConnectYouTube}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white text-xs font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Youtube className="w-4 h-4" /> Connect YouTube Channel
              </button>
            </>
          )}
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
          <button disabled className="w-full py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed">
            Coming Soon
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
          <button disabled className="w-full py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AccountsContent />
    </Suspense>
  );
}
