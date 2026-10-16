'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FlaskConical,
  Copy,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest } from '@/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
        <Card variant="elevated" className="p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0052FF]/10 to-[#4D7CFF]/20 text-[#0052FF] flex items-center justify-center mx-auto border border-[#0052FF]/30">
            <FlaskConical className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="font-calistoga text-2xl sm:text-3xl text-[#0F172A]">
              Sample Testing Intake Logged
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your sample analysis request has been recorded. Package and deliver or courier your properly labeled samples to the Central Logistics & Reception Desk referencing this Tracking ID.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-2">
            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-slate-400">
              Sample Tracking Identifier
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
            <p><span className="text-slate-400 font-sans">Sample Description:</span> {createdRequest.sampleDetails?.description}</p>
            <p><span className="text-slate-400 font-sans">Batch Quantity:</span> {createdRequest.sampleDetails?.quantity}</p>
            <p><span className="text-slate-400 font-sans">Classification:</span> {createdRequest.sampleDetails?.isHazardous ? 'Declared Hazard (Controlled)' : 'Standard / Non-Hazardous'}</p>
            <p><span className="text-slate-400 font-sans">Disposition:</span> {createdRequest.sampleDetails?.returnRequested ? 'Return remnant to requester' : 'Dispose per lab protocol'}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              href={`/track?id=${createdRequest.trackingId}`}
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Track Sample Progress
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setCreatedRequest(null);
                setFormData((prev) => ({ ...prev, projectTitle: '', sampleDescription: '' }));
              }}
            >
              Submit Another Sample
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
          <SectionBadge label="SAMPLE TESTING SERVICES" />
          <h1 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
            Sample Submission Intake
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Dispatch specimens or materials for specialized laboratory analysis. An auditable, non-sequential tracking ID will be generated upon submission.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card variant="elevated" className="p-6 sm:p-10 space-y-8">
            {/* Requester Profile */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-[0.15em] border-b border-slate-100 pb-2">
                1. Investigator / Requester Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    placeholder="Dr. / Scholar Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.requesterEmail}
                    onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                    placeholder="investigator@paruluniversity.ac.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.requesterPhone}
                    onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organization / University *</label>
                  <input
                    type="text"
                    required
                    value={formData.requesterOrg}
                    onChange={(e) => setFormData({ ...formData, requesterOrg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department / Research Lab *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Selected Instrument */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-[0.15em] border-b border-slate-100 pb-2">
                2. Testing Instrument Required
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Analysis Equipment *</label>
                  <select
                    required
                    value={formData.equipmentId}
                    onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project / Study Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="e.g. Nanoparticle Size Analysis & Surface Morphology"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sample Specifications */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-semibold text-slate-900 uppercase tracking-[0.15em] border-b border-slate-100 pb-2">
                3. Sample Specifications & Safety Handling
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sample Description & Physical State *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.sampleDescription}
                    onChange={(e) => setFormData({ ...formData, sampleDescription: e.target.value })}
                    placeholder="e.g. Dry powder, thin film on silicon, colloidal aqueous suspension..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Batch / Sample Quantity *</label>
                    <input
                      type="text"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="e.g. 4 samples / 10 mg each"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Storage Conditions *</label>
                    <input
                      type="text"
                      required
                      value={formData.storageConditions}
                      onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                      placeholder="e.g. 4°C refrigerated, dark, dry desiccator"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Requested Characterization / Scan Modes *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.analysisRequested}
                    onChange={(e) => setFormData({ ...formData, analysisRequested: e.target.value })}
                    placeholder="Specify required magnification, spectral range, or custom modes..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Hazardous Materials Assessment */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHazardous}
                      onChange={(e) => setFormData({ ...formData, isHazardous: e.target.checked })}
                      className="w-4 h-4 text-[#0052FF] rounded"
                    />
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Contains Hazardous, Toxic, Radioactive, or Volatile Chemical Material
                    </span>
                  </label>

                  {formData.isHazardous && (
                    <div>
                      <label className="block text-xs font-semibold text-rose-700 mb-1.5">
                        Describe Hazard & Safe Handling Protocol *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formData.hazardNotes}
                        onChange={(e) => setFormData({ ...formData, hazardNotes: e.target.value })}
                        placeholder="Specify toxicity class, MSDS summary, and precautions..."
                        className="w-full px-3.5 py-2.5 border border-rose-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-rose-50/30"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.returnRequested}
                      onChange={(e) => setFormData({ ...formData, returnRequested: e.target.checked })}
                      className="w-4 h-4 text-[#0052FF] rounded"
                    />
                    <span className="text-xs text-slate-700">
                      Request physical sample remnants returned after analysis completion (Reception desk pickup)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-400">
                Sample intake is subject to physical verification upon delivery to the central reception desk.
              </p>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {loading ? 'Registering...' : 'Register Sample Intake'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function SubmitSamplePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs font-mono text-slate-500">Loading sample submission...</div>}>
      <SubmitSampleContent />
    </Suspense>
  );
}
