'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  Filter
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

function TrendDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams ? searchParams.get('url') || '' : '';
  const { user, updateUserCredits, setCreditModalOpen } = useAuth();

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [pipelineProcessing, setPipelineProcessing] = useState<string | null>(null);
  const [pipelineSuccess, setPipelineSuccess] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Playback & Selection
  const [activePreviewVideo, setActivePreviewVideo] = useState<VideoItem | null>(null);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  // Playlist saving
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

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

    alert(`Successfully added ${targetVideos.length} videos to playlist!`);
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

  const handleBulkDownload = () => {
    const selected = videos.filter((v) => selectedVideoIds.includes(v.id));
    selected.forEach((v) => {
      window.open(v.video_url, '_blank');
    });
  };

  const handlePublishToYouTube = async (vidId: string, videoUrl: string, title: string) => {
    setPipelineProcessing(vidId);
    setPipelineSuccess(null);
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceVideoUrl: videoUrl, title })
      });
      if (res.ok) {
        setPipelineSuccess(vidId);
        setTimeout(() => setPipelineSuccess(null), 5000);
      } else {
        setErrorMsg('Failed to queue video for publishing.');
      }
    } catch (e) {
      setErrorMsg('Error creating publish job.');
    } finally {
      setPipelineProcessing(null);
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return String(n);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-rose-500 animate-pulse" /> Live Profile Scraper & Video Player
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Analyze TikTok, Instagram, or YouTube handles. Search costs <code className="text-amber-300 font-mono">500 credits</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-300">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          <span>Cost per Search: 500 Credits</span>
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
            placeholder="Enter creator handle (e.g. @wildtraillife) or paste video URL..."
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

      {/* Bulk Action Bar */}
      {videos.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 font-semibold text-slate-300 hover:text-white"
            >
              {selectedVideoIds.length === videos.length ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Select All ({selectedVideoIds.length}/{videos.length})</span>
            </button>
          </div>

          {selectedVideoIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <button
                onClick={() => setIsPlaylistModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" /> Save to Playlist
              </button>
              <button
                onClick={handleBulkDownload}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-start gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Pipeline Success Banner */}
      {pipelineSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Video queued for YouTube publishing!</span>
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
            Enter a TikTok handle like <code className="text-indigo-300">@wildtraillife</code> above and click <strong>Scrape & Analyze Profile</strong>.
          </p>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => {
            const isSelected = selectedVideoIds.includes(vid.id);
            return (
              <div
                key={vid.id}
                className={`rounded-2xl bg-slate-900/60 border transition-all overflow-hidden flex flex-col justify-between group ${
                  isSelected ? 'border-indigo-500 shadow-glow' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                  <img
                    src={vid.thumbnail_url}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${vid.id}/600/800`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                  {/* Top Select & Play Controls */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <button
                      onClick={() => toggleSelectVideo(vid.id)}
                      className={`p-1.5 rounded-lg border backdrop-blur-md transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-black/60 border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setActivePreviewVideo(vid)}
                      className="p-2 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white shadow-glow transition-all"
                      title="Play Preview Video"
                    >
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {vid.outlier_score}x Outlier
                      </span>
                      <span className="text-[11px] text-slate-300 font-mono">
                        {formatCount(vid.views_count)} views
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {vid.title}
                    </h3>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 space-y-3 bg-slate-900/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <img
                        src={vid.author_avatar}
                        className="w-5 h-5 rounded-full"
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${vid.author_handle}`;
                        }}
                      />
                      <span className="font-medium text-slate-300">{vid.author_handle}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">{vid.engagement_rate}% ER</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handlePublishToYouTube(vid.id, vid.video_url, vid.title)}
                      disabled={pipelineProcessing === vid.id}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
                    >
                      {pipelineProcessing === vid.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Youtube className="w-4 h-4 fill-white" />
                      )}
                      <span>Push & Upload (-1,000 pts)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
                onError={(e) => {
                  console.error('Video player load fallback error');
                }}
              />
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-between text-xs text-slate-300">
              <span>Author: {activePreviewVideo.author_handle}</span>
              <a
                href={activePreviewVideo.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline"
              >
                Open Original Link ↗
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
                  placeholder="e.g. Viral Wildlife Shorts 2026"
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
