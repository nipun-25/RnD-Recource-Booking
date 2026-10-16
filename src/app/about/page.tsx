'use client';

import React from 'react';
import { Microscope, ShieldCheck, CheckCircle2, Building, Users } from 'lucide-react';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <SectionBadge label="INSTITUTIONAL ORGANIZATION PROFILE" />
          <h1 className="font-calistoga text-3xl sm:text-5xl text-[#0F172A] tracking-tight">
            Research and Development Cell (R&D Cell)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            The Research and Development Cell (R&D Cell) at Parul University serves as the central administrative and coordinating authority for academic inquiry, advanced characterization infrastructure, interdisciplinary research grants, and industrial collaborations across university faculties.
          </p>
        </div>

        {/* R&D Cell Mission Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-[#0F172A]">Resource Coordination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Facilitating transparent access to institutional instrumentation, cleanroom facilities, and departmental laboratories for scholars, doctoral candidates, and faculty investigators.
            </p>
          </Card>

          <Card variant="elevated" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
              <Microscope className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-[#0F172A]">Testing & Analytical Services</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Managing equipment slot reservations, material sample intake, and formal quotation issuance with an auditable, non-sequential tracking ID architecture.
            </p>
          </Card>

          <Card variant="elevated" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-[#0F172A]">Cross-Discipline Research</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connecting university researchers with external scientific partners, doctoral consortia, and industrial testing programs under standardized institutional operating protocols.
            </p>
          </Card>
        </div>

        {/* Guidelines & Safety */}
        <Card variant="default" className="p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="font-calistoga text-2xl text-[#0F172A] flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#0052FF]" />
              Resource Allocation & Safety Principles
            </h2>
            <p className="text-xs text-slate-500">
              Mandatory standards governing all operational sessions and testing submissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Advance Reservation:</strong> All instrument hours must be booked via this portal with verified researcher credentials.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Safety Declaration:</strong> Physical state, toxicity profile, and hazard classification must be declared before sample dispatch.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Specialist Oversight:</strong> Direct machine operations must be supervised or executed in tandem with designated laboratory owners.</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Laboratory Compliance:</strong> Campus cleanroom and chemical hygiene regulations must be upheld during all on-site appointments.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Transparent Tracking:</strong> Each booking and sample submission produces an immutable RND tracking identifier for operational status tracking.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed"><strong>Publication Acknowledgment:</strong> Research outputs utilizing central facilities should formally acknowledge the Research and Development Cell, Parul University.</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Demo Notice */}
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-mono text-slate-500 text-center">
          Demonstration Record Note: Sample equipment catalog records and hourly rates are currently active for system evaluation. The live university inventory will be connected in Phase 8.
        </div>
      </div>
    </div>
  );
}
