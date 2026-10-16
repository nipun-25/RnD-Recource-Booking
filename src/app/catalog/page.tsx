'use client';

import React, { useState, useEffect } from 'react';
import { Microscope, Search, Filter, ArrowRight, Clock, Building2 } from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment } from '@/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CatalogPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    dataStore.getEquipmentList().then(setEquipmentList);
  }, []);

  const categories = ['ALL', ...Array.from(new Set(equipmentList.map((e) => e.category)))];

  const filtered = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase()) ||
      eq.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || eq.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Modern Header Banner */}
        <div className="space-y-4">
          <SectionBadge label="Institutional Resource Catalog" />
          <h1 className="font-calistoga text-3xl sm:text-4xl lg:text-5xl text-[#0F172A] tracking-tight">
            Advanced Research Equipment & Facilities
          </h1>
          <p className="text-slate-600 text-base max-w-3xl leading-relaxed">
            Explore advanced instrumentation and laboratory resources across Parul University. Reserve operational slots for direct research or submit samples for certified analysis.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]" />
            <span>Architecture Demo: Sample inventory records and rates loaded for system evaluation.</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search instruments by name, model, or keywords (e.g. SEM, AFM, Sputter)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((eq) => (
            <Card
              key={eq.id}
              variant="elevated"
              className="flex flex-col justify-between p-6 sm:p-7"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {eq.category}
                  </span>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      eq.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : eq.status === 'maintenance'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        eq.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-current'
                      }`}
                    />
                    {eq.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] leading-snug">{eq.name}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">{eq.model}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{eq.description}</p>

                {/* Technical Specs Preview */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5 font-mono">
                  {Object.entries(eq.specifications)
                    .slice(0, 2)
                    .map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-medium text-slate-700 text-right truncate max-w-[60%]">{val}</span>
                      </div>
                    ))}
                </div>

                <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{eq.operatingHours}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{eq.location}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Demonstration Rate</span>
                  <span className="text-sm font-bold text-slate-900">₹{eq.hourlyRateDemo} / hr</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    href={`/catalog/${eq.id}`}
                    variant="outline"
                    size="sm"
                  >
                    Details
                  </Button>

                  <Button
                    href={`/book?equipmentId=${eq.id}`}
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight className="w-3 h-3" />}
                  >
                    Book
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
              <Microscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No instruments matched your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or resetting the active category and status filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="mt-2"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
