'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Flame,
  Search,
  Sparkles,
  Youtube,
  Check,
  Play,
  X,
  Plus,
  Download,
  FolderPlus,
  CheckSquare,
  Square,
  Inbox,
  Zap,
  Calendar,
  Send,
  Clock
} from 'lucide-react';

interface VideoItem {
  id: string;
  external_id: string;
  platform: string;
  url: string;
  author_handle: string;
  author_name: string;
  author_avatar: string;
  title: string;
  caption: string;
  thumbnail_url: string;
  video_url: string;
  duration_seconds: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  published_at: string;
  category: string;
  virality_score: number;
  trend_score: number;
  outlier_score: number;
  growth_velocity: number;
  engagement_rate: number;
}

/**
 * TikTok 9:16 Vertical Video Card Component
 * Supports Hover Auto-Play Preview Video + TikTok Overlay Badges & View Counts
 */
function TikTokVideoCard({
  vid,
  isSelected,
  onToggleSelect,
  onOpenPreview,
  onSchedule,
  formatCount
}: {
  vid: VideoItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenPreview: (vid: VideoItem) => void;
  onSchedule: (vid: VideoItem) => void;
  formatCount: (n: number) => string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl bg-slate-950 border transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:scale-[1.02] ${
        isSelected ? 'border-indigo-500 shadow-glow ring-2 ring-indigo-500/50' : 'border-slate-800/80 hover:border-indigo-500/50'
      }`}
    >
      {/* 9:16 TikTok Vertical Video Aspect Container */}
      <div className="relative aspect-[9/16] bg-slate-950 overflow-hidden cursor-pointer">
        {/* Cover Thumbnail Image */}
        <img
          src={vid.thumbnail_url}
          alt={vid.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${vid.id}/540/960`;
          }}
        />

        {/* Hover Auto-Play MP4 Video Element */}
        <video
          ref={videoRef}
          src={vid.video_url}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Dark Gradient Overlay for Clean Text Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none"></div>

        {/* Top Badges & Select Checkbox */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(vid.id);
              }}
              className={`p-1.5 rounded-lg border backdrop-blur-md transition-all ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-black/60 border-white/20 text-slate-300 hover:text-white'
              }`}
            >
              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>

            {vid.virality_score > 75 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-glow flex items-center gap-1">
                Pinned
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(vid);
            }}
            className="p-1.5 rounded-full bg-black/60 border border-white/20 hover:bg-rose-600 text-white backdrop-blur-md transition-all"
            title="Expand Fullscreen Video"
          >
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </button>
        </div>

        {/* Bottom Overlay Metrics matching Screenshot */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1 z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-black font-mono flex items-center gap-1 drop-shadow-md">
              <Play className="w-3 h-3 fill-white" /> {formatCount(vid.views_count)}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
              {vid.outlier_score}x Outlier
            </span>
          </div>

          <p className="text-xs font-semibold text-white/95 line-clamp-2 leading-snug drop-shadow-md">
            {vid.title || vid.caption}
          </p>
        </div>
      </div>

      {/* Footer Quick Action Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 truncate">
          <img
            src={vid.author_avatar}
            className="w-5 h-5 rounded-full border border-slate-700"
            alt=""
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${vid.author_handle}`;
            }}
          />
          <span className="font-semibold text-slate-300 text-[11px] truncate">@{vid.author_handle}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSchedule(vid)}
            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1"
          >
            <Calendar className="w-3 h-3" /> Schedule
          </button>
          <a
            href={`/api/download?url=${encodeURIComponent(vid.video_url)}`}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
            title="Download MP4"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function TrendDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams ? searchParams.get('url') || '' : '';
  const { user, updateUserCredits, setCreditModalOpen } = useAuth();

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Playback & Selection
  const [activePreviewVideo, setActivePreviewVideo] = useState<VideoItem | null>(null);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  // Playlist state
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Scheduling state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [publishing, setPublishing] = useState(false);

  const fetchUserPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists');
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.playlists || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const handleScrapeProfile = async () => {
    const target = inputUrl.trim();
    if (!target) return;

    if (user && user.credits < 500) {
      setCreditModalOpen(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    try {
      const res = await fetch('/api/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_or_handle: target })
      });

      if (res.status === 402) {
        setCreditModalOpen(true);
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.videos)) {
        setVideos(json.videos);
        if (json.newBalance !== undefined) {
          updateUserCredits(json.newBalance);
        }
        if (json.videos.length === 0) {
          setErrorMsg('No videos found for this profile. Try a different handle.');
        }
      } else {
        setErrorMsg(json.error || json.message || 'Failed to scrape videos.');
        setVideos([]);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error connecting to scraper.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectVideo = (id: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideoIds.length === videos.length) {
      setSelectedVideoIds([]);
    } else {
      setSelectedVideoIds(videos.map((v) => v.id));
    }
  };

  // Direct MP4 Download proxy without AccessDenied XML errors
  const handleBulkDownload = () => {
    const selected = videos.filter((v) => selectedVideoIds.includes(v.id));
    if (selected.length === 0) return;

    selected.forEach((v) => {
      const downloadUrl = `/api/download?url=${encodeURIComponent(v.video_url)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `trendtube_${v.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleSaveToPlaylist = async (playlistId: string) => {
    const targetVideos = videos.filter((v) => selectedVideoIds.includes(v.id));
    if (targetVideos.length === 0) return;

    for (const vid of targetVideos) {
      await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_video', playlistId, videoData: vid })
      });
    }

    setSuccessMsg(`Successfully saved ${targetVideos.length} videos to playlist!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setIsPlaylistModalOpen(false);
    setSelectedVideoIds([]);
    fetchUserPlaylists();
  };

  const handleCreatePlaylistAndAdd = async () => {
    if (!newPlaylistName.trim()) return;

    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlaylistName })
    });

    if (res.ok) {
      const json = await res.json();
      setNewPlaylistName('');
      await handleSaveToPlaylist(json.playlist.id);
    }
  };

  // Instant Publish / Upload Action
  const handleInstantPublishSelected = async () => {
    const selected = videos.filter((v) => selectedVideoIds.includes(v.id));
    if (selected.length === 0) return;

    if (user && user.credits < selected.length * 1000) {
      setCreditModalOpen(true);
      return;
    }

    setPublishing(true);
    let successCount = 0;

    for (const vid of selected) {
      try {
        const res = await fetch('/api/jobs/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceVideoUrl: vid.video_url,
            title: vid.title,
            visibility: 'public'
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.newBalance !== undefined) updateUserCredits(json.newBalance);
          successCount++;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setPublishing(false);
    setSuccessMsg(`Queued ${successCount} videos for instant YouTube Shorts publishing!`);
    setTimeout(() => setSuccessMsg(null), 5000);
    setSelectedVideoIds([]);
  };

  // Scheduled Upload Action
  const handleScheduleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = videos.filter((v) => selectedVideoIds.includes(v.id));
    if (selected.length === 0) return;

    if (user && user.credits < selected.length * 1000) {
      setCreditModalOpen(true);
      return;
    }

    setPublishing(true);
    let successCount = 0;

    for (const vid of selected) {
      try {
        const res = await fetch('/api/jobs/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceVideoUrl: vid.video_url,
            title: customTitle || vid.title,
            visibility,
            scheduleTime
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.newBalance !== undefined) updateUserCredits(json.newBalance);
          successCount++;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setPublishing(false);
    setIsScheduleModalOpen(false);
    setSuccessMsg(`Successfully scheduled ${successCount} videos for YouTube Shorts publishing!`);
    setTimeout(() => setSuccessMsg(null), 5000);
    setSelectedVideoIds([]);
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-rose-500 animate-pulse" /> Creator Trend Workflow Studio
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Hover over video cards for instant video previews. Scrape creator profiles, save to playlists, and publish to YouTube.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-300">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          <span>Search: 500 pts • Upload: 1,000 pts</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-glass flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrapeProfile()}
            placeholder="Enter creator handle (e.g. @aloocmpire) or paste TikTok/IG URL..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleScrapeProfile}
          disabled={loading || !inputUrl.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{loading ? 'Analyzing...' : 'Scrape & Analyze (-500 pts)'}</span>
        </button>
      </div>

      {/* Multi-Select Action Workflow Bar */}
      {videos.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xl">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 font-bold text-white hover:text-indigo-300 transition-colors"
          >
            {selectedVideoIds.length === videos.length ? (
              <CheckSquare className="w-5 h-5 text-indigo-400" />
            ) : (
              <Square className="w-5 h-5 text-slate-500" />
            )}
            <span>Select All ({selectedVideoIds.length}/{videos.length} selected)</span>
          </button>

          {selectedVideoIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in">
              <button
                onClick={() => setIsPlaylistModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md"
              >
                <FolderPlus className="w-4 h-4" /> Save to Playlist
              </button>
              <button
                onClick={handleInstantPublishSelected}
                disabled={publishing}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white font-semibold flex items-center gap-1.5 shadow-glow"
              >
                <Send className="w-4 h-4" /> Publish Instantly
              </button>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Calendar className="w-4 h-4" /> Schedule Upload
              </button>
              <button
                onClick={handleBulkDownload}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Download MP4 Files
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error & Success Banners */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <a href="/publishing" className="text-white underline font-mono text-[11px]">View Queue →</a>
        </div>
      )}

      {/* Empty State */}
      {!searched && videos.length === 0 && !loading && (
        <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Paste a profile to start scraping</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Enter a creator handle like <code className="text-indigo-300">@aloocmpire</code> above to extract video metrics and run creator workflows.
          </p>
        </div>
      )}

      {/* TikTok 9:16 Vertical Videos Grid */}
      {videos.length > 0 && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {videos.map((vid) => (
            <TikTokVideoCard
              key={vid.id}
              vid={vid}
              isSelected={selectedVideoIds.includes(vid.id)}
              onToggleSelect={toggleSelectVideo}
              onOpenPreview={(v) => setActivePreviewVideo(v)}
              onSchedule={(v) => {
                setSelectedVideoIds([v.id]);
                setIsScheduleModalOpen(true);
              }}
              formatCount={formatCount}
            />
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {activePreviewVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white truncate max-w-xs">{activePreviewVideo.title}</h3>
              <button
                onClick={() => setActivePreviewVideo(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[9/16] max-h-[70vh] bg-black flex items-center justify-center">
              <video
                src={activePreviewVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-between text-xs text-slate-300">
              <span>Author: {activePreviewVideo.author_handle}</span>
              <a
                href={`/api/download?url=${encodeURIComponent(activePreviewVideo.video_url)}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download MP4
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Save to Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-glass animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" /> Save {selectedVideoIds.length} Videos to Playlist
              </h3>
              <button onClick={() => setIsPlaylistModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Playlists */}
            {playlists.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Select Existing Playlist:
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => handleSaveToPlaylist(pl.id)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left text-xs font-semibold text-white flex justify-between items-center transition-all"
                    >
                      <span>{pl.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{pl.videos_count || 0} videos</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Playlist */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Or Create New Playlist:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Viral Shorts Series 2026"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
                <button
                  onClick={handleCreatePlaylistAndAdd}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Create & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Upload Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-glass animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Schedule {selectedVideoIds.length} YouTube Shorts
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Publish Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Custom Title (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty to use original video title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px]">
                ⚡ Cost: {selectedVideoIds.length * 1000} credits ({selectedVideoIds.length} videos × 1,000 pts)
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-1.5"
                >
                  {publishing ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrendDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrendDiscoveryContent />
    </Suspense>
  );
}
