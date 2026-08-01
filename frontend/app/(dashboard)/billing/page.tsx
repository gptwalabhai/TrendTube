'use client';

import React, { useState } from 'react';
import { CreditCard, Check, Zap, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Creator',
      price: billingCycle === 'monthly' ? '$29' : '$24',
      description: 'Ideal for individual creators launching YouTube Shorts & TikTok channels.',
      features: [
        '1,000 AI Trend Discoveries / mo',
        '5 Connected Creator Accounts',
        'Basic AI Script & Hook Generator',
        'Standard Scraping Engine Speed'
      ],
      current: false
    },
    {
      id: 'pro',
      name: 'Pro Creator & Agency',
      price: billingCycle === 'monthly' ? '$79' : '$64',
      description: 'Maximum power for serious creators scaling viral audiences.',
      features: [
        'Unlimited AI Trend Discoveries',
        '25 Connected Creator Accounts',
        'Full AI Studio Suite & Unlimited Scripts',
        'Automated YouTube Shorts Scheduler',
        'Priority Proxy Scraping Queue'
      ],
      isPopular: true,
      current: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      price: billingCycle === 'monthly' ? '$249' : '$199',
      description: 'Custom proxy infrastructure, webhooks, and team access.',
      features: [
        'Dedicated Scraping Proxies & Webhooks',
        'Unlimited Connected Accounts',
        'Unlimited Team Members & RBAC Roles',
        '24/7 Dedicated Account Manager'
      ],
      current: false
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-indigo-400" /> Subscription Billing & Tier Plans
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Powered by Stripe Customer Portal. Upgrade or adjust your subscription anytime.
        </p>
      </div>

      {/* Cycle Toggle */}
      <div className="flex justify-center">
        <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center text-xs font-semibold">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Yearly Billing <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono">SAVE 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-3xl border flex flex-col justify-between relative ${
              plan.isPopular
                ? 'bg-gradient-to-b from-indigo-950/40 to-slate-900 border-indigo-500/50 shadow-glow'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-glow">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-extrabold font-display text-white">{plan.price}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <div className="space-y-2.5 my-6">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                plan.current
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow'
              }`}
            >
              {plan.current ? 'Current Plan' : 'Upgrade Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
