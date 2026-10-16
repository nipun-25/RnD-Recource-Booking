'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Microscope, Search, Filter, CalendarCheck, ArrowRight, Clock, Building2, Tag } from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment } from '@/types';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            Research & Development Cell • Resource Catalog
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">University Research Equipment & Resources</h1>
          <p className="text-sm sm:text-base text-slate-300">
            Explore advanced instrumentation and research facilities across Parul University. Reserve operational slots or submit samples for testing.
          </p>
          <div className="text-xs text-amber-300 bg-black/30 px-3 py-1.5 rounded-lg inline-block border border-amber-400/30">
            Demonstration Dataset: Instruments and demo rates are currently loaded for architecture preview.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment by name, model, or keywords (e.g. SEM, AFM, Sputter)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-200 rounded-md py-1.5 px-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-md py-1.5 px-2 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <div
            key={eq.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {eq.category}
                </span>

                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    eq.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : eq.status === 'maintenance'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {eq.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{eq.name}</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">{eq.model}</p>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{eq.description}</p>

              {/* Specs snapshot */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                {Object.entries(eq.specifications)
                  .slice(0, 2)
                  .map(([key, val]) => (
                    <div key={key} className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{key}:</span>
                      <span className="font-medium text-slate-800 text-right truncate max-w-[60%]">{val}</span>
                    </div>
                  ))}
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {eq.operatingHours}
                </p>
                <p className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {eq.location}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">₹{eq.hourlyRateDemo} / hr</span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/catalog/${eq.id}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium"
                >
                  Details
                </Link>

                <Link
                  href={`/book?equipmentId=${eq.id}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium inline-flex items-center gap-1"
                >
                  Book Slot
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Microscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No instruments matched your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms</p>
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
