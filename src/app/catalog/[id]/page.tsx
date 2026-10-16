'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Microscope,
  ArrowLeft,
  CalendarCheck,
  FlaskConical,
  Clock,
  Building2,
  ShieldAlert,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { dataStore } from '@/lib/data-adapter';
import { Equipment } from '@/types';

function EquipmentDetailsContent() {
  const params = useParams();
  const router = useRouter();
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-2">Loading instrument technical specifications...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Instrument Not Found</h2>
        <p className="text-xs text-slate-500">The requested equipment record does not exist or has been archived.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {equipment.category}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  equipment.status === 'available'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {equipment.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{equipment.name}</h1>
            <p className="text-sm font-mono text-slate-500">Model: {equipment.model}</p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500">Demo Academic Rate</span>
              <p className="text-2xl font-black text-slate-900">₹{equipment.hourlyRateDemo} <span className="text-xs font-normal text-slate-500">/ hour</span></p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/book?equipmentId=${equipment.id}`}
                className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                Book Slot
              </Link>
              <Link
                href={`/submit-sample?equipmentId=${equipment.id}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <FlaskConical className="w-4 h-4" />
                Send Sample
              </Link>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
          {equipment.description}
        </p>

        {/* Facility Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Building2 className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-800">Laboratory Location</p>
              <p>{equipment.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-800">Operating Schedule</p>
              <p>{equipment.operatingHours}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-800">Slot Throughput</p>
              <p>Capacity: {equipment.capacityPerHour} session(s) / hr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Technical Specifications & Capabilities</h3>
        <p className="text-xs text-slate-500">
          Parameters are verified according to standard calibration certificates.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <tbody>
              {Object.entries(equipment.specifications).map(([key, val], idx) => (
                <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}>
                  <td className="py-3 px-4 font-semibold text-slate-700 w-1/3 border-b border-slate-200">{key}</td>
                  <td className="py-3 px-4 text-slate-900 border-b border-slate-200">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Guidelines & Safety Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-xs text-blue-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-950">
          <ShieldAlert className="w-4 h-4 text-blue-700" />
          <span>Cleanroom & Sample Safety Policy</span>
        </div>
        <p className="leading-relaxed">
          All biological, explosive, radioactive, or volatile liquid samples must be declared prior to submission.
          Trained operator assistance is mandatory for external and first-time university researchers. Slots are subject to final technical review by the designated equipment owner.
        </p>
      </div>
    </div>
  );
}

export default function EquipmentDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading instrument details...</div>}>
      <EquipmentDetailsContent />
    </Suspense>
  );
}
