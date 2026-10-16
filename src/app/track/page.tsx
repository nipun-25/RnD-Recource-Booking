'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle, Clock, AlertCircle, ShieldCheck, Microscope, Calendar } from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { ServiceRequest, Equipment } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { WORKFLOW_LABELS } from '@/lib/workflow';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || '';

  const [trackingInput, setTrackingInput] = useState(initialId);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const performSearch = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const found = await dataStore.getRequestByTrackingId(idToSearch);
      setRequest(found);
      if (found) {
        const eq = await dataStore.getEquipmentById(found.equipmentId);
        setEquipment(eq);
      } else {
        setEquipment(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      performSearch(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(trackingInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Search className="w-3.5 h-3.5" />
          <span>Public Transparency Portal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Request & Sample Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your unique tracking identifier (e.g. RND-2026-X8K9) to view sanitized, public-safe operational updates.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. RND-2026-X8K9"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shrink-0"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Quick Demo Previews */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Try Demo IDs:</span>
          {['RND-2026-X8K9', 'RND-2026-T4B2', 'RND-2026-P8V3', 'RND-2026-M2Q7'].map((demoId) => (
            <button
              key={demoId}
              type="button"
              onClick={() => {
                setTrackingInput(demoId);
                performSearch(demoId);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-mono text-[10px] border border-slate-200 transition-colors"
            >
              {demoId}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {searched && !request && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Record Found</h3>
          <p className="text-xs text-slate-500">
            No active request corresponds to &quot;{trackingInput}&quot;. Please verify your tracking ID or contact central reception.
          </p>
        </div>
      )}

      {request && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tracking Header */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
                Non-Sequential Tracking Identifier
              </span>
              <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-tight mt-0.5">
                {request.trackingId}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Type: {request.requestType.replace('_', ' ').toUpperCase()} • Submitted: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block mb-1">Public Workflow Status</span>
              <StatusBadge status={request.status} isPublic={true} className="text-xs px-3 py-1 bg-white text-slate-900" />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Sanitized overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Project / Study Title:</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">{request.projectTitle}</p>
              </div>

              <div>
                <span className="text-slate-500">Assigned Facility / Equipment:</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  {equipment ? equipment.name : 'Central Characterization Facility'}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Scheduled / Preferred Period:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {request.preferredDateStart} {request.preferredTimeSlot ? `(${request.preferredTimeSlot})` : ''}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Affiliation:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{request.requesterOrg}</p>
              </div>
            </div>

            {/* Public Operational Notes (strictly sanitized, internal staff comments filtered out) */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-2">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-700" />
                Latest Public Operational Notice
              </span>
              <p className="text-xs text-blue-900 leading-relaxed">
                {request.publicNotes || 'Your request is in active progress according to standard facility protocols.'}
              </p>
            </div>

            {/* Safe Workflow Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Progress Milestones
              </h3>

              <div className="space-y-4">
                {[
                  {
                    title: 'Request Intake & Triage',
                    desc: 'Submission logged in portal queue.',
                    completed: true,
                  },
                  {
                    title: 'Technical Feasibility Review',
                    desc: 'Equipment specialist reviews sample parameters & safety.',
                    completed: !['SUBMITTED', 'NEEDS_INFORMATION'].includes(request.status),
                  },
                  {
                    title: 'Quotation & Slot Confirmation',
                    desc: 'Operational slot reserved and validated.',
                    completed: ['CONFIRMED', 'SAMPLES_RECEIVED', 'PROCESSING', 'COMPLETED', 'READY_FOR_HANDOVER', 'DISPATCHED'].includes(request.status),
                  },
                  {
                    title: 'Analysis / Equipment Execution',
                    desc: 'Active testing, scanning, or specimen preparation.',
                    completed: ['PROCESSING', 'COMPLETED', 'READY_FOR_HANDOVER', 'DISPATCHED'].includes(request.status),
                  },
                  {
                    title: 'Report Delivery / Handover Ready',
                    desc: 'Results validated and ready for investigator collection.',
                    completed: ['READY_FOR_HANDOVER', 'DISPATCHED', 'COMPLETED'].includes(request.status),
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        step.completed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sanitized Public View: Private staff deliberations and financial internal logs are protected.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading tracking portal...</div>}>
      <TrackContent />
    </Suspense>
  );
}
