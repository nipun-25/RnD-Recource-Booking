import React from 'react';

interface SectionBadgeProps {
  label: string;
  className?: string;
  pulse?: boolean;
}

export function SectionBadge({ label, className = '', pulse = true }: SectionBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-1.5 backdrop-blur-xs ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0052FF] opacity-75" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0052FF]" />
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.15em] font-medium text-[#0052FF]">
        {label}
      </span>
    </div>
  );
}
