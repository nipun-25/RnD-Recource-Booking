'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarCheck,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest } from '@/types';

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
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Equipment Booking Request Submitted!</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your reservation request has been dispatched to central reception. Retain your non-sequential tracking ID to monitor review, quotation, and scheduling.
            </p>
          </div>

          {/* Tracking ID Box */}
          <div className="bg-slate-50 border-2 border-dashed border-blue-200 rounded-xl p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Official Tracking Identifier
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-700">
                {createdRequest.trackingId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 shadow-xs transition-colors"
                title="Copy Tracking ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-[11px] text-emerald-600 font-medium">Copied to clipboard!</p>}
          </div>

          <div className="text-left text-xs bg-slate-50 p-4 rounded-xl space-y-1.5 text-slate-700 border border-slate-100">
            <p><strong>Project Title:</strong> {createdRequest.projectTitle}</p>
            <p><strong>Preferred Date:</strong> {createdRequest.preferredDateStart}</p>
            <p><strong>Initial Status:</strong> In Queue for Reception Triage</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/track?id=${createdRequest.trackingId}`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              Track Request Status
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                setCreatedRequest(null);
                setFormData((prev) => ({ ...prev, projectTitle: '', purposeNotes: '' }));
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Submit Another Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
          <CalendarCheck className="w-4 h-4" />
          <span>R&D Cell • Resource Booking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Equipment & Resource Booking Request</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Reserve instrument operating time. No user account required. You will receive an auditable tracking ID.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Requester Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Requester Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="e.g. Dr. Ramesh Kumar / Ananya Patel"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                placeholder="name@paruluniversity.ac.in or corporate email"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={formData.requesterPhone}
                onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Institution *</label>
              <input
                type="text"
                required
                value={formData.requesterOrg}
                onChange={(e) => setFormData({ ...formData, requesterOrg: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Lab Unit *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Department of Physics, Faculty of Applied Sciences"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Equipment & Scheduling */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Selected Equipment & Timing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Choose Instrument *</label>
              <select
                required
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.category}) — ₹{eq.hourlyRateDemo}/hr
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
              <input
                type="date"
                required
                value={formData.preferredDateStart}
                onChange={(e) => setFormData({ ...formData, preferredDateStart: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Slot *</label>
              <select
                value={formData.preferredTimeSlot}
                onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="10:00 - 13:00 (Morning Slot)">10:00 - 13:00 (Morning Slot)</option>
                <option value="14:00 - 17:00 (Afternoon Slot)">14:00 - 17:00 (Afternoon Slot)</option>
                <option value="09:00 - 12:00 (Early Slot)">09:00 - 12:00 (Early Slot)</option>
                <option value="Custom Extended Session">Custom Extended Session</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours Needed *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.scheduledUsageHours}
                onChange={(e) => setFormData({ ...formData, scheduledUsageHours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Project Scope & Requirements */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Project Purpose & Technical Scope
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Research / Project Title *</label>
              <input
                type="text"
                required
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                placeholder="e.g. High-Resolution Surface Profiling of Graphene Thin Films"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Purpose & Special Sample Requirements *
              </label>
              <textarea
                rows={3}
                required
                value={formData.purposeNotes}
                onChange={(e) => setFormData({ ...formData, purposeNotes: e.target.value })}
                placeholder="Describe material type, dimensions, desired magnification/parameters, or whether sputter coating is needed..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submission Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            By submitting, you agree to follow the university laboratory operating and safety protocols.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading booking interface...</div>}>
      <BookFormContent />
    </Suspense>
  );
}
