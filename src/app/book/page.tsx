'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest } from '@/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function BookFormContent() {
  const searchParams = useSearchParams();
  const preselectedEqId = searchParams?.get('equipmentId') || '';

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterOrg: 'Parul University',
    department: 'Faculty of Applied Sciences',
    equipmentId: preselectedEqId,
    preferredDateStart: '',
    preferredDateEnd: '',
    preferredTimeSlot: '10:00 - 13:00 (Morning Slot)',
    projectTitle: '',
    purposeNotes: '',
    scheduledUsageHours: 2,
  });

  useEffect(() => {
    dataStore.getEquipmentList().then((list) => {
      setEquipmentList(list);
      if (!preselectedEqId && list.length > 0) {
        setFormData((prev) => ({ ...prev, equipmentId: list[0].id }));
      }
    });
  }, [preselectedEqId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await dataStore.createPublicRequest({
        requestType: 'booking',
        requesterName: formData.requesterName,
        requesterEmail: formData.requesterEmail,
        requesterPhone: formData.requesterPhone,
        requesterOrg: formData.requesterOrg,
        department: formData.department,
        equipmentId: formData.equipmentId,
        preferredDateStart: formData.preferredDateStart,
        preferredDateEnd: formData.preferredDateEnd || formData.preferredDateStart,
        preferredTimeSlot: formData.preferredTimeSlot,
        projectTitle: formData.projectTitle,
        purposeNotes: formData.purposeNotes,
        scheduledUsageHours: Number(formData.scheduledUsageHours) || 2,
      });

      setCreatedRequest(result);
    } catch (err) {
      alert('Error creating booking request. Please check inputs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdRequest?.trackingId) {
      navigator.clipboard.writeText(createdRequest.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdRequest) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
        <Card variant="elevated" className="p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="font-calistoga text-2xl sm:text-3xl text-[#0F172A]">
              Equipment Booking Dispatched
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your reservation request has been submitted to the R&D Cell intake queue. Save your unique tracking ID to monitor technical triage, quotation, and scheduling.
            </p>
          </div>

          {/* Tracking ID Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-2">
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-slate-400">
              Official Tracking Identifier
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#0052FF]">
                {createdRequest.trackingId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0052FF] hover:border-[#0052FF]/30 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Copy Tracking ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-[11px] font-mono text-emerald-600 font-medium">Copied to clipboard!</p>}
          </div>

          <div className="text-left text-xs bg-slate-50/80 p-5 rounded-2xl space-y-2 text-slate-700 border border-slate-100 font-mono">
            <p><span className="text-slate-400 font-sans">Project Title:</span> {createdRequest.projectTitle}</p>
            <p><span className="text-slate-400 font-sans">Requested Date:</span> {createdRequest.preferredDateStart}</p>
            <p><span className="text-slate-400 font-sans">Status:</span> <span className="text-[#0052FF] font-semibold">Triage & Owner Feasibility Review</span></p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              href={`/track?id=${createdRequest.trackingId}`}
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Track Request Status
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setCreatedRequest(null);
                setFormData((prev) => ({ ...prev, projectTitle: '', purposeNotes: '' }));
              }}
            >
              Submit Another Booking
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <SectionBadge label="EQUIPMENT RESERVATION" />
          <h1 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
            Reserve Research Equipment Slot
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Submit your research schedule requirements. No login required. Your submission produces a non-sequential, public-safe tracking ID.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card variant="elevated" className="p-6 sm:p-10 space-y-8">
            {/* Requester Information */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-[0.15em] border-b border-slate-100 pb-2">
                1. Investigator / Requester Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Kumar / Ananya Patel"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.requesterEmail}
                    onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                    placeholder="name@paruluniversity.ac.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile / Contact *</label>
                  <input
                    type="tel"
                    required
                    value={formData.requesterPhone}
                    onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institution / Affiliation *</label>
                  <input
                    type="text"
                    required
                    value={formData.requesterOrg}
                    onChange={(e) => setFormData({ ...formData, requesterOrg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department / Research Center *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Department of Physics, Faculty of Applied Sciences"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Equipment & Scheduling */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-[0.15em] border-b border-slate-100 pb-2">
                2. Selected Equipment & Timing
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Choose Instrument *</label>
                  <select
                    required
                    value={formData.equipmentId}
                    onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.category}) — Demo Rate: ₹{eq.hourlyRateDemo}/hr
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDateStart}
                    onChange={(e) => setFormData({ ...formData, preferredDateStart: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Slot Window *</label>
                  <select
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="10:00 - 13:00 (Morning Slot)">10:00 - 13:00 (Morning Slot)</option>
                    <option value="14:00 - 17:00 (Afternoon Slot)">14:00 - 17:00 (Afternoon Slot)</option>
                    <option value="09:00 - 12:00 (Early Slot)">09:00 - 12:00 (Early Slot)</option>
                    <option value="Custom Extended Session">Custom Extended Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Estimated Hours Needed *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={formData.scheduledUsageHours}
                    onChange={(e) => setFormData({ ...formData, scheduledUsageHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Scope */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-[0.15em] border-b border-slate-100 pb-2">
                3. Project Scope & Technical Objectives
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project / Research Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="e.g. High-Resolution Surface Profiling of Graphene Thin Films"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Technical Purpose & Special Sample Parameters *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.purposeNotes}
                    onChange={(e) => setFormData({ ...formData, purposeNotes: e.target.value })}
                    placeholder="Describe material type, substrate dimensions, magnification, or whether sputter coating is needed..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-400">
                Submissions are governed by Parul University laboratory and equipment usage regulations.
              </p>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {loading ? 'Submitting...' : 'Submit Booking Request'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs font-mono text-slate-500">Loading booking interface...</div>}>
      <BookFormContent />
    </Suspense>
  );
}
