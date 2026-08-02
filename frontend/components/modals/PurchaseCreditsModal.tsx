'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Zap, CheckCircle2, Shield, X, Sparkles } from 'lucide-react';

export function PurchaseCreditsModal() {
  const { user, isCreditModalOpen, setCreditModalOpen, refreshUser } = useAuth();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  if (!isCreditModalOpen) return null;

  const handlePurchase = async (pkgName: string, creditsAmount: number) => {
    setLoadingPackage(pkgName);
    try {
      const res = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: pkgName, amount: creditsAmount })
      });

      if (res.ok) {
        await refreshUser();
        setCreditModalOpen(false);
      } else {
        alert('Payment processing failed. Please try again.');
      }
    } catch (err) {
      console.error('Purchase error:', err);
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-indigo-500/10 to-purple-500/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Credit Limit Reached
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                  Balance: {user?.credits ?? 0} Credits
                </span>
              </h2>
              <p className="text-sm text-slate-400">Top up your credits to continue scraping trends and publishing YouTube Shorts.</p>
            </div>
          </div>
          <button
            onClick={() => setCreditModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Package 1 */}
          <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Starter</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$19</span>
                <span className="text-xs text-slate-400">/one-time</span>
              </div>
              <div className="mt-3 text-lg font-bold text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> 10,000 Credits
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 20 Trend Searches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 10 YouTube Uploads</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Delivery</li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase('Starter', 10000)}
              disabled={!!loadingPackage}
              className="mt-6 w-full py-2.5 px-4 bg-slate-800 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loadingPackage === 'Starter' ? 'Processing...' : 'Buy 10,000 Credits'}
            </button>
          </div>

          {/* Package 2 - Popular */}
          <div className="relative p-5 bg-gradient-to-b from-indigo-950/40 to-slate-950/80 rounded-xl border-2 border-indigo-500 shadow-lg flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-full tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" /> Most Popular
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Pro Automator</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$49</span>
                <span className="text-xs text-slate-400">/one-time</span>
              </div>
              <div className="mt-3 text-lg font-bold text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" /> 50,000 Credits
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> 100 Trend Searches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> 50 YouTube Uploads</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Gemini AI Metadata</li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase('Pro Automator', 50000)}
              disabled={!!loadingPackage}
              className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm shadow-md"
            >
              {loadingPackage === 'Pro Automator' ? 'Processing...' : 'Buy 50,000 Credits'}
            </button>
          </div>

          {/* Package 3 */}
          <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agency</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$99</span>
                <span className="text-xs text-slate-400">/one-time</span>
              </div>
              <div className="mt-3 text-lg font-bold text-purple-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> 150,000 Credits
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 300 Trend Searches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 150 YouTube Uploads</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Unlimited Playlists</li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase('Agency', 150000)}
              disabled={!!loadingPackage}
              className="mt-6 w-full py-2.5 px-4 bg-slate-800 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loadingPackage === 'Agency' ? 'Processing...' : 'Buy 150,000 Credits'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Secure 256-bit SSL Encrypted Transaction</span>
          </div>
          <button
            onClick={() => setCreditModalOpen(false)}
            className="text-slate-400 hover:text-white underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
