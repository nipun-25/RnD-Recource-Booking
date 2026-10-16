'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUser, UserRole } from '@/types';
import { DEMO_STAFF } from './mock-data';

interface AuthContextType {
  currentUser: StaffUser | null;
  role: UserRole | 'public';
  isHydrated: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRoleDev: (role: UserRole | 'public', ownerId?: string) => void;
  allStaff: StaffUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'rnd_portal_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [role, setRole] = useState<UserRole | 'public'>('public');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StaffUser;
        if (parsed && parsed.role) {
          setCurrentUser(parsed);
          setRole(parsed.role);
        }
      }
    } catch {
      // Keep stable initial state
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    const found = DEMO_STAFF.find(
      (s) => s.username.toLowerCase() === cleanUsername && s.status === 'active'
    );
    if (found) {
      setCurrentUser(found);
      setRole(found.role);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('public');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRoleDev = (targetRole: UserRole | 'public', ownerId?: string) => {
    if (targetRole === 'public') {
      logout();
      return;
    }

    let targetUser: StaffUser | undefined;
    if (targetRole === 'owner') {
      targetUser = DEMO_STAFF.find((s) => s.id === ownerId || s.role === 'owner');
    } else {
      targetUser = DEMO_STAFF.find((s) => s.role === targetRole);
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      setRole(targetUser.role);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isHydrated,
        login,
        logout,
        switchRoleDev,
        allStaff: DEMO_STAFF,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
