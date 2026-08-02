'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { PurchaseCreditsModal } from '@/components/modals/PurchaseCreditsModal';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AuthProvider>
        <div className="bg-[#090a0f] min-h-screen text-slate-100">{children}</div>
      </AuthProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-[#090a0f] min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
          {children}
          <PurchaseCreditsModal />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
