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
  TrendingUp,
  Shield,
  PlusCircle,
  UserPlus,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest, AuditLog } from '@/types';
import { computeAnalytics } from '@/lib/analytics';
import { StatusBadge } from '@/components/StatusBadge';

export default function AdminDashboardPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [eqList, reqList, logs, sessions, maint] = await Promise.all([
        dataStore.getEquipmentList(),
        dataStore.getRequests(),
        dataStore.getAuditLogs(),
        dataStore.getUsageSessions(),
        dataStore.getMaintenanceRecords(),
      ]);
      setEquipment(eqList);
      setRequests(reqList);
      setAuditLogs(logs);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading admin overview metrics...</div>;
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-blue-950 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
            R&D Cell Administration • Central Oversight
          </span>
          <h2 className="text-2xl font-black mt-1">R&D Resource & Workflow Management</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time tracking of research resources, staffing allocations, and testing throughput across Parul University.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/equipment"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add Equipment
          </Link>
          <Link
            href="/admin/staff"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-700"
          >
            <UserPlus className="w-4 h-4" />
            Manage Accounts
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">Active Tools</span>
            <Microscope className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{activeEquipment.length} / {equipment.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Available online</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">Total Requests</span>
            <Inbox className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{requests.length}</p>
          <span className="text-[10px] text-slate-500">All recorded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">Pending Triage</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{pendingApprovals.length}</p>
          <span className="text-[10px] text-slate-500">Requires action</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">Confirmed Slots</span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-600">{confirmedBookings.length}</p>
          <span className="text-[10px] text-slate-500">Locked on calendar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">In Processing</span>
            <FlaskConical className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{processingSamples.length}</p>
          <span className="text-[10px] text-slate-500">Active run</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">Attention Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{overdueItems.length}</p>
          <span className="text-[10px] text-slate-500">Hold / Info needed</span>
        </div>
      </div>

      {/* Main Overview Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Equipment Utilization Quick Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Research Resource Operational Status & Readiness</h3>
              <p className="text-xs text-slate-500">Real-time status across university laboratories & facilities</p>
            </div>
            <Link
              href="/admin/equipment"
              className="text-xs font-semibold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1"
            >
              Manage All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-100 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Rate</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{eq.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{eq.model}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{eq.category}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          eq.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : eq.status === 'maintenance'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {eq.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">₹{eq.hourlyRateDemo}/hr</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/admin/equipment"
                        className="text-purple-700 hover:underline font-semibold text-[11px]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Audit Log Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                Live Audit Stream
              </h3>
              <p className="text-xs text-slate-500">Immutable administrative actions</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-purple-700 hover:text-purple-800"
            >
              View Full Logs
            </Link>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {auditLogs.slice(0, 7).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-purple-900 font-mono text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-700 leading-snug">{log.details}</p>
                <p className="text-[10px] text-slate-500">
                  Actor: <span className="font-medium text-slate-700">{log.actorName}</span> ({log.actorRole})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
