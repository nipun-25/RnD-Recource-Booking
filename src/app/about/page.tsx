'use client';

import React from 'react';
import { Microscope, ShieldCheck, CheckCircle2, Building, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          Institutional Organization Profile
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Research and Development Cell (R&D Cell)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          The Research and Development Cell (R&D Cell) at Parul University serves as the central administrative and coordinating body for academic investigation, specialized research equipment, interdisciplinary collaborations, and sponsored projects across university faculties.
        </p>
      </div>

      {/* R&D Cell Mission Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Resource Coordination</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Facilitating fair and transparent access to university-wide research instruments, testing facilities, and specialized departmental resources for scholars and faculty.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Microscope className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Research & Testing Services</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Supporting academic slot bookings, sample testing workflows, and formal quotation mechanisms with auditable non-sequential tracking.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Academic & Industrial Collaboration</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bridging university investigators with collaborative institutions, doctoral researchers, and industrial research partners through standardized service workflows.
          </p>
        </div>
      </div>

      {/* Guidelines & Safety */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Resource Allocation & Operational Guidelines
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Prior Booking:</strong> All equipment sessions must be reserved in advance through this portal using verified investigator details.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Sample Declaration:</strong> Complete physical nature, chemical safety, and hazard declarations are mandatory prior to testing.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Operator Assistance:</strong> Sessions must be supervised or executed in coordination with designated equipment specialists.</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Laboratory Protocol:</strong> University safety and laboratory handling procedures must be strictly observed during all on-site sessions.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Auditable Tracking:</strong> Each booking and sample intake generates an immutable RND tracking identifier for operational status tracking.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Acknowledgment:</strong> Research publications resulting from facility use should acknowledge the support of the R&D Cell, Parul University.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-center">
        Note: The portal is currently running on demonstration equipment records for architecture preview. The official university equipment inventory, descriptions, and pricing will be connected in subsequent phases.
      </div>
    </div>
  );
}
