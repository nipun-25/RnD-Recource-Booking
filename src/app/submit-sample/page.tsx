'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FlaskConical,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest } from '@/types';

function SubmitSampleContent() {
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
    department: 'Institute of Pharmacy',
    equipmentId: preselectedEqId,
    preferredDateStart: '',
    projectTitle: '',
    purposeNotes: '',
    sampleDescription: '',
    quantity: '3 vials (5 mL each)',
    storageConditions: 'Room temperature, dry desiccator',
    isHazardous: false,
    hazardNotes: '',
    analysisRequested: 'Morphology scan, size distribution, and optical absorbance',
    returnRequested: true,
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
        requestType: 'sample_analysis',
        requesterName: formData.requesterName,
        requesterEmail: formData.requesterEmail,
        requesterPhone: formData.requesterPhone,
        requesterOrg: formData.requesterOrg,
        department: formData.department,
        equipmentId: formData.equipmentId,
        preferredDateStart: formData.preferredDateStart || new Date().toISOString().split('T')[0],
        projectTitle: formData.projectTitle,
        purposeNotes: formData.purposeNotes,
        sampleDetails: {
          description: formData.sampleDescription,
          quantity: formData.quantity,
          storageConditions: formData.storageConditions,
          isHazardous: formData.isHazardous,
          hazardNotes: formData.isHazardous ? formData.hazardNotes : undefined,
          analysisRequested: formData.analysisRequested,
          returnRequested: formData.returnRequested,
        },
      });

      setCreatedRequest(result);
    } catch (err) {
      alert('Error submitting sample intake. Please verify fields.');
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
          <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto">
            <FlaskConical className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Sample Testing Intake Logged!</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your sample analysis request has been logged. Deliver or courier your properly labeled samples to the Central Logistics & Reception Desk referencing this Tracking ID.
            </p>
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-cyan-300 rounded-xl p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sample Tracking Identifier
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-800">
                {createdRequest.trackingId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-cyan-700 shadow-xs transition-colors"
                title="Copy Tracking ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-[11px] text-cyan-600 font-medium">Copied to clipboard!</p>}
          </div>

          <div className="text-left text-xs bg-slate-50 p-4 rounded-xl space-y-1.5 text-slate-700 border border-slate-100">
            <p><strong>Sample Description:</strong> {createdRequest.sampleDetails?.description}</p>
            <p><strong>Quantity:</strong> {createdRequest.sampleDetails?.quantity}</p>
            <p><strong>Hazard Classification:</strong> {createdRequest.sampleDetails?.isHazardous ? 'Declared Hazard' : 'Non-Hazardous'}</p>
            <p><strong>Sample Return:</strong> {createdRequest.sampleDetails?.returnRequested ? 'Return after testing' : 'Dispose after testing'}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/track?id=${createdRequest.trackingId}`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              Track Sample Progress
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                setCreatedRequest(null);
                setFormData((prev) => ({ ...prev, projectTitle: '', sampleDescription: '' }));
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Submit Another Sample
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FlaskConical className="w-4 h-4" />
          <span>R&D Cell • Sample Testing Services</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sample Submission Intake</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Submit material samples for characterization without creating an account. Auditable tracking ID generated on completion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Requester Profile */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Investigator / Requester Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="Dr. / Scholar Name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                placeholder="investigator@domain.edu.in"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={formData.requesterPhone}
                onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization *</label>
              <input
                type="text"
                required
                value={formData.requesterOrg}
                onChange={(e) => setFormData({ ...formData, requesterOrg: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Research Lab *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Selected Instrument */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Testing Instrument Required
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Analysis Equipment *</label>
              <select
                required
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project / Study Title *</label>
              <input
                type="text"
                required
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                placeholder="e.g. Nanoparticle Size Analysis & Surface Morphology"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sample Properties */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Sample Specifications & Safety
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sample Description & Physical State *
              </label>
              <textarea
                rows={2}
                required
                value={formData.sampleDescription}
                onChange={(e) => setFormData({ ...formData, sampleDescription: e.target.value })}
                placeholder="e.g. Dry powder, thin film on silicon, colloidal aqueous suspension..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Sample Quantity *</label>
                <input
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g. 4 samples / 10 mg each"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Conditions *</label>
                <input
                  type="text"
                  required
                  value={formData.storageConditions}
                  onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                  placeholder="e.g. 4°C refrigerated, dark, dry desiccator"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested Characterization / Scan Parameters *
              </label>
              <textarea
                rows={2}
                required
                value={formData.analysisRequested}
                onChange={(e) => setFormData({ ...formData, analysisRequested: e.target.value })}
                placeholder="Specify required magnification, spectral range, or specific modes..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Hazardous Materials Checkbox */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isHazardous}
                  onChange={(e) => setFormData({ ...formData, isHazardous: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Contains Hazardous, Toxic, Radioactive, or Volatile Material
                </span>
              </label>

              {formData.isHazardous && (
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    Describe Hazard & Safe Handling Protocol *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.hazardNotes}
                    onChange={(e) => setFormData({ ...formData, hazardNotes: e.target.value })}
                    placeholder="Specify toxicity class, MSDS summary, and precautions..."
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-rose-50/40"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.returnRequested}
                  onChange={(e) => setFormData({ ...formData, returnRequested: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-xs text-slate-700">
                  Request physical sample remnants returned after analysis completion (Pickup at reception)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            Intake is subject to reception physical inspection upon sample delivery.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Register Sample Intake'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SubmitSamplePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading sample submission...</div>}>
      <SubmitSampleContent />
    </Suspense>
  );
}
