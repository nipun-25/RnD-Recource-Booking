import React from 'react';

interface InvertedSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function InvertedSection({ children, className = '', id }: InvertedSectionProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden bg-[#0F172A] text-white py-24 sm:py-32 ${className}`}
    >
      {/* Ambient Electric Blue Radial Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#0052FF]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#4D7CFF]/15 blur-[120px]" />

      {/* Subtle Dot Pattern Grid */}
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-40" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
