'use client';

import React, { useState, useEffect } from 'react';
import {
  Microscope,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Check,
  AlertTriangle,
  Wrench,
  FileText,
  UserCheck,
  ShieldAlert,
  Calendar,
  X,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, ServiceRequest, MaintenanceRecord, WorkflowStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';

export default function OwnerDashboardPage() {
  const { role, currentUser, isHydrated, switchRoleDev } = useAuth();
  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
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

  const loadData = async () => {
    const [allEq, allReqs, maint] = await Promise.all([
      dataStore.getEquipmentList(),
      dataStore.getRequests('owner', currentUser?.id),
      dataStore.getMaintenanceRecords(),
    ]);

    // Filter equipment assigned to this owner
    const assignedIds = currentUser?.assignedEquipmentIds || [];
    const owned = allEq.filter((e) => assignedIds.includes(e.id) || role === 'admin');
    setMyEquipment(owned);

    // Filter requests strictly for this owner or assigned equipment
    const authorizedReqs = allReqs.filter(
      (r) => r.assignedOwnerId === currentUser?.id || assignedIds.includes(r.equipmentId) || role === 'admin'
    );
    setMyRequests(authorizedReqs);

    const relevantMaint = maint.filter(
      (m) => assignedIds.includes(m.equipmentId) || role === 'admin'
    );
    setMaintenanceRecords(relevantMaint);
  };

  useEffect(() => {
    if (!isHydrated) return;
    loadData();
  }, [currentUser, role, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Validating equipment owner session...</p>
      </div>
    );
  }

  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-amber-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Equipment Specialist Workstation</h2>
        <p className="text-xs text-slate-600">
          You are currently viewing as &quot;{role.toUpperCase()}&quot;. Equipment owner permissions are required to review technical feasibility, execute runs, and report instrument maintenance.
        </p>
        <div className="pt-2">
          <button
            onClick={() => switchRoleDev('owner', 'staff-owner-1')}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-colors"
          >
            <Microscope className="w-4 h-4" />
            Switch to Owner (Dr. Sharma - FE-SEM & AFM)
          </button>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
            Technical Specialist Workstation • Role: Equipment Owner
          </span>
          <h1 className="text-2xl font-black mt-1">Authorized Instruments & Feasibility Queue</h1>
          <p className="text-xs text-slate-300 mt-1">
            Active Officer: <span className="text-amber-300 font-bold">{currentUser?.fullName}</span> ({currentUser?.department})
          </p>
        </div>

        <button
          onClick={() => setModalAction('maintenance')}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Wrench className="w-4 h-4" />
          Report Tool Maintenance / Downtime
        </button>
      </div>

      {/* Authorized Instruments Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          My Authorized Instruments ({myEquipment.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myEquipment.map((eq) => (
            <div key={eq.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {eq.category}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    eq.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {eq.status.toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{eq.name}</h3>
              <p className="font-mono text-xs text-slate-500">{eq.model} • {eq.location}</p>
              <p className="text-xs text-slate-600 line-clamp-2">{eq.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Authorized Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Assigned Operational Requests</h2>
          <p className="text-xs text-slate-500">
            Requests routed specifically to your instruments for technical feasibility, scanning runs, and report certification.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Requester & Project</th>
                <th className="py-3 px-4">Scheduled Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Specialist Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-amber-900">{req.trackingId}</span>
                    <span className="block text-[10px] text-slate-400 uppercase">
                      {req.requestType.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{req.projectTitle}</p>
                    <p className="text-[11px] text-slate-500">{req.requesterName} ({req.requesterOrg})</p>
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    <p className="font-medium">{req.preferredDateStart}</p>
                    <p className="text-[11px] text-slate-500">{req.preferredTimeSlot || 'Standard session'}</p>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={req.status} isPublic={false} />
                  </td>

                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {req.status === 'AWAITING_OWNER_REVIEW' && (
                      <button
                        onClick={() => {
                          setActiveRequest(req);
                          setModalAction('feasibility');
                        }}
                        className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors"
                      >
                        Feasibility Review
                      </button>
                    )}

                    {['CONFIRMED', 'SAMPLES_RECEIVED'].includes(req.status) && (
                      <button
                        onClick={() => handleStartRun(req)}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-colors"
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
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-colors"
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
                      className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
                    >
                      View Specs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feasibility Review Modal */}
      {activeRequest && modalAction === 'feasibility' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-700">{activeRequest.trackingId}</span>
                <h3 className="text-base font-bold text-slate-900">Technical Feasibility Assessment</h3>
              </div>
              <button
                onClick={() => setActiveRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
              <p><strong>Project:</strong> {activeRequest.projectTitle}</p>
              <p><strong>Requester Notes:</strong> {activeRequest.purposeNotes}</p>
              {activeRequest.sampleDetails && (
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <p><strong>Sample Description:</strong> {activeRequest.sampleDetails.description}</p>
                  <p><strong>Quantity:</strong> {activeRequest.sampleDetails.quantity}</p>
                  <p><strong>Hazardous:</strong> {activeRequest.sampleDetails.isHazardous ? 'YES' : 'NO'}</p>
                  <p><strong>Analysis:</strong> {activeRequest.sampleDetails.analysisRequested}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleFeasibilitySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feasibility Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOwnerDecision('accept')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
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
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                      ownerDecision === 'clarify'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Need Clarification
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnerDecision('reject')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                      ownerDecision === 'reject'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Reject Request
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Run Time (Hours)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Specialist Technical Evaluation & Operational Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  placeholder="Record required chamber conditions, voltage parameters, or safety reasons..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-xs"
                >
                  Submit Feasibility Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Completion Modal */}
      {activeRequest && modalAction === 'complete' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Session Completion</h3>
              <button
                onClick={() => setActiveRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Operating Hours Verified *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={actualHoursRecorded}
                  onChange={(e) => setActualHoursRecorded(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Notes & Completion Handover
                </label>
                <textarea
                  rows={2}
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  placeholder="e.g. Scans completed cleanly. TIFFs uploaded to secure lab drive."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                >
                  Complete & Notify Reception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {modalAction === 'maintenance' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Report Tool Maintenance & Downtime</h3>
              <button
                onClick={() => setModalAction(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaintenance} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maintenance Title / Issue *</label>
                <input
                  type="text"
                  required
                  value={maintTitle}
                  onChange={(e) => setMaintTitle(e.target.value)}
                  placeholder="e.g. Ion pump bakeout or tip calibration"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technical Diagnosis *</label>
                <textarea
                  rows={3}
                  required
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  placeholder="Detailed symptoms, affected components, or scheduled routine service..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-xs"
                >
                  Submit Maintenance Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
