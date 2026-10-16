'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  UserCheck,
  CheckCircle2,
  Calendar,
  Microscope,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { ServiceRequest, Equipment, StaffUser, WorkflowStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';

export default function AdminRequestsPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<WorkflowStatus>('APPROVED');
  const [targetOwner, setTargetOwner] = useState('');

  const loadData = async () => {
    const [reqs, eqs, staff] = await Promise.all([
      dataStore.getRequests(),
      dataStore.getEquipmentList(),
      dataStore.getStaffList(),
    ]);
    setRequests(reqs);
    setEquipmentList(eqs);
    setStaffList(staff);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      r.projectTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    await dataStore.updateRequestStatus(
      selectedRequest.trackingId,
      targetStatus,
      currentUser?.fullName || 'Dr. Anand Joshi',
      'admin',
      actionNotes
    );

    if (targetOwner) {
      await dataStore.updateRequestDetails(
        selectedRequest.trackingId,
        { assignedOwnerId: targetOwner },
        currentUser?.fullName || 'Dr. Anand Joshi',
        'admin'
      );
    }

    setSelectedRequest(null);
    setActionNotes('');
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Request & Sample Master Registry</h2>
          <p className="text-xs text-slate-500">
            Global administrative view of all submitted instrument reservations, technical reviews, and testing runs.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Tracking ID, investigator, or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg py-1.5 px-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Statuses ({requests.length})</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="AWAITING_OWNER_REVIEW">AWAITING_OWNER_REVIEW</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="READY_FOR_HANDOVER">READY_FOR_HANDOVER</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tracking ID & Type</th>
                <th className="py-3 px-4">Requester & Org</th>
                <th className="py-3 px-4">Instrument Required</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Assigned Specialist</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => {
                const eq = equipmentList.find((e) => e.id === req.equipmentId);
                const assignedOwner = staffList.find((s) => s.id === req.assignedOwnerId);

                return (
                  <tr key={req.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-purple-700">{req.trackingId}</span>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">
                        {req.requestType.replace('_', ' ')}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{req.requesterName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.requesterOrg}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{eq ? eq.name : 'Unknown Instrument'}</p>
                      <p className="text-[11px] text-slate-500">Date: {req.preferredDateStart}</p>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} isPublic={false} />
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {assignedOwner ? assignedOwner.fullName : <span className="text-amber-600">Pending Assignment</span>}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setTargetStatus(req.status);
                          setTargetOwner(req.assignedOwnerId || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition-colors"
                      >
                        Inspect / Override
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Override Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-700">
                  {selectedRequest.trackingId}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Administrative Request Inspector & Override
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500">Requester:</span>
                <p className="font-semibold text-slate-900">{selectedRequest.requesterName}</p>
                <p className="text-[11px] text-slate-500">{selectedRequest.requesterEmail} • {selectedRequest.requesterPhone}</p>
              </div>

              <div>
                <span className="text-slate-500">Project / Scope:</span>
                <p className="font-semibold text-slate-900">{selectedRequest.projectTitle}</p>
                <p className="text-[11px] text-slate-500">{selectedRequest.purposeNotes}</p>
              </div>

              {selectedRequest.sampleDetails && (
                <div className="col-span-2 border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Sample Parameters:</span>
                  <p className="text-slate-800">
                    {selectedRequest.sampleDetails.description} ({selectedRequest.sampleDetails.quantity}) •
                    Hazard: {selectedRequest.sampleDetails.isHazardous ? 'YES' : 'NONE'}
                  </p>
                </div>
              )}

              <div className="col-span-2 border-t border-slate-200 pt-2">
                <span className="text-slate-500">Internal Audit Trail Notes:</span>
                <pre className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 font-mono whitespace-pre-wrap mt-1">
                  {selectedRequest.internalNotes || 'No internal notes recorded yet.'}
                </pre>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Override Workflow Status</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as WorkflowStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="AWAITING_OWNER_REVIEW">AWAITING_OWNER_REVIEW</option>
                    <option value="QUOTATION_READY">QUOTATION_READY</option>
                    <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SAMPLES_RECEIVED">SAMPLES_RECEIVED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="READY_FOR_HANDOVER">READY_FOR_HANDOVER</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reassign Equipment Specialist</label>
                  <select
                    value={targetOwner}
                    onChange={(e) => setTargetOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">-- Leave Unchanged --</option>
                    {staffList
                      .filter((s) => s.role === 'owner')
                      .map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.fullName} ({st.department})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Administrative Override Reason / Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record formal justification for status adjustment or staff reassignment..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs"
                >
                  Save Administrative Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
