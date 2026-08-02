'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  credits: number;
  subscription_plan: string;
  subscription_status: string;
  uploads_count: number;
  searches_count: number;
  createdAt: string;
  isYouTubeConnected?: boolean;
  youtubeAccount?: {
    channel_id: string;
    account_handle: string;
    account_name: string;
    avatar_url: string;
    subscriber_count: number;
    total_views: number;
    total_videos: number;
    is_connected: boolean;
  } | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isCreditModalOpen: boolean;
  setCreditModalOpen: (open: boolean) => void;
  refreshUser: () => Promise<void>;
  login: (data: { email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserCredits: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreditModalOpen, setCreditModalOpen] = useState(false);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({
            ...data.user,
            createdAt: data.user.created_at || new Date().toISOString(),
            isYouTubeConnected: !!data.youtubeAccount,
            youtubeAccount: data.youtubeAccount || null
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password?: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      await refreshUser();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error during login' };
    }
  };

  const register = async (details: { name: string; email: string; password?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      await refreshUser();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error during registration' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const updateUserCredits = (newBalance: number) => {
    if (user) {
      setUser({ ...user, credits: newBalance });
      if (newBalance <= 0) {
        setCreditModalOpen(true);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCreditModalOpen,
        setCreditModalOpen,
        refreshUser,
        login,
        register,
        logout,
        updateUserCredits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
