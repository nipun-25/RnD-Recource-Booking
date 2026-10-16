'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Microscope,
  Users,
  Inbox,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

function AdminNavTabs() {
  const pathname = usePathname();
  const navItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Equipment Catalog & Status', href: '/admin/equipment', icon: Microscope },
    { label: 'Staff & Reception Accounts', href: '/admin/staff', icon: Users },
    { label: 'Request & Sample Registry', href: '/admin/requests', icon: Inbox },
    { label: 'Analytics & Audit Logs', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              active
                ? 'bg-purple-100 text-purple-900 border border-purple-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, isHydrated, switchRoleDev } = useAuth();

  if (!isHydrated) {
    return (
      <>
        <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Validating administrator session...</p>
        </div>
        <div className="hidden">{children}</div>
      </>
    );
  }

  if (role !== 'admin') {
    return (
      <>
        <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-amber-200 rounded-2xl shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-600">
            You are currently viewing as &quot;{role.toUpperCase()}&quot;. Administrator permissions are required to manage equipment records, issue staff accounts, and view global audit logs.
          </p>
          <div className="pt-2">
            <button
              onClick={() => switchRoleDev('admin')}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Switch to Admin Role (Dr. Anand Joshi)
            </button>
          </div>
        </div>
        <div className="hidden">{children}</div>
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Sub-header navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">R&D Cell Administration Workspace</h1>
          </div>
          <p className="text-xs text-slate-500">
            Research and Development Cell • Parul University
          </p>
        </div>

        <React.Suspense fallback={<div className="h-8 w-48 bg-slate-100 rounded" />}>
          <AdminNavTabs />
        </React.Suspense>
      </div>

      <div>{children}</div>
    </div>
  );
}
