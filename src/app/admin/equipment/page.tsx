'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment, EquipmentStatus, StaffUser } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
          <h2 className="font-calistoga text-2xl text-[#0F172A]">Equipment Catalog & Availability</h2>
          <p className="text-xs text-slate-500">
            Configure institutional instruments, technical capabilities, demonstration rates, and assigned owners.
          </p>
        </div>

        <Button
          onClick={openNewModal}
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Instrument
        </Button>
      </div>

      {/* Equipment List Table */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-sans font-semibold">Instrument & Model</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Category & Location</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Operational Status</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Assigned Owner(s)</th>
                <th className="py-3.5 px-4 font-sans font-semibold">Demo Rate</th>
                <th className="py-3.5 px-4 text-right font-sans font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipmentList.map((eq) => {
                const ownerNames = eq.assignedOwnerIds
                  ?.map((id) => staffList.find((s) => s.id === id)?.fullName)
                  .filter(Boolean)
                  .join(', ') || 'Unassigned';

                return (
                  <tr key={eq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-sans">
                      <p className="font-semibold text-slate-900">{eq.name}</p>
                      <p className="font-mono text-[11px] text-slate-400">{eq.model}</p>
                    </td>

                    <td className="py-4 px-4 font-sans">
                      <p className="font-semibold text-[#0052FF]">{eq.category}</p>
                      <p className="text-[11px] text-slate-500">{eq.location}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          eq.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : eq.status === 'maintenance'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {eq.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-700 font-medium font-sans">
                      {ownerNames}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900 font-sans">
                      ₹{eq.hourlyRateDemo} / hr
                    </td>

                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(eq)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0052FF]/10 hover:text-[#0052FF] text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(eq.id, eq.name)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-800 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
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
      </Card>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-calistoga text-xl text-[#0F172A]">
                {editingItem ? 'Edit Instrument Specifications' : 'Add New Research Instrument'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Field Emission SEM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Model / Serial Identification *</label>
                  <input
                    type="text"
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="e.g. NanoProbe-9000FE"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Domain Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Equipment['category'] })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
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
                  <label className="block font-semibold text-slate-700 mb-1.5">Operational Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as EquipmentStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="available">Available (Operational)</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="unavailable">Unavailable (Calibration/Offline)</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Laboratory Location *</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Cleanroom Block B - Room 102"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Hourly Demo Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.hourlyRateDemo}
                    onChange={(e) => setForm({ ...form, hourlyRateDemo: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Operating Hours Schedule *</label>
                  <input
                    type="text"
                    required
                    value={form.operatingHours}
                    onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                    placeholder="09:00 - 18:00 (Mon-Fri)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Assigned Specialist Owner *</label>
                  <select
                    value={form.assignedOwnerIds[0] || ''}
                    onChange={(e) => setForm({ ...form, assignedOwnerIds: [e.target.value] })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none cursor-pointer"
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
                <label className="block font-semibold text-slate-700 mb-1.5">Overview & Capabilities *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none"
                />
              </div>

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
                  {editingItem ? 'Save Modifications' : 'Create Instrument'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
