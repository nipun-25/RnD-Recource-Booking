'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Download,
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Wrench,
  Percent,
  Search,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest, AuditLog, UsageSession, MaintenanceRecord } from '@/types';
import { computeAnalytics, AnalyticsSummary } from '@/lib/analytics';
import { exportToCsv } from '@/lib/csv-export';

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [eqs, reqs, logs, sessions, maint] = await Promise.all([
        dataStore.getEquipmentList(),
        dataStore.getRequests(),
        dataStore.getAuditLogs(),
        dataStore.getUsageSessions(),
        dataStore.getMaintenanceRecords(),
      ]);

      const computed = computeAnalytics(eqs, reqs, sessions, maint);
      setSummary(computed);
      setAuditLogs(logs);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !summary) {
    return <div className="p-12 text-center text-xs text-slate-500">Calculating facility metrics and utilization graphs...</div>;
  }

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.actorName.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.entityId.toLowerCase().includes(logSearch.toLowerCase())
  );

  const handleExportMetrics = () => {
    const rows = summary.equipmentMetrics.map((m) => ({
      EquipmentId: m.equipmentId,
      InstrumentName: m.name,
      UtilizationRatePct: m.utilizationRate,
      ActualOperatingHours: m.actualHours,
      ReservedHours: m.reservedHours,
      NetAvailableHours: m.availableHours,
      MaintenanceHours: m.maintenanceHours,
      TotalRequests: m.requestCount,
    }));
    exportToCsv('RnD_Equipment_Utilization_Report', rows);
  };

  const handleExportAuditLogs = () => {
    const rows = auditLogs.map((l) => ({
      Timestamp: l.timestamp,
      ActorName: l.actorName,
      ActorRole: l.actorRole,
      Action: l.action,
      EntityType: l.entityType,
      EntityId: l.entityId,
      Details: l.details,
    }));
    exportToCsv('RnD_Audit_Ledger', rows);
  };

  return (
    <div className="space-y-8">
      {/* Header and Export actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Resource Utilization & Audit Analytics</h2>
          <p className="text-xs text-slate-500">
            Comprehensive operating benchmarks, on-time fidelity, and tamper-resistant audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMetrics}
            className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Equipment Metrics CSV
          </button>
          <button
            onClick={handleExportAuditLogs}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Audit Logs CSV
          </button>
        </div>
      </div>

      {/* Top Statistical Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">Overall Lab Utilization</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.overallUtilizationRate}%</p>
          <span className="text-[10px] text-slate-500">Benchmark across all 6 bays</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">On-Time Session Start</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-teal-600">{summary.onTimeStartRate}%</p>
          <span className="text-[10px] text-slate-500">Prompt operator initiation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">On-Time Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{summary.onTimeCompletionRate}%</p>
          <span className="text-[10px] text-slate-500">Adherence to scheduled slot</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase">Avg Turnaround</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-600">{summary.avgTurnaroundDays} <span className="text-xs font-normal text-slate-500">Days</span></p>
          <span className="text-[10px] text-slate-500">Intake to report dispatch</span>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Equipment Utilization Percentage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Equipment Utilization Rate (%)</h3>
            <p className="text-xs text-slate-500">Formula: (Actual Operating Hours / Net Available Hours) × 100</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.equipmentMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilizationRate" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Reserved Hours vs Actual Operating Hours */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Reserved vs Actual Operating Hours</h3>
            <p className="text-xs text-slate-500">Compares scheduled booking duration against verified run time</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.equipmentMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis unit="h" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`${value} hrs`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="reservedHours" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reserved Hours" />
                <Bar dataKey="actualHours" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Operating Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Demand & Volume Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Request Volume & Operating Hours</h3>
              <p className="text-xs text-slate-500">Historical intake of slot bookings and sample testing batches</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              Aggregated Demo Dataset
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="hours" stroke="#7c3aed" fillOpacity={1} fill="url(#colorHours)" name="Operating Hours" />
                <Area type="monotone" dataKey="bookings" stroke="#2563eb" fillOpacity={0.1} fill="#2563eb" name="Equipment Bookings" />
                <Area type="monotone" dataKey="samples" stroke="#06b6d4" fillOpacity={0.1} fill="#06b6d4" name="Sample Submissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Immutable Administrative Audit Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Captures every status change, staff account action, equipment alteration, and timestamp.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Entity / ID</th>
                <th className="py-2.5 px-3">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 font-mono text-[11px]">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{log.actorName}</span>
                    <span className="text-[10px] text-purple-700 block">[{log.actorRole}]</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-700">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
