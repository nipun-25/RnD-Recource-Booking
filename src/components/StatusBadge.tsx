'use client';

import React from 'react';
import { WorkflowStatus } from '@/types';
import { WORKFLOW_LABELS } from '@/lib/workflow';

interface StatusBadgeProps {
  status: WorkflowStatus;
  isPublic?: boolean;
  className?: string;
}

export function StatusBadge({ status, isPublic = false, className = '' }: StatusBadgeProps) {
  const meta = WORKFLOW_LABELS[status] || {
    label: status,
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
    publicLabel: status,
  };

  const displayText = isPublic ? meta.publicLabel : meta.label;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs ${meta.badge} ${className}`}
      title={`Current Status: ${meta.label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75 animate-pulse" />
      {displayText}
    </span>
  );
}
