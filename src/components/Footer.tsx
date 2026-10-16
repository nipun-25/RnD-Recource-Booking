'use client';

import React from 'react';
import Link from 'next/link';
import { Microscope, Shield, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Microscope className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight">R&D Cell</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Research and Development Cell, Parul University. Centralized portal for academic research resource coordination, equipment scheduling, and testing workflows.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] text-amber-300 border border-slate-700">
              <Shield className="w-3.5 h-3.5" />
              <span>Demonstration Architecture Mode</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Public Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">Resource Catalog</Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">Resource Slot Booking</Link>
              </li>
              <li>
                <Link href="/submit-sample" className="hover:text-white transition-colors">Sample Testing Intake</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">Track Request / Sample</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">R&D Guidelines & Policies</Link>
              </li>
            </ul>
          </div>

          {/* Staff Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Internal Workspaces</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">Administrator Portal</Link>
              </li>
              <li>
                <Link href="/reception" className="hover:text-white transition-colors">Reception & Logistics Desk</Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-white transition-colors">Resource Owner Workstation</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Staff Single Sign-On</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-2 text-xs text-slate-400">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">R&D Cell Contact</h4>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>R&D Cell, Parul University Campus, P.O. Limda, Waghodia, Vadodara, Gujarat 391760</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>rnd@paruluniversity.ac.in</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>+91 2668 260300 (R&D Cell Desk)</span>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Research and Development Cell, Parul University. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">
            R&D Resource Management Portal • Demonstration Mode
          </p>
        </div>
      </div>
    </footer>
  );
}
