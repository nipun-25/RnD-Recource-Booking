'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  FileCheck,
  Package,
  AlertCircle,
  Truck,
  MessageSquare,
  DollarSign,
  X,
  ShieldAlert,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { ServiceRequest, Equipment, StaffUser, WorkflowStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';

export default function ReceptionDashboardPage() {
  const { role, currentUser, isHydrated, switchRoleDev } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'new' | 'assigned' | 'quotes' | 'samples' | 'completed'>('all');
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [modalMode, setModalMode] = useState<'triage' | 'quote' | 'sample' | 'dispatch' | null>(null);

  // Modal form states
  const [assignOwnerId, setAssignOwnerId] = useState('');
  const [quoteAmount, setQuoteAmount] = useState<number>(2000);
  const [receptionNotes, setReceptionNotes] = useState('');
  const [publicNotice, setPublicNotice] = useState('');

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
    if (!isHydrated) return;
    loadData();
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Validating reception session...</p>
      </div>
    );
  }

  if (role !== 'reception' && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-teal-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Reception Desk Access Required</h2>
        <p className="text-xs text-slate-600">
          You are currently viewing as &quot;{role.toUpperCase()}&quot;. Front desk receptionist credentials are required to triage submissions, issue quotations, and log sample intake.
        </p>
        <div className="pt-2">
          <button
            onClick={() => switchRoleDev('reception')}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Switch to Reception Role (Kinjal Patel)
          </button>
        </div>
      </div>
    );
  }

  // Filtering tabs
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      r.projectTitle.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'new') return ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status);
    if (filterTab === 'assigned') return ['AWAITING_OWNER_REVIEW', 'OWNER_CLARIFICATION'].includes(r.status);
    if (filterTab === 'quotes') return ['QUOTATION_READY', 'QUOTATION_SENT', 'AWAITING_USER_DECISION'].includes(r.status);
    if (filterTab === 'samples') return ['APPROVED', 'CONFIRMED', 'SAMPLES_RECEIVED', 'PROCESSING'].includes(r.status);
    if (filterTab === 'completed') return ['COMPLETED', 'READY_FOR_HANDOVER', 'DISPATCHED'].includes(r.status);
    return true;
  });

  const openActionModal = (req: ServiceRequest, mode: 'triage' | 'quote' | 'sample' | 'dispatch') => {
    setActiveRequest(req);
    setModalMode(mode);
    setAssignOwnerId(req.assignedOwnerId || '');
    setQuoteAmount(req.quotationAmount || 2500);
    setReceptionNotes('');
    setPublicNotice(req.publicNotes || '');
  };

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    // Transition status to AWAITING_OWNER_REVIEW
    await dataStore.updateRequestStatus(
      activeRequest.trackingId,
      'AWAITING_OWNER_REVIEW',
      currentUser?.fullName || 'Kinjal Patel',
      'reception',
      `Assigned to equipment specialist. Notes: ${receptionNotes}`
    );

    await dataStore.updateRequestDetails(
      activeRequest.trackingId,
      {
        assignedOwnerId: assignOwnerId,
        publicNotes: publicNotice || 'Request screened and assigned for technical feasibility review.',
      },
      currentUser?.fullName || 'Kinjal Patel',
      'reception'
    );

    setActiveRequest(null);
    loadData();
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    await dataStore.updateRequestStatus(
      activeRequest.trackingId,
      'QUOTATION_SENT',
      currentUser?.fullName || 'Kinjal Patel',
      'reception',
      `Official quotation ₹${quoteAmount} dispatched to ${activeRequest.requesterEmail}`
    );

    await dataStore.updateRequestDetails(
      activeRequest.trackingId,
      {
        quotationAmount: Number(quoteAmount),
        quotationStatus: 'sent',
        publicNotes: `Official quotation issued (₹${quoteAmount}). Awaiting user confirmation.`,
      },
      currentUser?.fullName || 'Kinjal Patel',
      'reception'
    );

    setActiveRequest(null);
    loadData();
  };

  const handleSampleReceipt = async () => {
    if (!activeRequest) return;
    await dataStore.updateRequestStatus(
      activeRequest.trackingId,
      'SAMPLES_RECEIVED',
      currentUser?.fullName || 'Kinjal Patel',
      'reception',
      `Samples physically received at reception and inspected: ${receptionNotes || 'All labels verified'}`
    );

    await dataStore.updateRequestDetails(
      activeRequest.trackingId,
      {
        publicNotes: 'Physical samples received at central reception desk. Handed to lab bay.',
      },
      currentUser?.fullName || 'Kinjal Patel',
      'reception'
    );

    setActiveRequest(null);
    loadData();
  };

  const handleDispatchSubmit = async () => {
    if (!activeRequest) return;
    await dataStore.updateRequestStatus(
      activeRequest.trackingId,
      'DISPATCHED',
      currentUser?.fullName || 'Kinjal Patel',
      'reception',
      `Results/remnants dispatched or collected in-person: ${receptionNotes}`
    );

    await dataStore.updateRequestDetails(
      activeRequest.trackingId,
      {
        publicNotes: 'Testing reports dispatched to registered email. Sample remnants archived/delivered.',
      },
      currentUser?.fullName || 'Kinjal Patel',
      'reception'
    );

    setActiveRequest(null);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs text-teal-300 font-semibold uppercase tracking-wider">
            Front Desk & Logistics Desk • Central Facility
          </span>
          <h1 className="text-2xl font-black mt-1">Reception Intake & Request Dispatch Queue</h1>
          <p className="text-xs text-slate-300 mt-1">
            Validate submissions, assign equipment specialists, generate quotations, and manage sample custody.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-xs">
          <div>
            <span className="text-teal-300 block text-[10px] uppercase font-bold">Queue Size</span>
            <span className="text-lg font-black">{requests.length} Submissions</span>
          </div>
          <div className="border-l border-white/20 pl-3">
            <span className="text-teal-300 block text-[10px] uppercase font-bold">New Submissions</span>
            <span className="text-lg font-black text-amber-300">
              {requests.filter((r) => r.status === 'SUBMITTED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
          {[
            { id: 'all', label: `All (${requests.length})` },
            { id: 'new', label: 'New / Intake' },
            { id: 'assigned', label: 'With Specialist' },
            { id: 'quotes', label: 'Quotations' },
            { id: 'samples', label: 'Active Runs / Samples' },
            { id: 'completed', label: 'Ready / Dispatch' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterTab === t.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracking ID or requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Requests Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tracking ID & Date</th>
                <th className="py-3 px-4">Requester & Contact</th>
                <th className="py-3 px-4">Instrument & Scope</th>
                <th className="py-3 px-4">Current Workflow Stage</th>
                <th className="py-3 px-4">Quotation Status</th>
                <th className="py-3 px-4 text-right">Desk Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const eq = equipmentList.find((e) => e.id === req.equipmentId);
                const owner = staffList.find((s) => s.id === req.assignedOwnerId);

                return (
                  <tr key={req.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-teal-800">{req.trackingId}</span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{req.requesterName}</p>
                      <p className="text-[11px] text-slate-500">{req.requesterOrg}</p>
                      <p className="text-[10px] text-slate-400">{req.requesterPhone}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{eq ? eq.name : 'Unknown Equipment'}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.projectTitle}</p>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} isPublic={false} />
                      {owner && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Owner: <span className="font-medium text-slate-700">{owner.fullName}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {req.quotationAmount ? (
                        <div>
                          <p className="font-bold text-slate-900">₹{req.quotationAmount}</p>
                          <span className="text-[10px] uppercase font-semibold text-teal-700">
                            {req.quotationStatus || 'Prepared'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unquoted</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {req.status === 'SUBMITTED' && (
                        <button
                          onClick={() => openActionModal(req, 'triage')}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition-colors"
                        >
                          Triage & Assign
                        </button>
                      )}

                      {['UNDER_REVIEW', 'AWAITING_OWNER_REVIEW', 'QUOTATION_READY'].includes(req.status) && (
                        <button
                          onClick={() => openActionModal(req, 'quote')}
                          className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs transition-colors"
                        >
                          Issue Quote
                        </button>
                      )}

                      {['APPROVED', 'CONFIRMED'].includes(req.status) && req.requestType !== 'booking' && (
                        <button
                          onClick={() => openActionModal(req, 'sample')}
                          className="px-2.5 py-1 rounded bg-violet-50 hover:bg-violet-100 text-violet-800 font-semibold text-xs transition-colors"
                        >
                          Log Sample Receipt
                        </button>
                      )}

                      {req.status === 'READY_FOR_HANDOVER' && (
                        <button
                          onClick={() => openActionModal(req, 'dispatch')}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors"
                        >
                          Mark Dispatched
                        </button>
                      )}

                      <button
                        onClick={() => openActionModal(req, 'triage')}
                        className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modals */}
      {activeRequest && modalMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">{activeRequest.trackingId}</span>
                <h3 className="text-base font-bold text-slate-900">
                  {modalMode === 'triage' && 'Reception Screening & Specialist Assignment'}
                  {modalMode === 'quote' && 'Record & Dispatch Formal Quotation'}
                  {modalMode === 'sample' && 'Log Physical Sample Custody'}
                  {modalMode === 'dispatch' && 'Final Handover / Dispatch Validation'}
                </h3>
              </div>
              <button
                onClick={() => setActiveRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {modalMode === 'triage' && (
              <form onSubmit={handleTriageSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Designate Equipment Technical Specialist *
                  </label>
                  <select
                    required
                    value={assignOwnerId}
                    onChange={(e) => setAssignOwnerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">-- Select Faculty Specialist --</option>
                    {staffList
                      .filter((s) => s.role === 'owner')
                      .map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.fullName} ({st.department})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Reception Notes</label>
                  <textarea
                    rows={2}
                    value={receptionNotes}
                    onChange={(e) => setReceptionNotes(e.target.value)}
                    placeholder="e.g. Requester details verified. Sample specs look within rating."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Public Operational Notice</label>
                  <input
                    type="text"
                    value={publicNotice}
                    onChange={(e) => setPublicNotice(e.target.value)}
                    placeholder="Safe update shown on tracking page..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs"
                  >
                    Assign to Specialist
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'quote' && (
              <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Formal Quotation Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Notes</label>
                  <textarea
                    rows={2}
                    value={receptionNotes}
                    onChange={(e) => setReceptionNotes(e.target.value)}
                    placeholder="Includes 2h instrument time + gold sputter coating"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
                  >
                    Dispatch Quotation
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'sample' && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Confirm physical custody of sample coupons or vials from investigator <strong>{activeRequest.requesterName}</strong>.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Condition on Intake</label>
                  <textarea
                    rows={2}
                    value={receptionNotes}
                    onChange={(e) => setReceptionNotes(e.target.value)}
                    placeholder="e.g. Glass vials sealed, no leakage, labeled S-01 through S-05."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    type="button"
                    onClick={handleSampleReceipt}
                    className="px-5 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-semibold shadow-xs"
                  >
                    Confirm Sample Intake
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'dispatch' && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Complete the request cycle. Reports and any remaining sample materials will be officially dispatched or released.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Handover / Courier Notes</label>
                  <textarea
                    rows={2}
                    value={receptionNotes}
                    onChange={(e) => setReceptionNotes(e.target.value)}
                    placeholder="e.g. Picked up by scholar in person / couriered via SpeedPost"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    type="button"
                    onClick={handleDispatchSubmit}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                  >
                    Confirm Dispatch & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
