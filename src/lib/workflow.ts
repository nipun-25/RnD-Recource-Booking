import { WorkflowStatus, UserRole } from '@/types';

export const WORKFLOW_LABELS: Record<WorkflowStatus, { label: string; badge: string; publicLabel: string }> = {
  SUBMITTED: {
    label: 'Submitted',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    publicLabel: 'Request Received & In Queue',
  },
  UNDER_REVIEW: {
    label: 'Under Reception Review',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    publicLabel: 'Under Initial Review',
  },
  AWAITING_OWNER_REVIEW: {
    label: 'Awaiting Owner Review',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    publicLabel: 'Technical Feasibility Review',
  },
  OWNER_CLARIFICATION: {
    label: 'Owner Needs Clarification',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    publicLabel: 'Clarification Requested',
  },
  OWNER_REJECTED: {
    label: 'Owner Rejected Technical Feasibility',
    badge: 'bg-red-50 text-red-700 border-red-200',
    publicLabel: 'Technical Request Declined',
  },
  NEEDS_INFORMATION: {
    label: 'Needs Requester Information',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    publicLabel: 'Action Required: Additional Info Needed',
  },
  QUOTATION_READY: {
    label: 'Quotation Prepared',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    publicLabel: 'Review in Final Stages',
  },
  QUOTATION_SENT: {
    label: 'Quotation Dispatched',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    publicLabel: 'Quotation Issued to Requester',
  },
  AWAITING_USER_DECISION: {
    label: 'Awaiting Requester Decision',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    publicLabel: 'Awaiting User Confirmation',
  },
  QUOTATION_DECLINED: {
    label: 'Quotation Declined by User',
    badge: 'bg-stone-50 text-stone-700 border-stone-200',
    publicLabel: 'Quotation Declined',
  },
  APPROVED: {
    label: 'Approved',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    publicLabel: 'Approved',
  },
  CONFIRMED: {
    label: 'Booking Confirmed',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    publicLabel: 'Scheduled / Confirmed',
  },
  SAMPLES_RECEIVED: {
    label: 'Samples Logged in Reception',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    publicLabel: 'Samples Received at Lab',
  },
  PROCESSING: {
    label: 'Active Analysis / Processing',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    publicLabel: 'Analysis in Progress',
  },
  COMPLETED: {
    label: 'Session / Analysis Completed',
    badge: 'bg-green-100 text-green-800 border-green-300',
    publicLabel: 'Analysis Completed',
  },
  READY_FOR_HANDOVER: {
    label: 'Ready for Handover / Report Ready',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    publicLabel: 'Ready for Collection / Report Available',
  },
  DISPATCHED: {
    label: 'Dispatched / Closed',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    publicLabel: 'Completed & Dispatched',
  },
  ON_HOLD: {
    label: 'On Hold',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    publicLabel: 'Temporarily On Hold',
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    publicLabel: 'Request Cancelled',
  },
};

// State Machine transitions
export const ALLOWED_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED', 'NEEDS_INFORMATION'],
  UNDER_REVIEW: ['AWAITING_OWNER_REVIEW', 'NEEDS_INFORMATION', 'QUOTATION_READY', 'CANCELLED', 'ON_HOLD'],
  AWAITING_OWNER_REVIEW: ['QUOTATION_READY', 'OWNER_CLARIFICATION', 'OWNER_REJECTED', 'APPROVED', 'CANCELLED'],
  OWNER_CLARIFICATION: ['UNDER_REVIEW', 'AWAITING_OWNER_REVIEW', 'NEEDS_INFORMATION', 'CANCELLED'],
  OWNER_REJECTED: ['UNDER_REVIEW', 'CANCELLED'],
  NEEDS_INFORMATION: ['UNDER_REVIEW', 'CANCELLED'],
  QUOTATION_READY: ['QUOTATION_SENT', 'UNDER_REVIEW', 'CANCELLED'],
  QUOTATION_SENT: ['AWAITING_USER_DECISION', 'APPROVED', 'QUOTATION_DECLINED', 'CANCELLED'],
  AWAITING_USER_DECISION: ['APPROVED', 'QUOTATION_DECLINED', 'CANCELLED', 'ON_HOLD'],
  QUOTATION_DECLINED: ['CANCELLED', 'UNDER_REVIEW'],
  APPROVED: ['CONFIRMED', 'SAMPLES_RECEIVED', 'PROCESSING', 'CANCELLED'],
  CONFIRMED: ['SAMPLES_RECEIVED', 'PROCESSING', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
  SAMPLES_RECEIVED: ['PROCESSING', 'ON_HOLD', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'ON_HOLD', 'NEEDS_INFORMATION'],
  COMPLETED: ['READY_FOR_HANDOVER', 'DISPATCHED'],
  READY_FOR_HANDOVER: ['DISPATCHED', 'COMPLETED'],
  DISPATCHED: [],
  ON_HOLD: ['UNDER_REVIEW', 'PROCESSING', 'CONFIRMED', 'CANCELLED'],
  CANCELLED: [],
};

// Permissions check for transitioning statuses
export function canActorTransition(from: WorkflowStatus, to: WorkflowStatus, role: UserRole): boolean {
  if (role === 'admin') return true; // Admins have master override capability
  
  const validNext = ALLOWED_TRANSITIONS[from] || [];
  if (!validNext.includes(to)) return false;

  if (role === 'reception') {
    // Reception can manage review, quotes, communication, booking confirm, sample receipt, dispatches
    const ownerOnlyTransitions: WorkflowStatus[] = ['OWNER_CLARIFICATION', 'OWNER_REJECTED'];
    if (ownerOnlyTransitions.includes(to)) return false;
    return true;
  }

  if (role === 'owner') {
    // Equipment owners can review technical feasibility, accept/reject, mark processing, completion
    const allowedForOwner: WorkflowStatus[] = [
      'OWNER_CLARIFICATION',
      'OWNER_REJECTED',
      'QUOTATION_READY',
      'APPROVED',
      'PROCESSING',
      'COMPLETED',
      'ON_HOLD'
    ];
    return allowedForOwner.includes(to);
  }

  return false;
}

// Generate non-sequential tracking ID
export function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous 0,O,1,I
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RND-${year}-${code}`;
}
