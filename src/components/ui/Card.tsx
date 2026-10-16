import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'featured' | 'ghost';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  onClick,
}: CardProps) {
  if (variant === 'featured') {
    return (
      <div className="gradient-border-card transition-all duration-300 hover:shadow-accent-lg hover:-translate-y-1">
        <div className={`gradient-border-inner h-full w-full p-6 sm:p-8 ${className}`}>
          {children}
        </div>
      </div>
    );
  }

  const baseStyles = 'rounded-2xl transition-all duration-200';

  const variantStyles = {
    default:
      'bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300',
    elevated:
      'bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[#0052FF]/30',
    ghost:
      'bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-xs',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
}
