'use client';

import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Calendar,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  Plus,
  Zap,
  Layers,
  Inbox,
  Link2,
  RotateCcw,
  Trash2,
  XCircle
} from 'lucide-react';

interface JobItem {
  id: string;
  title: string;
  source_url: string;
  status: 'Pending' | 'Queued' | 'Downloading' | 'Generating Metadata' | 'Uploading' | 'Completed' | 'Failed' | 'Retrying' | 'Cancelled' | 'Scheduled';
  progress: number;
  youtube_video_id?: string;
  failure_reason?: string;
  retry_count: number;
  created_at: string;
}

export default function YouTubePublishingPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      }
    } catch (e) {
      console.log('Error fetching jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger job processor silently in background
  const triggerProcessor = async () => {
    try {
      await fetch('/api/jobs/process', { method: 'POST' });
    } catch (_) {}
  };

  useEffect(() => {
    setLoading(true);
    fetchJobs();
    triggerProcessor();

    const interval = setInterval(async () => {
      await fetchJobs();
      triggerProcessor();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryJob = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      const res = await fetch('/api/jobs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) await fetchJobs();
    } catch (e) {
      console.error('Retry error:', e);
    } finally {
      setRetryingId(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setDeletingId(jobId);
    try {
      const res = await fetch('/api/jobs/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllFailed = async () => {
    setDeletingAll(true);
    const failedJobs = jobs.filter((j) => j.status === 'Failed');
    for (const job of failedJobs) {
      try {
        await fetch('/api/jobs/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id })
        });
      } catch (_) {}
    }
    await fetchJobs();
    setDeletingAll(false);
  };

  const handleCreateJob = async () => {
    if (!sourceUrl.trim()) return;
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceVideoUrl: sourceUrl,
          title: customTitle || null
        })
      });
      if (res.ok) fetchJobs();
    } catch (e) {
      console.error('Create job error:', e);
    } finally {
      setShowCreateModal(false);
      setSourceUrl('');
      setCustomTitle('');
    }
  };

  const failedCount = jobs.filter((j) => j.status === 'Failed').length;
  const activeCount = jobs.filter((j) => !['Failed', 'Completed'].includes(j.status)).length;

  const getStatusBadge = (item: JobItem) => {
    switch (item.status) {
      case 'Completed':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'Uploading':
      case 'Downloading':
      case 'Generating Metadata':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[11px] font-bold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" /> {item.status}
          </span>
        );
      case 'Scheduled':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-[11px] font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-400" /> Scheduled
          </span>
        );
      case 'Queued':
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {item.status}
          </span>
        );
      case 'Failed':
        const isQuota = item.failure_reason?.includes('exceeded the number of videos');
        const isNoChannel = item.failure_reason?.includes('No connected YouTube channel');
        return (
          <div className="space-y-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[11px] font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {isQuota ? 'Quota Exceeded' : isNoChannel ? 'No Channel' : 'Upload Failed'}
            </span>
            <p className="text-[10px] text-rose-300/70 max-w-[200px]">
              {isQuota
                ? '⏳ YouTube daily limit hit. Auto-retries in 24h.'
                : isNoChannel
                ? 'Connect your YouTube channel first.'
                : item.failure_reason?.substring(0, 80) + '...'}
            </p>
          </div>
        );
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono text-[11px]">{item.status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Youtube className="w-8 h-8 text-red-500" /> YouTube Upload Pipeline
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            AI-powered upload engine — generates viral hooks, downloads TikTok videos, publishes to YouTube automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/accounts"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20"
          >
            <Link2 className="w-4 h-4" /> Channel Settings
          </a>
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-2xl font-bold text-white">{jobs.length}</p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Jobs</p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center">
          <p className="text-2xl font-bold text-indigo-300">{activeCount}</p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active / Queued</p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center">
          <p className="text-2xl font-bold text-rose-300">{failedCount}</p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Failed</p>
        </div>
      </div>

      {/* Upload Jobs Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Active YouTube Upload Jobs
          </h3>
          <div className="flex items-center gap-2">
            {failedCount > 0 && (
              <button
                onClick={handleDeleteAllFailed}
                disabled={deletingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deletingAll ? 'Clearing...' : `Clear All Failed (${failedCount})`}
              </button>
            )}
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No upload jobs</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Go to Trend Discovery, pick a video, and click Publish Instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Upload Job Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="font-semibold text-white line-clamp-2 leading-tight">{item.title || 'Processing...'}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{item.source_url}</p>
                      {item.retry_count > 0 && (
                        <span className="text-[10px] text-amber-400/70">Attempt {item.retry_count + 1}/3</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(item)}</td>
                    <td className="py-3.5 px-4 w-36">
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-mono">{item.progress}%</div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.status === 'Completed'
                                ? 'bg-emerald-500'
                                : item.status === 'Failed'
                                ? 'bg-rose-500'
                                : 'bg-indigo-500 animate-pulse'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* View on YouTube (if completed) */}
                        {item.youtube_video_id && !item.youtube_video_id.startsWith('yt_') && (
                          <a
                            href={`https://youtu.be/${item.youtube_video_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-glow"
                          >
                            <ExternalLink className="w-3 h-3" /> Watch
                          </a>
                        )}

                        {/* Connect Channel (if no channel) */}
                        {item.status === 'Failed' && item.failure_reason?.includes('No connected YouTube channel') && (
                          <a
                            href="/accounts"
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 inline-flex items-center gap-1"
                          >
                            <Link2 className="w-3 h-3" /> Connect
                          </a>
                        )}

                        {/* Retry button — shown for ALL failed jobs */}
                        {item.status === 'Failed' && (
                          <button
                            onClick={() => handleRetryJob(item.id)}
                            disabled={retryingId === item.id}
                            title="Retry this upload now"
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${retryingId === item.id ? 'animate-spin' : ''}`} />
                            {retryingId === item.id ? '...' : 'Retry'}
                          </button>
                        )}

                        {/* Delete button — shown for all jobs */}
                        <button
                          onClick={() => handleDeleteJob(item.id)}
                          disabled={deletingId === item.id}
                          title="Remove this job"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* YouTube Quota Info */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 font-semibold text-sm">YouTube Daily Upload Quota</p>
          <p className="text-amber-300/70 text-xs mt-0.5">
            YouTube allows ~6 uploads/day per API key. Quota-exceeded jobs auto-retry after 24h at midnight PST.
            To upload more, connect additional YouTube channels on the <a href="/accounts" className="underline">Accounts page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
