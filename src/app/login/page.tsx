'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username);
      if (success) {
        if (username === 'admin') router.push('/admin');
        else if (username === 'reception') router.push('/reception');
        else router.push('/owner');
      } else {
        setError('Invalid staff credentials or account deactivated.');
      }
    } catch {
      setError('Login error encountered.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = (presetUsername: string) => {
    setUsername(presetUsername);
    setPassword('demo-session-key');
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-16 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <SectionBadge label="INTERNAL WORKSPACE" />
          <h1 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
            Staff Authentication
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Protected workstation login for administrators, reception officers, and designated equipment owners.
          </p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" className="p-8 sm:p-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Staff Identifier / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or reception"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>

          {/* Evaluation Preset Selector */}
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-slate-400 block text-center">
              Quick Click-to-Fill Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleDemoPreset('admin')}
                className="py-2 px-3 text-center rounded-xl border border-slate-200 hover:border-[#0052FF]/40 hover:bg-[#0052FF]/5 hover:text-[#0052FF] transition-all cursor-pointer font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('reception')}
                className="py-2 px-3 text-center rounded-xl border border-slate-200 hover:border-[#0052FF]/40 hover:bg-[#0052FF]/5 hover:text-[#0052FF] transition-all cursor-pointer font-medium"
              >
                Reception
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('dr.sharma')}
                className="py-2 px-3 text-center rounded-xl border border-slate-200 hover:border-[#0052FF]/40 hover:bg-[#0052FF]/5 hover:text-[#0052FF] transition-all cursor-pointer font-medium"
              >
                Owner
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              You can also use the top dev evaluation bar anytime to switch roles instantly.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
