'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Microscope,
  CalendarCheck,
  FlaskConical,
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  Clock,
  Building2,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment } from '@/types';

export default function HomePage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  useEffect(() => {
    dataStore.getEquipmentList().then((data) => setEquipmentList(data.slice(0, 3)));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Research and Development Cell (R&D Cell) • Parul University</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            R&D Resource Management Portal
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Centralized portal for university researchers, faculty investigators, and collaborative scholars to reserve institutional research equipment, submit sample testing requests, and track workflow progress.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all transform hover:-translate-y-0.5"
            >
              <Microscope className="w-4 h-4" />
              Browse Resource Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              Book Equipment Slot
            </Link>

            <Link
              href="/submit-sample"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              Submit Sample for Testing
            </Link>

            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <Search className="w-4 h-4 text-amber-400" />
              Track Tracking ID
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="pt-6">
            <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700">
              Note: Demonstration data loaded. Actual university equipment information and pricing will be connected in Phase 8.
            </span>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-blue-600 mb-2">Research Infrastructure</h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            University Research Resources & Specialized Facilities
          </p>
          <p className="text-slate-600 text-sm mt-2">
            Supporting multidisciplinary investigation, doctoral research, and sponsored institutional projects across departments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Microscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Advanced Characterization</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              High-resolution structural imaging, surface profiling, and topography analysis for materials research and physical sciences.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Synthesis & Fabrication Systems</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Thin film deposition units, controlled atmosphere thermal furnaces, and patterning systems for device engineering.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Spectroscopy & Chemical Testing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Optical absorption, transmittance analysis, and qualitative assay testing supporting pharmaceutical and biological sciences.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Equipment Preview */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-blue-600">Equipment Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Research Instruments</h2>
              <p className="text-sm text-slate-600 mt-1">Sample demo records ready for booking requests</p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              View Full Catalog ({equipmentList.length}+ instruments)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {equipmentList.map((eq) => (
              <div
                key={eq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {eq.category}
                    </span>
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {eq.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{eq.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">{eq.model}</p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{eq.description}</p>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
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

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Demo Rate: ₹{eq.hourlyRateDemo}/hr</span>
                  <Link
                    href={`/catalog/${eq.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    View Specs
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Process Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-blue-600 mb-2">Transparent Procedure</h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">How the Service Workflow Operates</p>
          <p className="text-slate-600 text-sm mt-2">
            Every submission follows an auditable lifecycle from reception triage to final handover.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center mb-3">
              01
            </span>
            <h4 className="font-bold text-slate-900 text-base mb-1">Online Submission</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Requester submits booking or sample intake form. The portal issues a unique tracking ID (e.g. RND-2026-X8K9).
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mb-3">
              02
            </span>
            <h4 className="font-bold text-slate-900 text-base mb-1">Reception & Owner Review</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Central reception screens requirements and routes the file to the assigned equipment owner for technical feasibility.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200">
            <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center mb-3">
              03
            </span>
            <h4 className="font-bold text-slate-900 text-base mb-1">Quotation & Booking Lock</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official quotation is issued. Upon acceptance, slot is confirmed and sample receipt is logged at the reception desk.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center mb-3">
              04
            </span>
            <h4 className="font-bold text-slate-900 text-base mb-1">Execution & Handover</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Owner logs operating hours, completes scanning/testing, and marks reports ready for secure pickup or digital dispatch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
