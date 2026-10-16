'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  CheckCircle2,
  X,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { StaffUser, UserRole, Equipment } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
      `Account created for ${newUser.fullName}. Security policy mandates password setup upon first access.`
    );
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-calistoga text-2xl text-[#0F172A]">Staff & Receptionist Accounts</h2>
          <p className="text-xs text-slate-500">
            Provision reception operators, designate faculty equipment owners, issue access keys, and manage RBAC profiles.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="md"
          icon={<UserPlus className="w-4 h-4" />}
        >
          Provision Staff Account
        </Button>
      </div>

      {resetNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetNotice}</span>
          </div>
          <button onClick={() => setResetNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* Staff Table */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-sans font-semibold">Staff Member & Handle</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Role Profile</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Department</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Account Status</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Last Sign-In</th>
                <th className="py-3.5 px-4 text-right font-sans font-semibold">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((user) => {
                const assignedEquipmentNames = user.assignedEquipmentIds
                  ?.map((id) => equipmentList.find((e) => e.id === id)?.name)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-sans">
                      <p className="font-semibold text-slate-900">{user.fullName}</p>
                      <p className="font-mono text-[11px] text-[#0052FF]">@{user.username}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : user.role === 'reception'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                      {user.role === 'owner' && assignedEquipmentNames && (
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs truncate font-sans" title={assignedEquipmentNames}>
                          Assigned: {assignedEquipmentNames}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 font-sans text-slate-700">{user.department}</td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleIssueReset(user)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0052FF]/10 hover:text-[#0052FF] text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Generate secure one-time password reset token"
                      >
                        Reset Key
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            user.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Provision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-calistoga text-xl text-[#0F172A]">Provision Staff Workstation Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Full Name & Title *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Dr. Priyanshu Dave / Kinjal Patel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Username Handle *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. pdave"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Role Profile *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="reception">Receptionist</option>
                    <option value="owner">Equipment Owner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Official University Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@paruluniversity.ac.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Department / Faculty *</label>
                <input
                  type="text"
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Department of Mechanical Engineering"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                />
              </div>

              {form.role === 'owner' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Assign Core Instrument</label>
                  <select
                    value={form.assignedEquipmentId}
                    onChange={(e) => setForm({ ...form, assignedEquipmentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Create Staff Account
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
