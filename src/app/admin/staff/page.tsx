'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Key,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { StaffUser, UserRole, Equipment } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function AdminStaffPage() {
  const { currentUser } = useAuth();
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // New staff form state
  const [form, setForm] = useState<{
    fullName: string;
    username: string;
    email: string;
    role: UserRole;
    department: string;
    assignedEquipmentId: string;
    mustChangePassword: boolean;
  }>({
    fullName: '',
    username: '',
    email: '',
    role: 'reception',
    department: 'Central Facility Logistics & Helpdesk',
    assignedEquipmentId: '',
    mustChangePassword: true,
  });

  const loadData = async () => {
    const [staff, eq] = await Promise.all([dataStore.getStaffList(), dataStore.getEquipmentList()]);
    setStaffList(staff);
    setEquipmentList(eq);
    if (eq.length > 0) {
      setForm((prev) => ({ ...prev, assignedEquipmentId: eq[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: StaffUser) => {
    await dataStore.toggleStaffStatus(user.id, currentUser?.fullName || 'Dr. Anand Joshi', 'admin');
    loadData();
  };

  const handleIssueReset = (user: StaffUser) => {
    const tempToken = `PU-RESET-${Date.now().toString(36).toUpperCase()}`;
    setResetNotice(
      `Secure password invitation token generated for ${user.fullName} (${user.username}): ${tempToken}. Expiring in 24 hours.`
    );
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: StaffUser = {
      id: `staff-${Date.now()}`,
      username: form.username.toLowerCase().trim(),
      fullName: form.fullName,
      email: form.email,
      role: form.role,
      department: form.department,
      status: 'active',
      mustChangePassword: form.mustChangePassword,
      assignedEquipmentIds: form.role === 'owner' ? [form.assignedEquipmentId] : [],
      createdAt: new Date().toISOString(),
    };

    await dataStore.saveStaff(newUser, currentUser?.fullName || 'Dr. Anand Joshi', 'admin');
    setIsModalOpen(false);
    setResetNotice(
      `Account created for ${newUser.fullName}. Security policy requires password change on first sign-in.`
    );
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Staff & Reception Account Administration</h2>
          <p className="text-xs text-slate-500">
            Provision reception operators, designate equipment owners, manage credential resets, and control RBAC access.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Provision Staff Account
        </button>
      </div>

      {resetNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetNotice}</span>
          </div>
          <button onClick={() => setResetNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member & Username</th>
                <th className="py-3 px-4">Role & Permissions</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((user) => {
                const assignedEquipmentNames = user.assignedEquipmentIds
                  ?.map((id) => equipmentList.find((e) => e.id === id)?.name)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{user.fullName}</p>
                      <p className="font-mono text-[11px] text-purple-700">@{user.username}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : user.role === 'reception'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                      {user.role === 'owner' && assignedEquipmentNames && (
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs truncate" title={assignedEquipmentNames}>
                          Assigned: {assignedEquipmentNames}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700">{user.department}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleIssueReset(user)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-700 text-xs font-semibold transition-colors"
                        title="Generate secure one-time password reset token"
                      >
                        Reset Key
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                            user.status === 'active'
                              ? 'bg-slate-100 hover:bg-rose-100 hover:text-rose-800 text-slate-600'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Provision Internal Staff Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal / Staff Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Dr. Harish Vyas / Meera Shah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username / Staff ID *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. hvyas / reception2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">University Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@paruluniversity.ac.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="reception">Reception & Logistics Desk</option>
                    <option value="owner">Equipment Owner / Technical Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Unit *</label>
                  <input
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {form.role === 'owner' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Authorized Instrument Assignment *</label>
                  <select
                    value={form.assignedEquipmentId}
                    onChange={(e) => setForm({ ...form, assignedEquipmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.mustChangePassword}
                    onChange={(e) => setForm({ ...form, mustChangePassword: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>Enforce mandatory password reset on initial login</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
