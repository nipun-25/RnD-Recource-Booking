'use client';

import React, { useState, useEffect } from 'react';
import {
  Microscope,
  Plus,
  Edit2,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  DollarSign,
  UserCheck,
  X,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, EquipmentStatus, StaffUser } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function AdminEquipmentPage() {
  const { currentUser } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    name: string;
    model: string;
    category: Equipment['category'];
    location: string;
    description: string;
    status: EquipmentStatus;
    operatingHours: string;
    capacityPerHour: number;
    hourlyRateDemo: number;
    assignedOwnerIds: string[];
    specifications: Record<string, string>;
  }>({
    name: '',
    model: '',
    category: 'Electron Microscopy',
    location: 'Cleanroom Block B - Room 102',
    description: '',
    status: 'available',
    operatingHours: '09:00 - 18:00 (Mon-Fri)',
    capacityPerHour: 1,
    hourlyRateDemo: 1000,
    assignedOwnerIds: [],
    specifications: { Resolution: 'Sub-nanometer', Detectors: 'Integrated' },
  });

  const loadData = async () => {
    const [eqs, staff] = await Promise.all([dataStore.getEquipmentList(), dataStore.getStaffList()]);
    setEquipmentList(eqs);
    setStaffList(staff.filter((s) => s.role === 'owner'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setForm({
      name: '',
      model: '',
      category: 'Electron Microscopy',
      location: 'Cleanroom Block B - Room 102',
      description: '',
      status: 'available',
      operatingHours: '09:00 - 18:00 (Mon-Fri)',
      capacityPerHour: 1,
      hourlyRateDemo: 1000,
      assignedOwnerIds: staffList.length > 0 ? [staffList[0].id] : [],
      specifications: { Resolution: '1.2 nm', Detectors: 'High Sensitivity' },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingItem(eq);
    setForm({
      name: eq.name,
      model: eq.model,
      category: eq.category,
      location: eq.location,
      description: eq.description,
      status: eq.status,
      operatingHours: eq.operatingHours,
      capacityPerHour: eq.capacityPerHour,
      hourlyRateDemo: eq.hourlyRateDemo,
      assignedOwnerIds: eq.assignedOwnerIds || [],
      specifications: { ...eq.specifications },
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave: Equipment = {
      id: editingItem ? editingItem.id : `eq-${Date.now()}`,
      name: form.name,
      model: form.model,
      category: form.category,
      location: form.location,
      description: form.description,
      status: form.status,
      isArchived: false,
      operatingHours: form.operatingHours,
      capacityPerHour: Number(form.capacityPerHour),
      hourlyRateDemo: Number(form.hourlyRateDemo),
      assignedOwnerIds: form.assignedOwnerIds,
      specifications: form.specifications,
    };

    await dataStore.saveEquipment(
      itemToSave,
      currentUser?.fullName || 'Dr. Anand Joshi',
      'admin'
    );
    setIsModalOpen(false);
    loadData();
  };

  const handleArchive = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to archive "${name}"? Historical bookings will be preserved.`)) {
      await dataStore.archiveEquipment(id, currentUser?.fullName || 'Dr. Anand Joshi', 'admin');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Equipment Catalog & Availability Management</h2>
          <p className="text-xs text-slate-500">
            Configure analytical instruments, technical parameters, demo pricing, and assigned owners.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add New Instrument
        </button>
      </div>

      {/* Equipment List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Instrument & Model</th>
                <th className="py-3 px-4">Category & Location</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">Assigned Owner(s)</th>
                <th className="py-3 px-4">Hourly Demo Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipmentList.map((eq) => {
                const ownerNames = eq.assignedOwnerIds
                  ?.map((id) => staffList.find((s) => s.id === id)?.fullName)
                  .filter(Boolean)
                  .join(', ') || 'Unassigned';

                return (
                  <tr key={eq.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{eq.name}</p>
                      <p className="font-mono text-[11px] text-slate-500">{eq.model}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-purple-900">{eq.category}</p>
                      <p className="text-[11px] text-slate-500">{eq.location}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          eq.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : eq.status === 'maintenance'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {eq.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ownerNames}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{eq.hourlyRateDemo} / hr
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(eq)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(eq.id, eq.name)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-800 text-slate-600 text-xs font-semibold transition-colors"
                        title="Archive while retaining historical logs"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Instrument Specifications' : 'Add New Research Instrument'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Field Emission SEM"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model / Serial Tag *</label>
                  <input
                    type="text"
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="e.g. NanoProbe-9000FE"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Domain Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Equipment['category'] })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Electron Microscopy">Electron Microscopy</option>
                    <option value="Surface Profilometry">Surface Profilometry</option>
                    <option value="Thin Film Deposition">Thin Film Deposition</option>
                    <option value="Spectroscopy">Spectroscopy</option>
                    <option value="Lithography">Lithography</option>
                    <option value="Thermal & Electrical">Thermal & Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as EquipmentStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="available">Available (Operational)</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="unavailable">Unavailable (Calibration/Offline)</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Location *</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Cleanroom Block B - Bay 102"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hourly Demo Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.hourlyRateDemo}
                    onChange={(e) => setForm({ ...form, hourlyRateDemo: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Hours Schedule *</label>
                  <input
                    type="text"
                    required
                    value={form.operatingHours}
                    onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                    placeholder="09:00 - 18:00 (Mon-Fri)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Equipment Owner *</label>
                  <select
                    value={form.assignedOwnerIds[0] || ''}
                    onChange={(e) => setForm({ ...form, assignedOwnerIds: [e.target.value] })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instrument Overview Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                  {editingItem ? 'Save Modifications' : 'Create Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
