'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { ServiceRequest, Equipment, StaffUser, WorkflowStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
          <h2 className="font-calistoga text-2xl text-[#0F172A]">Request & Sample Master Registry</h2>
          <p className="text-xs text-slate-500">
            Global administrative view of all submitted instrument reservations, technical reviews, and testing runs.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card variant="elevated" className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Tracking ID, investigator, or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
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
      </Card>

      {/* Requests Table */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-sans font-semibold">Tracking ID & Type</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Requester & Org</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Instrument Required</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Workflow Status</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Assigned Specialist</th>
                <th className="py-3.5 px-4 text-right font-sans font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => {
                const eq = equipmentList.find((e) => e.id === req.equipmentId);
                const assignedOwner = staffList.find((s) => s.id === req.assignedOwnerId);

                return (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-[#0052FF] block">{req.trackingId}</span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {req.requestType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-sans">
                      <p className="font-semibold text-slate-900">{req.requesterName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.requesterOrg}</p>
                    </td>

                    <td className="py-4 px-4 font-sans">
                      <p className="font-semibold text-slate-800">{eq ? eq.name : 'Unknown Instrument'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Date: {req.preferredDateStart}</p>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={req.status} isPublic={false} />
                    </td>

                    <td className="py-4 px-4 font-sans text-slate-700">
                      {assignedOwner ? assignedOwner.fullName : <span className="text-amber-600 font-medium font-mono text-[11px]">Pending Assignment</span>}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setTargetStatus(req.status);
                          setTargetOwner(req.assignedOwnerId || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#0052FF] font-mono font-semibold text-xs transition-colors cursor-pointer"
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
      </Card>

      {/* Detail / Override Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#0052FF]">{selectedRequest.trackingId}</span>
                <h3 className="font-calistoga text-xl text-[#0F172A] mt-0.5">
                  Administrative Workflow Override
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2 font-mono">
              <p><span className="text-slate-400 font-sans">Project:</span> {selectedRequest.projectTitle}</p>
              <p><span className="text-slate-400 font-sans">Requester:</span> {selectedRequest.requesterName} ({selectedRequest.requesterOrg})</p>
              <p><span className="text-slate-400 font-sans">Current Status:</span> <span className="text-[#0052FF] font-bold">{selectedRequest.status}</span></p>
              <p><span className="text-slate-400 font-sans">Notes:</span> {selectedRequest.purposeNotes}</p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Direct Status Transition</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as WorkflowStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer font-mono"
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
                    <option value="READY_FOR_HANDOVER">READY_FOR_HANDOVER</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Assign / Reassign Owner</label>
                  <select
                    value={targetOwner}
                    onChange={(e) => setTargetOwner(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Leave Unchanged / Unassigned --</option>
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
                <label className="block font-semibold text-slate-700 mb-1.5">Audit Action Description *</label>
                <textarea
                  rows={2}
                  required
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Reason for administrative status transition..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Apply Administrative Override
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
