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
  Inbox,
  Link2
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

  const getStatusBadge = (item: JobItem) => {
    switch (item.status) {
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'Uploading':
      case 'Downloading':
      case 'Generating Metadata':
        return <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" /> {item.status}</span>;
      case 'Scheduled':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> Scheduled</span>;
      case 'Queued':
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px] font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.status}</span>;
      case 'Failed':
        return (
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[11px] font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Upload Failed
            </span>
            {item.failure_reason && (
              <p className="text-[10px] text-rose-300/80 max-w-xs">{item.failure_reason}</p>
            )}
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
            <Youtube className="w-8 h-8 text-red-500" /> YouTube Direct Upload Pipeline
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Uploads videos directly to Google YouTube Data API v3 using your persistent YouTube OAuth connection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/accounts"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20"
          >
            <Link2 className="w-4 h-4" /> YouTube Channel Settings
          </a>
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Queue
          </button>
        </div>
      </div>

      {/* Upload Jobs Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Active YouTube Upload Jobs
          </h3>
          <span className="text-xs text-slate-400 font-mono font-bold">{jobs.length} Active Jobs</span>
        </div>

        {jobs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No active upload jobs</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select videos on Trend Discovery and click Publish Instantly or Schedule Upload.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Upload Job Details</th>
                  <th className="py-3 px-4">Status & Reason</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Created Time</th>
                  <th className="py-3 px-4 text-right font-sans">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{item.source_url}</p>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(item)}</td>
                    <td className="py-3.5 px-4 w-40">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 shadow-glow ${
                              item.status === 'Completed' ? 'bg-emerald-500' : item.status === 'Failed' ? 'bg-rose-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      {item.youtube_video_id && !item.youtube_video_id.startsWith('yt_') ? (
                        <a
                          href={`https://youtu.be/${item.youtube_video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-glow"
                        >
                          <ExternalLink className="w-3 h-3" /> YouTube Video
                        </a>
                      ) : item.status === 'Failed' ? (
                        <a
                          href="/accounts"
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 inline-flex items-center gap-1"
                        >
                          Connect Channel
                        </a>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">Processing...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
