'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  Users,
  CreditCard,
  UserPlus,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  Sparkles,
  Server,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export default function AdminPanelPage() {
  const { user, allUsers, addNewUser, addCreditsToUser, removeUser } = useAuth();

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserCredits, setNewUserCredits] = useState(1000);
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

  const [selectedUserForCredits, setSelectedUserForCredits] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState(1000);

  const isAdmin = user?.email.toLowerCase() === 'gptwalabhai@gmail.com' || user?.role === 'admin';

  // Strict Access Control Guard
  if (!isAdmin) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400 max-w-md">
          The Executive Admin Panel is restricted exclusively to <code className="text-amber-300 font-mono">gptwalabhai@gmail.com</code>.
        </p>
      </div>
    );
  }

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    addNewUser(newUserEmail, newUserName, newUserCredits, newUserRole);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserCredits(1000);
  };

  const handleGrantCreditsSubmit = (userId: string) => {
    addCreditsToUser(userId, Number(creditAmount));
    setSelectedUserForCredits(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-amber-400" /> Executive Admin Control Center
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Provision user accounts, grant AI trend analysis credits, and manage system access for <code className="text-amber-300 font-mono">gptwalabhai@gmail.com</code>.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Total System Users</span>
          <p className="text-2xl font-bold font-display text-white">{allUsers.length}</p>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Provisioned
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Total Credits Allocated</span>
          <p className="text-2xl font-bold font-display text-indigo-400">
            {allUsers.reduce((sum, u) => sum + u.credits, 0).toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 font-medium">Across all accounts</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Admin Account</span>
          <p className="text-sm font-mono font-bold text-amber-300 truncate">gptwalabhai@gmail.com</p>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Executive Rights Granted
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-2">Scraper APIs Status</span>
          <p className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Apify & Gemini Active
          </p>
          <span className="text-xs text-slate-500 font-medium">Production Serverless</span>
        </div>
      </div>

      {/* Add New User Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-glass space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-400" /> Provision New User Account
        </h3>

        <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="email"
            required
            placeholder="User Email (e.g. creator@domain.com)"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Display Name (optional)"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newUserCredits}
            onChange={(e) => setNewUserCredits(Number(e.target.value))}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value={1000}>1,000 Initial Credits</option>
            <option value={2500}>2,500 Initial Credits</option>
            <option value={5000}>5,000 Initial Credits</option>
            <option value={10000}>10,000 Initial Credits</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" /> Add User Account
          </button>
        </form>
      </div>

      {/* Registered Users Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Active Platform Users ({allUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">User / Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Available Credits</th>
                <th className="p-3">YouTube Status</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} className="w-7 h-7 rounded-full bg-slate-900" alt="" />
                      <div>
                        <span className="font-semibold text-white block">{u.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {u.role === 'admin' ? '👑 Admin' : 'Creator'}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-indigo-300">
                    {u.credits.toLocaleString()} / {u.maxCredits.toLocaleString()}
                  </td>
                  <td className="p-3">
                    {u.isYouTubeConnected ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Connected</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400 font-mono">{u.createdAt}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedUserForCredits(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-[11px] font-medium transition-colors"
                    >
                      + Add Credits
                    </button>
                    {u.email.toLowerCase() !== 'gptwalabhai@gmail.com' && (
                      <button
                        onClick={() => removeUser(u.id)}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Modal Popup */}
      {selectedUserForCredits && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm w-full space-y-4 shadow-glass animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Grant Credits to User
            </h3>
            <p className="text-xs text-slate-400">Select amount of AI Trend credits to add to this user account:</p>

            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCreditAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    creditAmount === amt ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForCredits(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGrantCreditsSubmit(selectedUserForCredits)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
