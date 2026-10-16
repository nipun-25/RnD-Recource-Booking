'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Microscope,
  Play,
  Check,
  Wrench,
  ShieldAlert,
  X,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest, WorkflowStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function OwnerDashboardPage() {
  const { role, currentUser, isHydrated, switchRoleDev } = useAuth();
  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [modalAction, setModalAction] = useState<'feasibility' | 'session' | 'complete' | 'maintenance' | null>(null);

  // Form states
  const [ownerDecision, setOwnerDecision] = useState<'accept' | 'reject' | 'clarify'>('accept');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [actualHoursRecorded, setActualHoursRecorded] = useState(2.0);

  // Maintenance form state
  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');

  const loadData = useCallback(async () => {
    const [allEq, allReqs] = await Promise.all([
      dataStore.getEquipmentList(),
      dataStore.getRequests('owner', currentUser?.id),
    ]);

    const assignedIds = currentUser?.assignedEquipmentIds || [];
    const owned = allEq.filter((e) => assignedIds.includes(e.id) || role === 'admin');
    setMyEquipment(owned);

    const authorizedReqs = allReqs.filter(
      (r) => r.assignedOwnerId === currentUser?.id || assignedIds.includes(r.equipmentId) || role === 'admin'
    );
    setMyRequests(authorizedReqs);
  }, [currentUser, role]);

  useEffect(() => {
    if (!isHydrated) return;
    loadData();
  }, [isHydrated, loadData]);

  if (!isHydrated) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-500">Validating equipment owner credentials...</p>
      </div>
    );
  }

  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 sm:p-10 bg-white border border-slate-200 rounded-3xl shadow-lg text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-calistoga text-2xl text-slate-900">Equipment Specialist Workstation</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
          You are currently viewing as <span className="font-mono font-bold text-slate-800">{role.toUpperCase()}</span>. Designated instrument owner permissions are required to evaluate feasibility, execute scans, and log maintenance.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => switchRoleDev('owner', 'staff-owner-1')}
            variant="primary"
            size="md"
            icon={<Microscope className="w-4 h-4" />}
          >
            Switch to Owner (Dr. Sharma - FE-SEM & AFM)
          </Button>
        </div>
      </div>
    );
  }

  const handleFeasibilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    let nextStatus: WorkflowStatus = 'QUOTATION_READY';
    if (ownerDecision === 'reject') nextStatus = 'OWNER_REJECTED';
    if (ownerDecision === 'clarify') nextStatus = 'OWNER_CLARIFICATION';

    await dataStore.updateRequestStatus(
      activeRequest.trackingId,
      nextStatus,
      currentUser?.fullName || 'Dr. Rajesh Sharma',
      'owner',
      `Technical Review Decision: ${ownerDecision.toUpperCase()}. Details: ${technicalNotes}`
    );

    await dataStore.updateRequestDetails(
      activeRequest.trackingId,
      {
        scheduledUsageHours: estimatedHours,
        publicNotes:
          ownerDecision === 'accept'
            ? 'Technical feasibility validated by laboratory specialist.'
            : 'Technical review noted specific constraints or clarifications.',
      },
      currentUser?.fullName || 'Dr. Rajesh Sharma',
      'owner'
    );

    setActiveRequest(null);
    loadData();
  };

  const handleStartRun = async (req: ServiceRequest) => {
    await dataStore.updateRequestStatus(
      req.trackingId,
      'PROCESSING',
      currentUser?.fullName || 'Dr. Rajesh Sharma',
      'owner',
      'Commenced active instrument run / scan session.'
    );

    await dataStore.updateRequestDetails(
      req.trackingId,
      {
        publicNotes: 'Analysis actively running on instrument. Measurements in progress.',
      },
      currentUser?.fullName || 'Dr. Rajesh Sharma',
      'owner'
    );

    loadData();
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    await dataStore.updateRequestStatus(
      activeRequest.trackingId,
      'READY_FOR_HANDOVER',
      currentUser?.fullName || 'Dr. Rajesh Sharma',
      'owner',
      `Run concluded. Actual hours logged: ${actualHoursRecorded} hrs. Report and samples delivered to reception.`
    );

    await dataStore.updateRequestDetails(
      activeRequest.trackingId,
      {
        actualUsageHours: Number(actualHoursRecorded),
        publicNotes: 'Testing and characterization finished. Data compilation complete.',
      },
      currentUser?.fullName || 'Dr. Rajesh Sharma',
      'owner'
    );

    setActiveRequest(null);
    loadData();
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myEquipment.length === 0) return;

    await dataStore.addMaintenanceRecord(
      {
        equipmentId: myEquipment[0].id,
        title: maintTitle,
        reportedBy: currentUser?.fullName || 'Dr. Rajesh Sharma',
        startDate: new Date().toISOString().split('T')[0],
        estimatedEndDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'active',
        description: maintDesc,
      },
      currentUser?.fullName || 'Dr. Rajesh Sharma',
      'owner'
    );

    setModalAction(null);
    setMaintTitle('');
    setMaintDesc('');
    loadData();
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="rounded-3xl bg-[#0F172A] text-white p-7 sm:p-9 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0052FF]/20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <SectionBadge label="EQUIPMENT SPECIALIST WORKSTATION" className="border-white/20 bg-white/5" />
              <h1 className="font-calistoga text-2xl sm:text-3xl text-white">
                Assigned Instruments & Feasibility Queue
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Active Specialist: <span className="text-[#4D7CFF] font-semibold">{currentUser?.fullName}</span> ({currentUser?.department})
              </p>
            </div>

            <Button
              onClick={() => setModalAction('maintenance')}
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 shrink-0"
              icon={<Wrench className="w-4 h-4" />}
            >
              Report Tool Maintenance
            </Button>
          </div>
        </div>

        {/* Authorized Instruments Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0052FF]" />
            <h2 className="font-calistoga text-xl text-[#0F172A]">
              My Authorized Instruments ({myEquipment.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myEquipment.map((eq) => (
              <Card key={eq.id} variant="elevated" className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {eq.category}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      eq.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {eq.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-[#0F172A]">{eq.name}</h3>
                <p className="font-mono text-xs text-slate-400">{eq.model} • {eq.location}</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{eq.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Authorized Requests Table */}
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-calistoga text-xl text-[#0F172A]">Assigned Operational Requests</h2>
            <p className="text-xs text-slate-500">
              Workflows routed specifically to your instruments for technical feasibility review, scanning execution, and report handover.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-sans font-semibold">Tracking ID</th>
                  <th className="py-3.5 px-4 font-sans font-semibold">Requester & Project</th>
                  <th className="py-3.5 px-4 font-sans font-semibold">Scheduled Slot</th>
                  <th className="py-3.5 px-4 font-sans font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-sans font-semibold">Specialist Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-[#0052FF] block">{req.trackingId}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {req.requestType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-sans">
                      <p className="font-semibold text-slate-900">{req.projectTitle}</p>
                      <p className="text-[11px] text-slate-500">{req.requesterName} ({req.requesterOrg})</p>
                    </td>

                    <td className="py-4 px-4 text-slate-700">
                      <p className="font-semibold text-slate-800">{req.preferredDateStart}</p>
                      <p className="text-[11px] text-slate-400">{req.preferredTimeSlot || 'Standard session'}</p>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={req.status} isPublic={false} />
                    </td>

                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      {req.status === 'AWAITING_OWNER_REVIEW' && (
                        <button
                          onClick={() => {
                            setActiveRequest(req);
                            setModalAction('feasibility');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0052FF]/10 text-[#0052FF] hover:bg-[#0052FF]/20 font-mono font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Feasibility Review
                        </button>
                      )}

                      {['CONFIRMED', 'SAMPLES_RECEIVED'].includes(req.status) && (
                        <button
                          onClick={() => handleStartRun(req)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-mono font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          Start Session
                        </button>
                      )}

                      {req.status === 'PROCESSING' && (
                        <button
                          onClick={() => {
                            setActiveRequest(req);
                            setModalAction('complete');
                            setActualHoursRecorded(req.scheduledUsageHours || 2.0);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Log Completion
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveRequest(req);
                          setModalAction('feasibility');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-mono text-xs cursor-pointer transition-colors"
                      >
                        View Specs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Feasibility Review Modal */}
        {activeRequest && modalAction === 'feasibility' && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card variant="elevated" className="max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#0052FF]">{activeRequest.trackingId}</span>
                  <h3 className="font-calistoga text-xl text-[#0F172A] mt-0.5">Technical Feasibility Assessment</h3>
                </div>
                <button
                  onClick={() => setActiveRequest(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2 font-mono">
                <p><span className="text-slate-400 font-sans">Project:</span> {activeRequest.projectTitle}</p>
                <p><span className="text-slate-400 font-sans">Requester Notes:</span> {activeRequest.purposeNotes}</p>
                {activeRequest.sampleDetails && (
                  <div className="border-t border-slate-200 pt-2 space-y-1">
                    <p><span className="text-slate-400 font-sans">Sample Description:</span> {activeRequest.sampleDetails.description}</p>
                    <p><span className="text-slate-400 font-sans">Quantity:</span> {activeRequest.sampleDetails.quantity}</p>
                    <p><span className="text-slate-400 font-sans">Hazardous:</span> {activeRequest.sampleDetails.isHazardous ? 'YES' : 'NO'}</p>
                    <p><span className="text-slate-400 font-sans">Analysis:</span> {activeRequest.sampleDetails.analysisRequested}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleFeasibilitySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Feasibility Decision</label>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setOwnerDecision('accept')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                        ownerDecision === 'accept'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Accept Feasible
                    </button>
                    <button
                      type="button"
                      onClick={() => setOwnerDecision('clarify')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                        ownerDecision === 'clarify'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Clarify
                    </button>
                    <button
                      type="button"
                      onClick={() => setOwnerDecision('reject')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                        ownerDecision === 'reject'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Estimated Run Time (Hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Technical Evaluation & Operational Notes *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={technicalNotes}
                    onChange={(e) => setTechnicalNotes(e.target.value)}
                    placeholder="Record required chamber conditions, voltage parameters, or safety reasons..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveRequest(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Log Completion Modal */}
        {activeRequest && modalAction === 'complete' && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card variant="elevated" className="max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-calistoga text-lg text-[#0F172A]">Record Session Completion</h3>
                <button
                  onClick={() => setActiveRequest(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCompleteSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Actual Operating Hours Verified *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={actualHoursRecorded}
                    onChange={(e) => setActualHoursRecorded(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Session Notes & Handover Notice
                  </label>
                  <textarea
                    rows={2}
                    value={technicalNotes}
                    onChange={(e) => setTechnicalNotes(e.target.value)}
                    placeholder="e.g. Scans completed cleanly. TIFFs uploaded to secure drive."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveRequest(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Complete & Handover
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Maintenance Modal */}
        {modalAction === 'maintenance' && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card variant="elevated" className="max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-calistoga text-lg text-[#0F172A]">Report Maintenance & Downtime</h3>
                <button
                  onClick={() => setModalAction(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMaintenance} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Maintenance Title / Issue *</label>
                  <input
                    type="text"
                    required
                    value={maintTitle}
                    onChange={(e) => setMaintTitle(e.target.value)}
                    placeholder="e.g. Ion pump bakeout or tip calibration"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Technical Diagnosis *</label>
                  <textarea
                    rows={3}
                    required
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    placeholder="Detailed symptoms, affected components, or routine service schedule..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalAction(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Submit Notice
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
