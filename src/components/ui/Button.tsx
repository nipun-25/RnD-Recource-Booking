import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconPosition = 'right',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'group inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-1.5 h-9',
    md: 'text-sm px-5 py-2.5 rounded-xl gap-2 h-11',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 h-13',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white shadow-xs hover:shadow-accent hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:-translate-y-0.5',
    outline:
      'border border-slate-200 bg-white text-slate-800 hover:border-[#0052FF]/40 hover:bg-slate-50 hover:shadow-xs hover:-translate-y-0.5',
    ghost:
      'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70',
  }[variant];

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </>
  );

  const combinedClasses = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {content}
    </button>
  );
}
