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
  Server,
  Layers,
  ArrowRight,
  Inbox
} from 'lucide-react';

interface JobItem {
  id: string;
  title: string;
  source_url: string;
  status: 'Pending' | 'Queued' | 'Downloading' | 'Generating Metadata' | 'Uploading' | 'Completed' | 'Failed' | 'Retrying' | 'Cancelled' | 'Scheduled';
  progress: number;
  youtube_video_id?: string;
  retry_count: number;
  created_at: string;
}

export default function YouTubePublishingPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setLoading(true);
    fetchJobs();

    // Auto-poll jobs stream every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateJob = async () => {
    if (!sourceUrl.trim()) return;
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceVideoUrl: sourceUrl,
          title: customTitle || 'New Viral Short Upload'
        })
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (e) {
      console.error('Create job error:', e);
    } finally {
      setShowCreateModal(false);
      setSourceUrl('');
      setCustomTitle('');
    }
  };

  const getStatusBadge = (status: JobItem['status']) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'Uploading':
      case 'Downloading':
      case 'Generating Metadata':
        return <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" /> {status}</span>;
      case 'Scheduled':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> Scheduled</span>;
      case 'Queued':
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {status}</span>;
      case 'Retrying':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Retrying</span>;
      case 'Failed':
        return <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono text-[11px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Youtube className="w-8 h-8 text-red-500" /> Cloudflare Queue Upload Stream
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Powered by Cloudflare Workers & Cloudflare Queues. Heavy processing runs off-main-thread with zero Vercel timeout limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Queue
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" /> Create Upload Job
          </button>
        </div>
      </div>

      {/* State Machine Legend */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Upload Job State Machine Pipeline:</span>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          {['Pending', 'Queued', 'Downloading', 'Generating Metadata', 'Uploading', 'Completed'].map((st, idx) => (
            <span key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              {st} {idx < 5 && <ArrowRight className="w-3 h-3 text-slate-600" />}
            </span>
          ))}
        </div>
      </div>

      {/* Upload Jobs Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Active Cloudflare Queue Stream
          </h3>
          <span className="text-xs text-slate-400 font-mono font-bold">{jobs.length} Active Jobs</span>
        </div>

        {jobs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No active upload jobs in Cloudflare Queue</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Push a video URL from Trend Discovery or click Create First Upload Job below.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-glow"
            >
              <Plus className="w-4 h-4" /> Create First Upload Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Upload Job Details</th>
                  <th className="py-3 px-4">Worker Pipeline Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Created Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{item.source_url}</p>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4 w-40">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>{item.progress}%</span>
                          <span>{item.retry_count > 0 ? `Retry ${item.retry_count}/3` : ''}</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-glow"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.youtube_video_id ? (
                        <a
                          href={`https://youtu.be/${item.youtube_video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 text-xs font-semibold inline-flex items-center gap-1 hover:bg-red-600/30"
                        >
                          <ExternalLink className="w-3 h-3" /> YouTube Video
                        </a>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">In Queue</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Upload Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-glass animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" /> Push UploadJob to Cloudflare Queue
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block font-semibold">Source TikTok / Reel Video URL</label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://tiktok.com/@creator/video/101..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block font-semibold font-sans">Custom Title (Optional - AI Generates if Empty)</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. 5 Secret AI Tools for 10x Productivity"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-glow"
              >
                Push Job to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
