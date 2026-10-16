'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarCheck,
  FlaskConical,
  Clock,
  Building2,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment } from '@/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function EquipmentDetailsContent() {
  const params = useParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id as string;
    if (id) {
      dataStore.getEquipmentById(id).then((eq) => {
        setEquipment(eq);
        setLoading(false);
      });
    }
  }, [params]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-500">Loading instrument technical specifications...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-calistoga text-2xl text-slate-900">Instrument Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested equipment record does not exist or has been archived.</p>
        <Button href="/catalog" variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
          Back to Equipment Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb / Back button */}
        <div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-500 hover:text-[#0052FF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO RESOURCE CATALOG</span>
          </Link>
        </div>

        {/* Main Header & Details Card */}
        <Card variant="elevated" className="p-8 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {equipment.category}
                </span>
                <span
                  className={`text-xs font-semibold px-3 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    equipment.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {equipment.status.toUpperCase()}
                </span>
              </div>

              <h1 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A] leading-tight">
                {equipment.name}
              </h1>
              <p className="text-xs font-mono text-slate-400">Model Identification: {equipment.model}</p>
            </div>

            {/* Rate & Direct Action CTA */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="md:text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Demonstration Fee</span>
                <p className="font-calistoga text-3xl text-slate-900">
                  ₹{equipment.hourlyRateDemo} <span className="font-sans text-xs font-normal text-slate-500">/ hour</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  href={`/book?equipmentId=${equipment.id}`}
                  variant="primary"
                  size="md"
                  icon={<CalendarCheck className="w-4 h-4" />}
                >
                  Book Slot
                </Button>

                <Button
                  href={`/submit-sample?equipmentId=${equipment.id}`}
                  variant="outline"
                  size="md"
                  icon={<FlaskConical className="w-4 h-4 text-[#0052FF]" />}
                  iconPosition="left"
                >
                  Send Sample
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
            {equipment.description}
          </p>

          {/* Facility Location and Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">Lab Facility</p>
                <p className="text-xs font-semibold text-slate-800">{equipment.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">Operating Schedule</p>
                <p className="text-xs font-semibold text-slate-800">{equipment.operatingHours}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">Throughput Limit</p>
                <p className="text-xs font-semibold text-slate-800">{equipment.capacityPerHour} session(s) / hour</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Specifications Matrix Table */}
        <Card variant="default" className="p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <SectionBadge label="TECHNICAL SPECIFICATIONS" />
            <h3 className="font-calistoga text-2xl text-[#0F172A]">Calibration & Machine Capabilities</h3>
            <p className="text-xs text-slate-500">
              Operating tolerances and test capabilities certified by the Research and Development Cell.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5 font-semibold">Parameter / Spec</th>
                  <th className="py-3 px-5 font-semibold">Configured Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(equipment.specifications).map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3.5 px-5 font-semibold text-slate-700 w-1/3">{key}</td>
                    <td className="py-3.5 px-5 text-slate-900 font-sans">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Safety & Compliance Policy */}
        <div className="rounded-2xl border border-[#0052FF]/30 bg-[#0052FF]/5 p-6 text-xs text-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#0052FF]">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-mono uppercase tracking-wider">Cleanroom & Sample Safety Policy</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            All biological, explosive, radioactive, or volatile chemical samples must be pre-declared before arrival.
            First-time student researchers must complete an orientation run with the assigned laboratory technician. All slots remain subject to final feasibility confirmation by the designated equipment owner.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentDetailsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs font-mono text-slate-500">Loading instrument details...</div>}>
      <EquipmentDetailsContent />
    </Suspense>
  );
}
