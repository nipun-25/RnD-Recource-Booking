'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Microscope,
  Search,
  ShieldCheck,
  UserCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, isHydrated, logout, switchRoleDev } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReady = mounted && isHydrated;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleRoleSelect = (targetRole: 'public' | 'admin' | 'reception' | 'owner', ownerId?: string) => {
    switchRoleDev(targetRole, ownerId);
    if (targetRole === 'admin') router.push('/admin');
    else if (targetRole === 'reception') router.push('/reception');
    else if (targetRole === 'owner') router.push('/owner');
    else router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Dev Role Quick Switcher Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-slate-300">DEMO & EVALUATION BAR:</span>
          <span className="text-slate-400">Current Role:</span>
          <span className="px-2 py-0.5 rounded font-mono font-medium text-[11px] bg-slate-800 text-emerald-400 border border-slate-700">
            {isReady
              ? `${role.toUpperCase()} ${currentUser ? `(${currentUser.fullName})` : '(Guest / Public)'}`
              : 'INITIALIZING...'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Switch Role:</span>
          <button
            onClick={() => handleRoleSelect('public')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isReady && role === 'public'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Public Requester
          </button>
          <button
            onClick={() => handleRoleSelect('admin')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isReady && role === 'admin'
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin (Dr. Joshi)
          </button>
          <button
            onClick={() => handleRoleSelect('reception')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isReady && role === 'reception'
                ? 'bg-teal-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Reception (K. Patel)
          </button>
          <button
            onClick={() => handleRoleSelect('owner', 'staff-owner-1')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isReady && role === 'owner' && currentUser?.username === 'dr.sharma'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Owner (FE-SEM / AFM)
          </button>
          <button
            onClick={() => handleRoleSelect('owner', 'staff-owner-2')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isReady && role === 'owner' && currentUser?.username === 'dr.desai'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Owner (Sputter / Mask)
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white shadow-md shadow-[#0052FF]/20 group-hover:scale-105 group-hover:shadow-accent transition-all duration-300">
              <Microscope className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-normal text-slate-950 tracking-tight text-lg sm:text-xl">
                  R&D Resource Portal
                </span>
                <span className="text-[10px] uppercase font-mono tracking-[0.15em] font-semibold bg-[#0052FF]/10 text-[#0052FF] px-2 py-0.5 rounded-full border border-[#0052FF]/20">
                  R&D Cell
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans hidden sm:block">Research & Development Cell, Parul University</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <Link
              href="/catalog"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/catalog')
                  ? 'bg-[#0052FF]/10 text-[#0052FF] font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              Equipment Catalog
            </Link>

            <Link
              href="/book"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/book')
                  ? 'bg-[#0052FF]/10 text-[#0052FF] font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              Book Equipment
            </Link>

            <Link
              href="/submit-sample"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/submit-sample')
                  ? 'bg-[#0052FF]/10 text-[#0052FF] font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              Submit Sample
            </Link>

            <Link
              href="/track"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
                isActive('/track')
                  ? 'bg-[#0052FF]/10 text-[#0052FF] font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Track Request
            </Link>

            <Link
              href="/about"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/about')
                  ? 'bg-[#0052FF]/10 text-[#0052FF] font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              About
            </Link>
          </nav>

          {/* User / Portal Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {isReady && role !== 'public' && currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href={role === 'admin' ? '/admin' : role === 'reception' ? '/reception' : '/owner'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white text-sm font-medium shadow-xs hover:shadow-accent hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {role === 'admin'
                    ? 'Admin Portal'
                    : role === 'reception'
                    ? 'Reception Queue'
                    : 'Owner Portal'}
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-[#0052FF]/40 hover:bg-slate-50 hover:shadow-xs transition-all duration-200"
              >
                <UserCheck className="w-4 h-4 text-slate-500" />
                Staff Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Equipment Catalog
          </Link>
          <Link
            href="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Book Equipment
          </Link>
          <Link
            href="/submit-sample"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Submit Sample
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Track Status
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            About & Facilities
          </Link>

          <div className="pt-2 border-t border-slate-200">
            {isReady && role !== 'public' ? (
              <div className="space-y-2">
                <Link
                  href={role === 'admin' ? '/admin' : role === 'reception' ? '/reception' : '/owner'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 px-4 rounded-lg bg-blue-700 text-white font-medium"
                >
                  Go to {role.toUpperCase()} Portal
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 px-4 rounded-lg text-rose-600 bg-rose-50 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium"
              >
                Staff Portal Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
