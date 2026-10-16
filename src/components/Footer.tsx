'use client';

import React from 'react';
import Link from 'next/link';
import { Microscope, Shield, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0F172A] text-slate-300 border-t border-slate-800/80 mt-28">
      {/* Ambient Electric Blue Radial Glows */}
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#0052FF]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#4D7CFF]/10 blur-[100px]" />

      {/* Subtle Dot Pattern Grid */}
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white shadow-md shadow-[#0052FF]/20">
                <Microscope className="w-5 h-5" />
              </div>
              <span className="font-serif text-white tracking-tight text-xl">R&D Cell</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Research & Development Cell, Parul University. Coordinating advanced scientific instruments, testing workflows, and interdisciplinary innovation.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 text-[11px] font-mono text-emerald-400 border border-slate-700/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Demonstration Architecture Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-[#4D7CFF] font-semibold mb-4">
              Public Services
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <Link href="/catalog" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Resource Catalog</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Resource Slot Booking</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
              <li>
                <Link href="/submit-sample" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Sample Testing Intake</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Track Request / Sample</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>R&D Guidelines & Policies</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Staff Portals */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-[#4D7CFF] font-semibold mb-4">
              Internal Workspaces
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Administrator Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
              <li>
                <Link href="/reception" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Reception & Logistics Desk</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
              <li>
                <Link href="/owner" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Resource Owner Workstation</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span>Staff Single Sign-On</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4D7CFF]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3 text-xs text-slate-400 font-sans">
            <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-[#4D7CFF] font-semibold mb-4">
              R&D Cell Contact
            </h4>
            <p className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#4D7CFF] shrink-0 mt-0.5" />
              <span>R&D Cell, Parul University Campus, P.O. Limda, Waghodia, Vadodara, Gujarat 391760</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#4D7CFF] shrink-0" />
              <span>rnd@paruluniversity.ac.in</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#4D7CFF] shrink-0" />
              <span>+91 2668 260300 (R&D Desk)</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <p>© 2026 Research and Development Cell, Parul University. All rights reserved.</p>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-[#0052FF]" />
            <span>R&D Resource Management Portal • Minimalist Modern Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
