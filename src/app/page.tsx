'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  FlaskConical,
  Search,
  ArrowRight,
  Layers,
  Clock,
  Building2,
  ChevronRight,
  Microscope,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment } from '@/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InvertedSection } from '@/components/ui/InvertedSection';
import { HeroGraphic } from '@/components/home/HeroGraphic';

export default function HomePage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  useEffect(() => {
    dataStore.getEquipmentList().then((data) => setEquipmentList(data.slice(0, 3)));
  }, []);

  return (
    <div className="flex flex-col bg-[#FAFAFA] min-h-screen">
      {/* 1. Asymmetric Modern Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        {/* Subtle background ambient radial gradient */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(0,82,255,0.06),transparent_70%)]" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-12 lg:gap-16">
            {/* Left Dominant Column */}
            <div className="space-y-6 sm:space-y-8 text-left">
              <SectionBadge label="R&D Cell • Parul University" />

              <h1 className="font-calistoga text-4xl sm:text-5xl lg:text-[3.5rem] text-[#0F172A] leading-[1.12] tracking-tight">
                Institutional Research{' '}
                <span className="relative inline-block">
                  <span className="text-gradient">Resource Portal</span>
                  <span className="gradient-underline" />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Centralized gateway for university researchers, faculty investigators, and scholars to reserve institutional characterization instruments, submit testing samples, and track workflows in real time.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  href="/catalog"
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse Catalog
                </Button>

                <Button
                  href="/book"
                  variant="outline"
                  size="lg"
                  icon={<CalendarCheck className="w-4 h-4 text-[#0052FF]" />}
                  iconPosition="left"
                >
                  Book Slot
                </Button>

                <Button
                  href="/submit-sample"
                  variant="outline"
                  size="lg"
                  icon={<FlaskConical className="w-4 h-4 text-[#4D7CFF]" />}
                  iconPosition="left"
                >
                  Submit Sample
                </Button>

                <Button
                  href="/track"
                  variant="ghost"
                  size="lg"
                  icon={<Search className="w-4 h-4 text-slate-500" />}
                  iconPosition="left"
                >
                  Track ID
                </Button>
              </div>

              {/* Minimal Demo Notice Pill */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/80 text-[11px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]" />
                  <span>Demonstration records active. Production data to connect in Phase 8.</span>
                </div>
              </div>
            </div>

            {/* Right Asymmetric Column: Animated Hero Graphic */}
            <div className="w-full flex justify-center lg:justify-end">
              <HeroGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Inverted Contrast Section: Research Metrics & Auditable Standards */}
      <InvertedSection>
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <SectionBadge label="Institutional Metric Framework" className="border-white/20 bg-white/5" />
          <h2 className="font-calistoga text-3xl sm:text-4xl text-white">
            Precision Research Infrastructure
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Every booking and testing request follows an auditable custody chain governed by Parul University&apos;s R&D policies.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2 backdrop-blur-xs">
            <div className="font-calistoga text-3xl sm:text-4xl text-white text-gradient">35+</div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Advanced Instruments</div>
            <p className="text-[11px] text-slate-500">Characterization, spectroscopy & fabrication</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2 backdrop-blur-xs">
            <div className="font-calistoga text-3xl sm:text-4xl text-white text-gradient">100%</div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Auditable Tracking</div>
            <p className="text-[11px] text-slate-500">Unique tracking IDs with status logging</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2 backdrop-blur-xs">
            <div className="font-calistoga text-3xl sm:text-4xl text-white text-gradient">24-48h</div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Triage Turnaround</div>
            <p className="text-[11px] text-slate-500">Rapid feasibility review by equipment owners</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2 backdrop-blur-xs">
            <div className="font-calistoga text-3xl sm:text-4xl text-white text-gradient">14+</div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Academic Disciplines</div>
            <p className="text-[11px] text-slate-500">Engineering, pharmacy, applied sciences</p>
          </div>
        </div>
      </InvertedSection>

      {/* 3. Core Pillars / Facilities Overview */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <SectionBadge label="Capabilities & Facilities" />
          <h2 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A]">
            Multidisciplinary Research Domains
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Supporting faculty investigation, funded research grants, doctoral theses, and external collaborative projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="elevated" className="p-8 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">High-Resolution Characterization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nanoscale structural imaging, scanning probe microscopy, and surface topography profiling for materials science and nanotechnology.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-medium text-[#0052FF]">
              <span>TEM, SEM, AFM Systems</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card variant="elevated" className="p-8 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Synthesis & Thin-Film Fabrication</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Physical and chemical vapor deposition, high-temperature tubular furnaces, and cleanroom photolithography setups.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-medium text-[#0052FF]">
              <span>Sputtering, CVD, Spin Coaters</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card variant="elevated" className="p-8 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Spectroscopy & Chemical Testing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Molecular absorption, optical emission, FTIR analysis, and automated assay testing for biological and pharmaceutical investigations.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-medium text-[#0052FF]">
              <span>UV-Vis, FTIR, Fluorescence</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        </div>
      </section>

      {/* 4. Featured Instruments (With FeaturedCard 2px Gradient Stroke) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <SectionBadge label="Equipment Showcase" />
              <h2 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A]">Featured Research Instruments</h2>
              <p className="text-sm text-slate-600">Sample verified demo records ready for booking and testing intake</p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0052FF] hover:text-[#0040CC] transition-colors"
            >
              <span>View All Instruments</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {equipmentList.map((eq, idx) => (
              <Card
                key={eq.id}
                variant={idx === 0 ? 'featured' : 'elevated'}
                className="flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {eq.category}
                    </span>
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {eq.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#0F172A] leading-snug group-hover:text-[#0052FF] transition-colors">
                      {eq.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">{eq.model}</p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {eq.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
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

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Demonstration Fee</span>
                    <span className="text-xs font-semibold text-slate-900">₹{eq.hourlyRateDemo}/hr</span>
                  </div>
                  <Link
                    href={`/catalog/${eq.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0052FF] hover:underline"
                  >
                    <span>View Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Workflow Lifecycle (Connected Process Timeline) */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <SectionBadge label="Transparent Procedure" />
          <h2 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A]">
            How the Service Workflow Operates
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every submission follows an auditable 4-stage lifecycle from initial intake to technical verification and report handover.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <Card variant="default" className="p-6 relative">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white font-mono font-bold text-xs flex items-center justify-center mb-4 shadow-accent">
              01
            </span>
            <h4 className="font-semibold text-[#0F172A] text-base mb-1.5">Intake Request</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Requester submits booking or testing form. The portal generates a cryptographically random, non-sequential tracking ID (e.g. RND-2026-X8K9).
            </p>
          </Card>

          <Card variant="default" className="p-6 relative">
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-4">
              02
            </span>
            <h4 className="font-semibold text-[#0F172A] text-base mb-1.5">Reception & Owner Triage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Central reception screens requirements and routes the file to the assigned equipment owner for technical feasibility and slot approval.
            </p>
          </Card>

          <Card variant="default" className="p-6 relative">
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-4">
              03
            </span>
            <h4 className="font-semibold text-[#0F172A] text-base mb-1.5">Quotation & Slot Lock</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official demonstration quotation is finalized. Upon requester acceptance, slot is confirmed and physical sample intake is registered.
            </p>
          </Card>

          <Card variant="default" className="p-6 relative">
            <span className="w-9 h-9 rounded-xl bg-[#0052FF] text-white font-mono font-bold text-xs flex items-center justify-center mb-4 shadow-accent">
              04
            </span>
            <h4 className="font-semibold text-[#0F172A] text-base mb-1.5">Execution & Handover</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipment owner executes the run, logs operating duration, uploads raw data, and notifies the requester for secure result handover.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. Strategic Call To Action */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0052FF]/20 blur-3xl" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <SectionBadge label="Ready to Begin Research?" className="border-white/20 bg-white/5" />
            <h3 className="font-calistoga text-3xl sm:text-4xl text-white">
              Accelerate Your Institutional Research Today
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Whether you need direct machine access or sample testing services, the R&D Cell is equipped to support your scientific breakthroughs.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button href="/catalog" variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Explore Instruments
              </Button>
              <Button href="/track" variant="outline" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Track Existing Request
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
