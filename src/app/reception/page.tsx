'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  X,
  ShieldAlert,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { ServiceRequest, Equipment, StaffUser } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-500">Validating reception workstation credentials...</p>
      </div>
    );
  }

  if (role !== 'reception' && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 sm:p-10 bg-white border border-slate-200 rounded-3xl shadow-lg text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-calistoga text-2xl text-slate-900">Reception Desk Access Required</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
          You are currently viewing as <span className="font-mono font-bold text-slate-800">{role.toUpperCase()}</span>. Central reception privileges are required to triage submissions, generate quotations, and log sample custody.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => switchRoleDev('reception')}
            variant="primary"
            size="md"
            icon={<UserCheck className="w-4 h-4" />}
          >
            Switch to Reception Role (Kinjal Patel)
          </Button>
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
    <div className="bg-[#FAFAFA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="rounded-3xl bg-[#0F172A] text-white p-7 sm:p-9 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0052FF]/20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <SectionBadge label="CENTRAL LOGISTICS & RECEPTION DESK" className="border-white/20 bg-white/5" />
              <h1 className="font-calistoga text-2xl sm:text-3xl text-white">
                Reception Intake & Request Dispatch Queue
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Screen initial requests, assign designated faculty specialists, generate formal quotations, and log physical sample custody.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 text-xs backdrop-blur-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Active Queue</span>
                <span className="text-xl font-bold text-white">{requests.length} Files</span>
              </div>
              <div className="border-l border-white/10 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase">New Intake</span>
                <span className="text-xl font-bold text-[#4D7CFF]">
                  {requests.filter((r) => r.status === 'SUBMITTED').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <Card variant="elevated" className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono font-medium">
            {[
              { id: 'all', label: `All (${requests.length})` },
              { id: 'new', label: 'New Intake' },
              { id: 'assigned', label: 'With Specialist' },
              { id: 'quotes', label: 'Quotations' },
              { id: 'samples', label: 'Samples / Runs' },
              { id: 'completed', label: 'Ready / Dispatch' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  filterTab === t.id
                    ? 'bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white shadow-accent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracking ID or requester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </Card>

        {/* Requests Queue Table */}
        <Card variant="elevated" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3.5 px-5 font-sans font-semibold">Tracking ID & Date</th>
                  <th className="py-3.5 px-5 font-sans font-semibold">Requester Details</th>
                  <th className="py-3.5 px-5 font-sans font-semibold">Instrument & Scope</th>
                  <th className="py-3.5 px-5 font-sans font-semibold">Workflow Stage</th>
                  <th className="py-3.5 px-5 font-sans font-semibold">Quotation</th>
                  <th className="py-3.5 px-5 text-right font-sans font-semibold">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const eq = equipmentList.find((e) => e.id === req.equipmentId);
                  const owner = staffList.find((s) => s.id === req.assignedOwnerId);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-[#0052FF] block">{req.trackingId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-sans">
                        <p className="font-semibold text-slate-900">{req.requesterName}</p>
                        <p className="text-[11px] text-slate-500">{req.requesterOrg}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{req.requesterPhone}</p>
                      </td>

                      <td className="py-4 px-5 font-sans">
                        <p className="font-semibold text-slate-800">{eq ? eq.name : 'Central Facility'}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.projectTitle}</p>
                      </td>

                      <td className="py-4 px-5">
                        <StatusBadge status={req.status} isPublic={false} />
                        {owner && (
                          <p className="text-[10px] text-slate-400 mt-1 font-sans">
                            Owner: <span className="font-medium text-slate-700">{owner.fullName}</span>
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {req.quotationAmount ? (
                          <div>
                            <p className="font-bold text-slate-900 font-sans">₹{req.quotationAmount}</p>
                            <span className="text-[10px] font-mono uppercase font-semibold text-[#0052FF]">
                              {req.quotationStatus || 'Prepared'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-sans">Unquoted</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        {req.status === 'SUBMITTED' && (
                          <button
                            onClick={() => openActionModal(req, 'triage')}
                            className="px-3 py-1.5 rounded-lg bg-[#0052FF]/10 text-[#0052FF] hover:bg-[#0052FF]/20 font-mono font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Triage & Assign
                          </button>
                        )}

                        {['UNDER_REVIEW', 'AWAITING_OWNER_REVIEW', 'QUOTATION_READY'].includes(req.status) && (
                          <button
                            onClick={() => openActionModal(req, 'quote')}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-mono font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Issue Quote
                          </button>
                        )}

                        {['APPROVED', 'CONFIRMED'].includes(req.status) && req.requestType !== 'booking' && (
                          <button
                            onClick={() => openActionModal(req, 'sample')}
                            className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-mono font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Log Sample Receipt
                          </button>
                        )}

                        {req.status === 'READY_FOR_HANDOVER' && (
                          <button
                            onClick={() => openActionModal(req, 'dispatch')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-mono font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Mark Dispatched
                          </button>
                        )}

                        <button
                          onClick={() => openActionModal(req, 'triage')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-mono text-xs cursor-pointer transition-colors"
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
        </Card>

        {/* Action Modals */}
        {activeRequest && modalMode && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card variant="elevated" className="max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#0052FF]">{activeRequest.trackingId}</span>
                  <h3 className="font-calistoga text-xl text-[#0F172A] mt-0.5">
                    {modalMode === 'triage' && 'Reception Screening & Assignment'}
                    {modalMode === 'quote' && 'Record & Dispatch Formal Quotation'}
                    {modalMode === 'sample' && 'Log Physical Sample Custody'}
                    {modalMode === 'dispatch' && 'Final Handover / Dispatch Validation'}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveRequest(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              {modalMode === 'triage' && (
                <form onSubmit={handleTriageSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Designate Equipment Technical Specialist *
                    </label>
                    <select
                      required
                      value={assignOwnerId}
                      onChange={(e) => setAssignOwnerId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
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
                    <label className="block font-semibold text-slate-700 mb-1.5">Internal Reception Notes</label>
                    <textarea
                      rows={2}
                      value={receptionNotes}
                      onChange={(e) => setReceptionNotes(e.target.value)}
                      placeholder="e.g. Requester details verified. Sample specs within rating."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Public Operational Notice</label>
                    <input
                      type="text"
                      value={publicNotice}
                      onChange={(e) => setPublicNotice(e.target.value)}
                      placeholder="Safe status update shown on tracking page..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
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
                      Assign to Specialist
                    </Button>
                  </div>
                </form>
              )}

              {modalMode === 'quote' && (
                <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Formal Quotation Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Billing Notes</label>
                    <textarea
                      rows={2}
                      value={receptionNotes}
                      onChange={(e) => setReceptionNotes(e.target.value)}
                      placeholder="Includes 2h instrument time + sputter coating"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
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
                      Dispatch Quotation
                    </Button>
                  </div>
                </form>
              )}

              {modalMode === 'sample' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    Confirm physical intake of sample coupons or vials from investigator <strong>{activeRequest.requesterName}</strong>.
                  </p>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Physical Condition on Intake</label>
                    <textarea
                      rows={2}
                      value={receptionNotes}
                      onChange={(e) => setReceptionNotes(e.target.value)}
                      placeholder="e.g. Glass vials sealed, no leakage, labeled S-01 through S-05."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
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
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSampleReceipt}
                    >
                      Confirm Sample Intake
                    </Button>
                  </div>
                </div>
              )}

              {modalMode === 'dispatch' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    Complete the testing lifecycle. Test reports and remaining sample specimens will be released to the investigator.
                  </p>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Handover / Courier Notes</label>
                    <textarea
                      rows={2}
                      value={receptionNotes}
                      onChange={(e) => setReceptionNotes(e.target.value)}
                      placeholder="e.g. Collected in-person by scholar / dispatched via speed post"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
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
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleDispatchSubmit}
                    >
                      Confirm Dispatch & Close
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
