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
  CheckCircle2,
  Clock,
  Percent,
  Search,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { AuditLog } from '@/types';
import { computeAnalytics, AnalyticsSummary } from '@/lib/analytics';
import { exportToCsv } from '@/lib/csv-export';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    return <div className="p-16 text-center text-xs font-mono text-slate-500">Calculating facility metrics and utilization graphs...</div>;
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
          <h2 className="font-calistoga text-2xl text-[#0F172A]">Resource Utilization & Audit Analytics</h2>
          <p className="text-xs text-slate-500">
            Comprehensive facility operating benchmarks, on-time fidelity rates, and immutable audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleExportMetrics}
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            Export Metrics CSV
          </Button>
          <Button
            onClick={handleExportAuditLogs}
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            Export Audit Logs CSV
          </Button>
        </div>
      </div>

      {/* Top Statistical Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Overall Lab Utilization</span>
            <Percent className="w-4 h-4 text-[#0052FF]" />
          </div>
          <p className="font-calistoga text-3xl text-slate-900">{summary.overallUtilizationRate}%</p>
          <span className="text-[10px] font-mono text-slate-500 block">Benchmark Across All Bays</span>
        </Card>

        <Card variant="elevated" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">On-Time Session Start</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <p className="font-calistoga text-3xl text-teal-600">{summary.onTimeStartRate}%</p>
          <span className="text-[10px] font-mono text-slate-500 block">Prompt Initiation</span>
        </Card>

        <Card variant="elevated" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">On-Time Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-calistoga text-3xl text-emerald-600">{summary.onTimeCompletionRate}%</p>
          <span className="text-[10px] font-mono text-slate-500 block">Adherence to Window</span>
        </Card>

        <Card variant="elevated" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Turnaround</span>
            <Activity className="w-4 h-4 text-[#4D7CFF]" />
          </div>
          <p className="font-calistoga text-3xl text-[#0052FF]">
            {summary.avgTurnaroundDays} <span className="font-sans text-xs font-normal text-slate-500">Days</span>
          </p>
          <span className="text-[10px] font-mono text-slate-500 block">Intake to Report Handover</span>
        </Card>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Equipment Utilization Percentage */}
        <Card variant="elevated" className="p-6 space-y-4">
          <div>
            <h3 className="font-calistoga text-base text-[#0F172A]">Equipment Utilization Rate (%)</h3>
            <p className="text-xs text-slate-500 font-mono">Formula: (Actual Operating Hours / Net Available Hours) × 100</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.equipmentMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilizationRate" fill="#0052FF" radius={[6, 6, 0, 0]} name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Reserved Hours vs Actual Operating Hours */}
        <Card variant="elevated" className="p-6 space-y-4">
          <div>
            <h3 className="font-calistoga text-base text-[#0F172A]">Reserved vs Actual Operating Hours</h3>
            <p className="text-xs text-slate-500 font-mono">Compares booked slot duration against owner-verified run time</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.equipmentMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis unit="h" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`${value} hrs`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="reservedHours" fill="#4D7CFF" radius={[4, 4, 0, 0]} name="Reserved Hours" />
                <Bar dataKey="actualHours" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Operating Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Monthly Demand & Volume Trends */}
        <Card variant="elevated" className="p-6 space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-calistoga text-base text-[#0F172A]">Monthly Request Volume & Operating Hours</h3>
              <p className="text-xs text-slate-500 font-mono">Intake trajectory of slot bookings and sample testing batches</p>
            </div>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Verified Academic Year 2025–2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0052FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="hours" stroke="#0052FF" fillOpacity={1} fill="url(#colorHours)" name="Operating Hours" />
                <Area type="monotone" dataKey="bookings" stroke="#4D7CFF" fillOpacity={0.1} fill="#4D7CFF" name="Equipment Bookings" />
                <Area type="monotone" dataKey="samples" stroke="#06b6d4" fillOpacity={0.1} fill="#06b6d4" name="Sample Submissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card variant="elevated" className="p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-calistoga text-xl text-[#0F172A] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0052FF]" />
              Immutable Administrative Audit Ledger
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Captures every status change, staff credential action, equipment parameter alteration, and timestamp.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3.5 font-sans font-semibold">Timestamp</th>
                <th className="py-3 px-3.5 font-sans font-semibold">Actor & Role</th>
                <th className="py-3 px-3.5 font-sans font-semibold">Action</th>
                <th className="py-3 px-3.5 font-sans font-semibold">Entity Target</th>
                <th className="py-3 px-3.5 font-sans font-semibold">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 text-[11px] transition-colors">
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap font-sans">
                    <span className="font-semibold text-slate-900 block">{log.actorName}</span>
                    <span className="text-[10px] text-[#0052FF] font-mono">[{log.actorRole.toUpperCase()}]</span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0052FF]/10 text-[#0052FF] font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-700">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 font-sans text-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
