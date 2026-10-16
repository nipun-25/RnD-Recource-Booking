'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Microscope, Lock, User, Key, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md">
          <Microscope className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Authentication</h1>
        <p className="text-xs text-slate-500">
          Protected workstation login for administrators, reception officers, and equipment owners.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Username / ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or reception"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Evaluation Demo Accounts Box */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Click-to-fill Demo Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoPreset('admin')}
              className="p-2 text-center rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 font-medium transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('reception')}
              className="p-2 text-center rounded-lg border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 font-medium transition-colors"
            >
              Reception
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('dr.sharma')}
              className="p-2 text-center rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 font-medium transition-colors"
            >
              Owner
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Or use the top evaluation bar anytime to switch active roles instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
