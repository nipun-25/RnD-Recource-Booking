'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Microscope,
  Inbox,
  Clock,
  CalendarCheck,
  FlaskConical,
  AlertTriangle,
  Activity,
  ArrowRight,
  PlusCircle,
  UserPlus,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest, AuditLog } from '@/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [eqList, reqList, logs] = await Promise.all([
        dataStore.getEquipmentList(),
        dataStore.getRequests(),
        dataStore.getAuditLogs(),
      ]);
      setEquipment(eqList);
      setRequests(reqList);
      setAuditLogs(logs);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-xs font-mono text-slate-500">Loading admin overview metrics...</div>;
  }

  const activeEquipment = equipment.filter((e) => e.status === 'available');
  const pendingApprovals = requests.filter((r) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'AWAITING_OWNER_REVIEW'].includes(r.status)
  );
  const confirmedBookings = requests.filter((r) => r.status === 'CONFIRMED');
  const processingSamples = requests.filter((r) => r.status === 'PROCESSING');
  const overdueItems = requests.filter((r) => r.status === 'ON_HOLD' || r.status === 'NEEDS_INFORMATION');

  return (
    <div className="space-y-8">
      {/* Modern Inverted Welcome Banner */}
      <div className="rounded-3xl bg-[#0F172A] text-white p-7 sm:p-9 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0052FF]/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <SectionBadge label="CENTRAL OVERSIGHT" className="border-white/20 bg-white/5" />
            <h2 className="font-calistoga text-2xl sm:text-3xl text-white">
              R&D Resource & Workflow Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Real-time monitoring of campus research resources, laboratory staffing allocations, and testing throughput across Parul University.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              href="/admin/equipment"
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Add Equipment
            </Button>
            <Button
              href="/admin/staff"
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              icon={<UserPlus className="w-4 h-4" />}
            >
              Manage Accounts
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Tools</span>
            <Microscope className="w-4 h-4 text-[#0052FF]" />
          </div>
          <p className="font-calistoga text-2xl text-slate-900">{activeEquipment.length} / {equipment.length}</p>
          <span className="text-[10px] font-mono text-emerald-600 block">Available Online</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Requests</span>
            <Inbox className="w-4 h-4 text-[#4D7CFF]" />
          </div>
          <p className="font-calistoga text-2xl text-slate-900">{requests.length}</p>
          <span className="text-[10px] font-mono text-slate-500 block">All Records</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Pending Triage</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-calistoga text-2xl text-amber-600">{pendingApprovals.length}</p>
          <span className="text-[10px] font-mono text-slate-500 block">Needs Review</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Confirmed Slots</span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="font-calistoga text-2xl text-teal-600">{confirmedBookings.length}</p>
          <span className="text-[10px] font-mono text-slate-500 block">Scheduled Runs</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">In Processing</span>
            <FlaskConical className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-calistoga text-2xl text-blue-600">{processingSamples.length}</p>
          <span className="text-[10px] font-mono text-slate-500 block">Active Runs</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Attention Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-calistoga text-2xl text-rose-600">{overdueItems.length}</p>
          <span className="text-[10px] font-mono text-slate-500 block">Hold / Inquiry</span>
        </Card>
      </div>

      {/* Main Overview Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Equipment Operational Status */}
        <Card variant="elevated" className="lg:col-span-2 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-calistoga text-lg text-[#0F172A]">Resource Readiness & Operational Status</h3>
              <p className="text-xs text-slate-500">Real-time status across university characterization labs</p>
            </div>
            <Link
              href="/admin/equipment"
              className="text-xs font-mono font-medium text-[#0052FF] hover:underline inline-flex items-center gap-1"
            >
              Manage Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-sans font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-sans font-semibold">Category</th>
                  <th className="py-3 px-4 font-sans font-semibold">Status</th>
                  <th className="py-3 px-4 font-sans font-semibold">Demo Rate</th>
                  <th className="py-3 px-4 text-right font-sans font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <p className="font-semibold text-slate-900">{eq.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{eq.model}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-sans">{eq.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          eq.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : eq.status === 'maintenance'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {eq.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">₹{eq.hourlyRateDemo}/hr</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/admin/equipment"
                        className="text-[#0052FF] hover:underline font-semibold text-[11px]"
                      >
                        Configure
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Recent Audit Log Activity */}
        <Card variant="elevated" className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-calistoga text-lg text-[#0F172A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0052FF]" />
                Live Audit Stream
              </h3>
              <p className="text-xs text-slate-500">Immutable administrative actions</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-mono font-medium text-[#0052FF] hover:underline"
            >
              Full Logs
            </Link>
          </div>

          <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
            {auditLogs.slice(0, 7).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#0052FF] font-mono text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-700 leading-snug">{log.details}</p>
                <p className="text-[10px] font-mono text-slate-400">
                  Actor: <span className="font-medium text-slate-700">{log.actorName}</span> ({log.actorRole})
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
