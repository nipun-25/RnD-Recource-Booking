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
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

function AdminNavTabs() {
  const pathname = usePathname();
  const navItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Equipment Catalog', href: '/admin/equipment', icon: Microscope },
    { label: 'Staff Accounts', href: '/admin/staff', icon: Users },
    { label: 'Request Registry', href: '/admin/requests', icon: Inbox },
    { label: 'Analytics & Audit', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all ${
              active
                ? 'bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white shadow-accent'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
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
        <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
          <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Validating administrator session token...</p>
        </div>
        <div className="hidden">{children}</div>
      </>
    );
  }

  if (role !== 'admin') {
    return (
      <>
        <div className="max-w-xl mx-auto my-20 p-8 sm:p-10 bg-white border border-slate-200 rounded-3xl shadow-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-calistoga text-2xl text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Current viewing role: <span className="font-mono font-bold text-slate-800">{role.toUpperCase()}</span>. Full administrator privileges are required to configure instruments, issue staff keys, and view global audit logs.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => switchRoleDev('admin')}
              variant="primary"
              size="md"
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Switch to Admin Role (Dr. Anand Joshi)
            </Button>
          </div>
        </div>
        <div className="hidden">{children}</div>
      </>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Sub-header navigation tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse" />
              <h1 className="font-calistoga text-2xl text-[#0F172A] tracking-tight">R&D Cell Administration Workspace</h1>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Research & Development Cell • Parul University Campus
            </p>
          </div>

          <React.Suspense fallback={<div className="h-8 w-48 bg-slate-100 rounded-xl" />}>
            <AdminNavTabs />
          </React.Suspense>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
