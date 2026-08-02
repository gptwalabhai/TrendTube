'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  credits: number;
  maxCredits: number;
  avatar: string;
  isYouTubeConnected: boolean;
  youtubeChannelName?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  addCreditsToUser: (userId: string, amount: number) => void;
  addNewUser: (email: string, name: string, credits: number, role: 'admin' | 'user') => void;
  removeUser: (userId: string) => void;
  setYouTubeConnected: (connected: boolean, channelName?: string) => void;
}

const DEFAULT_ADMIN_EMAIL = 'gptwalabhai@gmail.com';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-001',
    email: DEFAULT_ADMIN_EMAIL,
    name: 'Admin GPTWalabhai',
    role: 'admin',
    credits: 10000,
    maxCredits: 10000,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gptwalabhai',
    isYouTubeConnected: false,
    createdAt: new Date().toISOString().split('T')[0]
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('tt_all_users');
      if (storedUsers) {
        setAllUsers(JSON.parse(storedUsers));
      } else {
        localStorage.setItem('tt_all_users', JSON.stringify(INITIAL_USERS));
      }

      const storedCurrent = localStorage.getItem('tt_current_user');
      if (storedCurrent) {
        setUser(JSON.parse(storedCurrent));
      } else {
        // Default login as admin
        const adminUser = INITIAL_USERS[0];
        setUser(adminUser);
        localStorage.setItem('tt_current_user', JSON.stringify(adminUser));
      }
    } catch (e) {
      console.error('Failed loading auth state:', e);
    }
  }, []);

  const saveUsersState = (newUsers: UserProfile[], currentUser: UserProfile | null) => {
    setAllUsers(newUsers);
    setUser(currentUser);
    localStorage.setItem('tt_all_users', JSON.stringify(newUsers));
    if (currentUser) {
      localStorage.setItem('tt_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tt_current_user');
    }
  };

  const login = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === DEFAULT_ADMIN_EMAIL;

    let existingUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existingUser) {
      existingUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: name || (isAdmin ? 'Admin GPTWalabhai' : cleanEmail.split('@')[0]),
        role: isAdmin ? 'admin' : 'user',
        credits: isAdmin ? 10000 : 1000,
        maxCredits: isAdmin ? 10000 : 1000,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
        isYouTubeConnected: false,
        createdAt: new Date().toISOString().split('T')[0]
      };

      const updatedList = [...allUsers, existingUser];
      saveUsersState(updatedList, existingUser);
    } else {
      // Force admin role if logging in with admin email
      if (isAdmin && existingUser.role !== 'admin') {
        existingUser.role = 'admin';
      }
      saveUsersState(allUsers, existingUser);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tt_current_user');
  };

  const addCreditsToUser = (userId: string, amount: number) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        const newCredits = u.credits + amount;
        return {
          ...u,
          credits: newCredits,
          maxCredits: Math.max(u.maxCredits, newCredits)
        };
      }
      return u;
    });

    const updatedCurrent = user && user.id === userId
      ? { ...user, credits: user.credits + amount, maxCredits: Math.max(user.maxCredits, user.credits + amount) }
      : user;

    saveUsersState(updatedUsers, updatedCurrent);
  };

  const addNewUser = (email: string, name: string, credits: number, role: 'admin' | 'user') => {
    const cleanEmail = email.trim().toLowerCase();
    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      alert('User with this email already exists!');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      role: cleanEmail === DEFAULT_ADMIN_EMAIL ? 'admin' : role,
      credits: credits || 1000,
      maxCredits: credits || 1000,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      isYouTubeConnected: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedList = [...allUsers, newUser];
    saveUsersState(updatedList, user);
  };

  const removeUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target?.email.toLowerCase() === DEFAULT_ADMIN_EMAIL) {
      alert('Primary admin account cannot be deleted!');
      return;
    }

    const updatedList = allUsers.filter(u => u.id !== userId);
    const updatedCurrent = user?.id === userId ? null : user;
    saveUsersState(updatedList, updatedCurrent);
  };

  const setYouTubeConnected = (connected: boolean, channelName?: string) => {
    if (!user) return;
    const updatedCurrent: UserProfile = {
      ...user,
      isYouTubeConnected: connected,
      youtubeChannelName: channelName
    };
    const updatedList = allUsers.map(u => u.id === user.id ? updatedCurrent : u);
    saveUsersState(updatedList, updatedCurrent);
  };

  return (
    <AuthContext.Provider value={{
      user,
      allUsers,
      login,
      logout,
      addCreditsToUser,
      addNewUser,
      removeUser,
      setYouTubeConnected
    }}>
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
