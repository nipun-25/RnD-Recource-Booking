'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { ServiceRequest, Equipment } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    <div className="bg-[#FAFAFA] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <SectionBadge label="PUBLIC TRANSPARENCY PORTAL" />
          <h1 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
            Track Request & Sample Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Enter your cryptographically random, non-sequential tracking ID (e.g. <span className="font-mono text-slate-900 font-medium">RND-2026-X8K9</span>) to review authenticated operational status updates.
          </p>
        </div>

        {/* Search Input Box */}
        <Card variant="elevated" className="p-5 sm:p-7 max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. RND-2026-X8K9"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none uppercase transition-all"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="shrink-0"
            >
              {loading ? 'Searching...' : 'Track'}
            </Button>
          </form>

          {/* Quick Demo Previews */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-medium text-slate-600">Sample Records:</span>
            {['RND-2026-X8K9', 'RND-2026-T4B2', 'RND-2026-P8V3', 'RND-2026-M2Q7'].map((demoId) => (
              <button
                key={demoId}
                type="button"
                onClick={() => {
                  setTrackingInput(demoId);
                  performSearch(demoId);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0052FF]/10 hover:text-[#0052FF] hover:border-[#0052FF]/30 font-mono text-[11px] border border-slate-200 transition-colors cursor-pointer"
              >
                {demoId}
              </button>
            ))}
          </div>
        </Card>

        {/* Result Display: Not Found */}
        {searched && !request && !loading && (
          <Card variant="default" className="p-10 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-calistoga text-xl text-slate-900">No Record Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active research request matches &quot;{trackingInput}&quot;. Please verify the tracking identifier or contact the R&D Cell reception desk.
            </p>
          </Card>
        )}

        {/* Result Display: Found */}
        {request && (
          <Card variant="elevated" className="overflow-hidden p-0">
            {/* Tracking Header (Inverted Deep Slate) */}
            <div className="bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#0052FF]/20 blur-3xl" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#4D7CFF] block">
                  Non-Sequential Tracking Identifier
                </span>
                <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white">
                  {request.trackingId}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Type: {request.requestType.replace('_', ' ').toUpperCase()} • Date: {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="relative z-10 text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Public Operational Status
                </span>
                <StatusBadge status={request.status} isPublic={true} className="text-xs px-3.5 py-1.5 bg-white text-slate-900 shadow-xs" />
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Sanitized Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block">Project / Study Title</span>
                  <p className="font-semibold text-slate-900 text-sm mt-1">{request.projectTitle}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block">Assigned Research Facility</span>
                  <p className="font-semibold text-slate-900 text-sm mt-1">
                    {equipment ? equipment.name : 'Central Characterization Facility'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block">Scheduled / Preferred Period</span>
                  <p className="font-semibold text-slate-800 mt-1 font-mono">
                    {request.preferredDateStart} {request.preferredTimeSlot ? `(${request.preferredTimeSlot})` : ''}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block">Institutional Affiliation</span>
                  <p className="font-semibold text-slate-800 mt-1">{request.requesterOrg}</p>
                </div>
              </div>

              {/* Public Notice Banner */}
              <div className="bg-[#0052FF]/5 border border-[#0052FF]/20 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-semibold text-[#0052FF] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-mono uppercase tracking-wider">Latest Operational Notice</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {request.publicNotes || 'Your request is in active progress according to standard university laboratory protocols.'}
                </p>
              </div>

              {/* Safe Workflow Milestones */}
              <div className="space-y-4">
                <h3 className="font-calistoga text-xl text-[#0F172A]">
                  Progress Milestones
                </h3>

                <div className="space-y-4 pt-1">
                  {[
                    {
                      title: 'Request Intake & Reception Triage',
                      desc: 'Submission logged in central queue and verified.',
                      completed: true,
                    },
                    {
                      title: 'Technical Feasibility Review',
                      desc: 'Equipment owner reviews parameter feasibility & safety protocols.',
                      completed: !['SUBMITTED', 'NEEDS_INFORMATION'].includes(request.status),
                    },
                    {
                      title: 'Quotation & Slot Confirmation',
                      desc: 'Operational slot reserved and validated.',
                      completed: ['CONFIRMED', 'SAMPLES_RECEIVED', 'PROCESSING', 'COMPLETED', 'READY_FOR_HANDOVER', 'DISPATCHED'].includes(request.status),
                    },
                    {
                      title: 'Analysis / Equipment Execution',
                      desc: 'Active testing, scanning, or specimen preparation run.',
                      completed: ['PROCESSING', 'COMPLETED', 'READY_FOR_HANDOVER', 'DISPATCHED'].includes(request.status),
                    },
                    {
                      title: 'Report Delivery / Handover Ready',
                      desc: 'Results validated and ready for investigator collection.',
                      completed: ['READY_FOR_HANDOVER', 'DISPATCHED', 'COMPLETED'].includes(request.status),
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono ${
                          step.completed
                            ? 'bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sanitized Public View: Private staff deliberations and financial internal logs are protected.</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs font-mono text-slate-500">Loading tracking portal...</div>}>
      <TrackContent />
    </Suspense>
  );
}
