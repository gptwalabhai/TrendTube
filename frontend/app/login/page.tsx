'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Flame, KeyRound, Sparkles, ShieldCheck, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email, name);
    router.push('/dashboard');
  };

  const handleAdminDemoLogin = () => {
    login('gptwalabhai@gmail.com', 'Admin GPTWalabhai');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-glass space-y-6 animate-in fade-in zoom-in-95">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-glow">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white">TrendTube AI</h1>
          <p className="text-xs text-slate-400">Viral Short-Form Discovery & YouTube Publishing Engine</p>
        </div>

        {/* Quick Admin Access Button */}
        <button
          onClick={handleAdminDemoLogin}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-purple-600/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-glow"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Login as Executive Admin (gptwalabhai@gmail.com)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-mono">Or Sign In with Email</span>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. gptwalabhai@gmail.com or your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Display Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. GPTWalabhai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow transition-all"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {user && (
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Currently signed in as <strong className="text-white">{user.email}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
