'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <SectionBadge label="COMMUNICATION & HELPDESK" />
          <h1 className="font-calistoga text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
            R&D Cell Inquiries & Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Contact the Research and Development Cell desk for equipment booking queries, sample testing workflows, or research resource coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info Card */}
          <Card variant="elevated" className="p-8 space-y-6">
            <h2 className="font-calistoga text-2xl text-[#0F172A]">Office & Helpdesk</h2>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-sans">Official Location:</strong>
                  <p>Research and Development Cell (R&D Cell)</p>
                  <p>Parul University Campus, Post Limda, Waghodia, Vadodara, Gujarat - 391760</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-sans">Office Working Hours:</strong>
                  <p>Monday – Friday: 09:00 AM – 05:30 PM</p>
                  <p>Saturday: 09:00 AM – 01:30 PM (Working Saturdays)</p>
                  <p>Sunday & University Holidays: Closed</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-sans">Official Email:</strong>
                  <p className="font-mono text-slate-700">rnd@paruluniversity.ac.in</p>
                  <p className="font-mono text-slate-700">reception.rnd@paruluniversity.ac.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-sans">Telephone / Extension:</strong>
                  <p className="font-mono text-slate-700">+91 (02668) 260300 (R&D Cell Desk)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-mono text-slate-500 leading-relaxed">
              Sample Intake Logistics: Consign testing packages to &quot;R&D Cell Logistics Desk, Parul University&quot; clearly marked with your assigned RND tracking ID.
            </div>
          </Card>

          {/* Message Form Card */}
          <Card variant="elevated" className="p-8">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-calistoga text-2xl text-slate-900">Inquiry Logged</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to the Research and Development Cell. Our coordinator will review your message and respond within 24 business hours.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-calistoga text-2xl text-[#0F172A]">Send an Inquiry</h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. / Dr. / Researcher Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@paruluniversity.ac.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Equipment availability, testing inquiries, or research project"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your query or facility requirement..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0052FF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
