'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Users,
  CreditCard,
  UserPlus,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  Sparkles,
  Search,
  Activity,
  AlertTriangle,
  RefreshCw,
  Ban,
  KeyRound,
  Youtube,
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  credits: number;
  subscription_plan: string;
  subscription_status: string;
  uploads_count: number;
  searches_count: number;
  is_banned: boolean;
  created_at: string;
  youtube_handle?: string;
  youtube_connected?: boolean;
}

interface AdminStats {
  totalUsers: number;
  totalCredits: number;
  totalSearches: number;
  totalUploads: number;
  connectedChannels: number;
  estimatedRevenue: string;
}

export default function ExecutiveAdminPanelPage() {
  const { user, login, loading: authLoading, refreshUser } = useAuth();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchLogs, setSearchLogs] = useState<any[]>([]);
  const [uploadLogs, setUploadLogs] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'logs'>('users');

  // Inline Admin Login Form state for /alyautomates
  const [adminLoginEmail, setAdminLoginEmail] = useState('gptwalabhai@gmail.com');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // User provision form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserCredits, setNewUserCredits] = useState(10000);
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

  // Action modals
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<PlatformUser | null>(null);
  const [creditAmount, setCreditAmount] = useState(5000);
  const [resetPassUser, setResetPassUser] = useState<PlatformUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
      }
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
        setSearchLogs(sData.searchHistory || []);
        setUploadLogs(sData.uploadHistory || []);
        setAdminLogs(sData.adminLogs || []);
        setErrorLogs(sData.errorLogs || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleAdminDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    setAdminSubmitting(true);

    try {
      const res = await login({ email: adminLoginEmail, password: adminLoginPassword });
      if (res.success) {
        await refreshUser();
      } else {
        setAdminLoginError(res.error || 'Invalid Admin Credentials');
      }
    } catch (err: any) {
      setAdminLoginError(err.message || 'Login failed');
    } finally {
      setAdminSubmitting(false);
    }
  };

  // Auth Loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-slate-400 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-amber-400" /> Verifying Executive Admin Credentials...
      </div>
    );
  }

  // Render Executive Admin Login Portal when visiting /alyautomates unauthenticated or as non-admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-xl animate-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-glow">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Executive Admin Portal</h1>
            <p className="text-xs text-amber-300/80 font-mono">/alyautomates</p>
            <p className="text-xs text-slate-400">
              Restricted portal. Authenticate with master admin credentials to unlock system control.
            </p>
          </div>

          {adminLoginError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
              ⚠️ {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminDirectLogin} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-semibold">Admin Email</label>
              <input
                type="email"
                required
                value={adminLoginEmail}
                onChange={(e) => setAdminLoginEmail(e.target.value)}
                placeholder="admin@trendtube.ai"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1 block font-semibold">Admin Master Password</label>
              <input
                type="password"
                required
                value={adminLoginPassword}
                onChange={(e) => setAdminLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={adminSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white text-sm font-bold shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {adminSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Unlock Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName,
          password: newUserPassword,
          credits: newUserCredits,
          role: newUserRole
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`User ${newUserEmail} created successfully with ${newUserCredits} credits!`);
        setNewUserEmail('');
        setNewUserName('');
        setNewUserPassword('');
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedUserForCredits) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForCredits.id,
          action: 'add_credits',
          amount: creditAmount
        })
      });

      if (res.ok) {
        setSelectedUserForCredits(null);
        fetchAdminData();
      } else {
        alert('Failed to add credits');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBan = async (targetUser: PlatformUser) => {
    const action = targetUser.is_banned ? 'unban_user' : 'ban_user';
    if (!confirm(`Are you sure you want to ${targetUser.is_banned ? 'unban' : 'ban'} ${targetUser.email}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id, action })
      });

      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Failed to update user ban status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassUser || !newPasswordInput) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resetPassUser.id,
          action: 'reset_password',
          newPassword: newPasswordInput
        })
      });

      if (res.ok) {
        alert(`Password for ${resetPassUser.email} reset successfully!`);
        setResetPassUser(null);
        setNewPasswordInput('');
      } else {
        alert('Failed to reset password');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Permanently delete account ${email}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Admin Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-400 rounded-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Executive Control Panel</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                /alyautomates
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as <code className="text-amber-300 font-mono">{user.email}</code> — Full Database & System Control
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Total SaaS Users</span>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalUsers ?? users.length}</p>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Neon Database Synced
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Total System Credits</span>
          <p className="text-2xl font-black text-indigo-400 font-mono">
            {stats?.totalCredits.toLocaleString() ?? '0'}
          </p>
          <span className="text-[11px] text-slate-500">Allocated to creators</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Total Searches Executed</span>
          <p className="text-2xl font-black text-purple-400 font-mono">{stats?.totalSearches ?? 0}</p>
          <span className="text-[11px] text-slate-500">TikTok & IG Scrapes</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Connected YT Channels</span>
          <p className="text-2xl font-black text-red-400 font-mono">{stats?.connectedChannels ?? 0}</p>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <Youtube className="w-3.5 h-3.5" /> Persistent OAuth Active
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Estimated ARR</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">${stats?.estimatedRevenue ?? '0'}</p>
          <span className="text-[11px] text-slate-500">Base Pro Subscription</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'analytics' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> Activity & Usage Logs
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'logs' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Admin Audit & Error Stream
        </button>
      </div>

      {/* TAB 1: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Create User Form */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" /> Provision New Creator Account
            </h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <input
                type="password"
                required
                placeholder="Password (min 6 chars)"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newUserCredits}
                onChange={(e) => setNewUserCredits(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={10000}>10,000 Initial Credits</option>
                <option value={25000}>25,000 Initial Credits</option>
                <option value={50000}>50,000 Initial Credits</option>
                <option value={100000}>100,000 Initial Credits</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Provision User
              </button>
            </form>
          </div>

          {/* Users Table */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">User & Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Credit Balance</th>
                    <th className="p-3">YouTube Status</th>
                    <th className="p-3">Searches / Uploads</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-medium text-white">
                        <div>
                          <span className="block font-bold">{u.name || 'User'}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-300">
                        {u.credits.toLocaleString()} pts
                      </td>
                      <td className="p-3">
                        {u.youtube_connected ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                          </span>
                        ) : (
                          <span className="text-slate-500">Not Connected</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {u.searches_count} / {u.uploads_count}
                      </td>
                      <td className="p-3">
                        {u.is_banned ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold text-[10px]">Banned</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Active</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedUserForCredits(u)}
                          className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-[11px] font-medium"
                        >
                          + Credits
                        </button>
                        <button
                          onClick={() => setResetPassUser(u)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {u.email !== user.email && (
                          <>
                            <button
                              onClick={() => handleToggleBan(u)}
                              className={`p-1 rounded ${u.is_banned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}
                              title={u.is_banned ? 'Unban User' : 'Ban User'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/30 text-rose-400"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Activity Logs */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" /> Recent Search Queries ({searchLogs.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchLogs.map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{s.query}</span>
                    <span className="text-[11px] text-slate-400">{s.user_email} • {s.platform}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-indigo-400 font-mono font-bold">-{s.credits_deducted} pts</span>
                    <span className="block text-[10px] text-slate-500">{new Date(s.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-400" /> Recent YouTube Uploads ({uploadLogs.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadLogs.map((u) => (
                <div key={u.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block truncate max-w-xs">{u.custom_title || u.source_video_url}</span>
                    <span className="text-[11px] text-slate-400">{u.user_email}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      {u.status}
                    </span>
                    <span className="block text-[10px] text-slate-500">{new Date(u.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: System Logs */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Audit Stream
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {adminLogs.map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-amber-300 font-bold">
                    <span>{l.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(l.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 mt-1 text-[11px]">{l.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> System Error Stream
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {errorLogs.map((e) => (
                <div key={e.id} className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/50">
                  <div className="flex justify-between text-rose-400 font-bold">
                    <span>{e.endpoint}</span>
                    <span className="text-[10px] text-slate-500">{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 mt-1 text-[11px]">{e.error_message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grant Credits Modal */}
      {selectedUserForCredits && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Grant Credits to {selectedUserForCredits.name}
            </h3>
            <p className="text-xs text-slate-400">Specify credit amount to add to balance:</p>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedUserForCredits(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCredits}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" /> Reset Password for {resetPassUser.email}
            </h3>
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setResetPassUser(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
