'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Youtube, Instagram, Video, Users, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';

function AccountsContent() {
  const searchParams = useSearchParams();

  const [ytConnected, setYtConnected] = useState(false);
  const [ytChannel, setYtChannel] = useState('');
  const [ytChannelId, setYtChannelId] = useState('');
  const [ytSubscribers, setYtSubscribers] = useState('0');
  const [ytAvatar, setYtAvatar] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const channel = searchParams.get('channel');
    const channelId = searchParams.get('channelId');
    const subscribers = searchParams.get('subscribers');
    const avatar = searchParams.get('avatar');

    if (connected === 'youtube' && channel) {
      setYtConnected(true);
      setYtChannel(channel);
      setYtChannelId(channelId || '');
      setYtSubscribers(subscribers || '0');
      setYtAvatar(avatar || '');
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
  }, [searchParams]);

  const handleConnectYouTube = () => {
    window.location.href = '/api/auth/youtube';
  };

  const formatSubscribers = (count: string) => {
    const n = parseInt(count, 10);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-indigo-400" /> Connected Creator Accounts
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Manage OAuth connections to official YouTube, TikTok, and Instagram accounts.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Banner */}
      {ytConnected && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>YouTube channel <strong>{ytChannel}</strong> connected successfully! You can now auto-publish videos.</span>
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
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700/50">
                Not Connected
              </span>
            )}
          </div>

          {ytConnected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {ytAvatar && <img src={ytAvatar} alt="" className="w-8 h-8 rounded-full" />}
                <div>
                  <h3 className="text-base font-bold text-white">{ytChannel}</h3>
                  <p className="text-xs text-slate-400">{formatSubscribers(ytSubscribers)} subscribers</p>
                </div>
              </div>
              <a
                href={`https://youtube.com/channel/${ytChannelId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Channel
              </a>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-base font-bold text-white">YouTube Channel</h3>
                <p className="text-xs text-slate-400">Direct video publishing & channel analytics</p>
              </div>
              <button
                onClick={handleConnectYouTube}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white text-xs font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Youtube className="w-4 h-4" /> Connect YouTube
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
