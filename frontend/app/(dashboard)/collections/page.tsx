'use client';

import React, { useState } from 'react';
import {
  FolderHeart,
  FolderPlus,
  Star,
  Tag,
  Search,
  Plus,
  Trash2,
  Bookmark,
  StickyNote,
  MoreVertical,
  SlidersHorizontal,
  Folder
} from 'lucide-react';

export default function CollectionsPage() {
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [collections, setCollections] = useState([
    {
      id: 'col-1',
      name: '🔥 Viral AI Short Form',
      description: 'Top performing AI tool breakdowns and hook frameworks',
      color: '#6366F1',
      tags: ['AI', 'Shorts', 'Hooks'],
      is_favorite: true,
      video_count: 12
    },
    {
      id: 'col-2',
      name: '💼 SaaS Growth Strategies',
      description: 'Case studies and viral founder stories',
      color: '#10B981',
      tags: ['SaaS', 'Business'],
      is_favorite: false,
      video_count: 8
    },
    {
      id: 'col-3',
      name: '🎨 High Retention Visuals',
      description: 'Fast-paced video editing styles and sound effects',
      color: '#F59E0B',
      tags: ['Editing', 'Design'],
      is_favorite: true,
      video_count: 19
    }
  ]);

  const [savedVideos, setSavedVideos] = useState([
    {
      id: 'sv1',
      title: '5 AI Secret Tools You Did Not Know Existed',
      author: '@techmindset',
      platform: 'youtube',
      views: '2.4M',
      virality: 98.4,
      notes: 'Study the opening visual hook (1.5s transition). Great background audio.',
      folder_id: 'col-1',
      thumbnail: 'https://picsum.photos/seed/colv1/600/800'
    },
    {
      id: 'sv2',
      title: 'How I Built a $10k/mo Micro SaaS in 48 Hours',
      author: '@saasbuilder',
      platform: 'tiktok',
      views: '1.8M',
      virality: 94.1,
      notes: 'Revenue dashboard proof point at start creates instant authority.',
      folder_id: 'col-2',
      thumbnail: 'https://picsum.photos/seed/colv2/600/800'
    }
  ]);

  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newCol = {
      id: `col-${Date.now()}`,
      name: newFolderName,
      description: newFolderDesc,
      color: '#6366F1',
      tags: ['Research'],
      is_favorite: false,
      video_count: 0
    };
    setCollections([...collections, newCol]);
    setNewFolderName('');
    setNewFolderDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderHeart className="w-7 h-7 text-indigo-400" /> Research Collections
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Organize viral video inspiration into custom folders, tags, and creator notes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all"
        >
          <FolderPlus className="w-4 h-4" /> Create New Folder
        </button>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map((col) => (
          <div
            key={col.id}
            onClick={() => setActiveFolder(col.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeFolder === col.id
                ? 'bg-indigo-950/30 border-indigo-500/50 shadow-glow'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: `${col.color}25`, color: col.color, border: `1px solid ${col.color}40` }}>
                    <Folder className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">{col.name}</h3>
                </div>
                {col.is_favorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{col.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono font-medium text-indigo-300">{col.video_count} Videos Saved</span>
              <div className="flex gap-1">
                {col.tags.map((t, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Saved Videos in Selected Folder */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-indigo-400" /> Saved Inspiration Items
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedVideos.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex gap-4">
              <div className="w-24 h-32 rounded-xl bg-slate-950 overflow-hidden flex-shrink-0 relative">
                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-rose-500/90 text-white font-mono text-[9px] font-bold">
                  {item.virality}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">{item.author} • {item.views} views</p>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <StickyNote className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="italic text-[11px] text-slate-400 line-clamp-2">{item.notes}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-indigo-400 text-[10px]">Saved Item</span>
                  <button className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-glass animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-400" /> New Collection Folder
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. 🎯 High Hook Retention"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Description</label>
                <textarea
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="What type of trends will be saved here?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
