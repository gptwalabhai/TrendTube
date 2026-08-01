'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    // Dark mode is set via className="dark" on <body>; no runtime toggle needed.
  }, []);

  if (!mounted) {
    return <div className="bg-[#090a0f] min-h-screen text-slate-100">{children}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-[#090a0f] min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </div>
    </QueryClientProvider>
  );
}
