export type UserRole = 'admin' | 'reception' | 'owner';

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  mustChangePassword?: boolean;
  assignedEquipmentIds?: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export type WorkflowStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'AWAITING_OWNER_REVIEW'
  | 'QUOTATION_READY'
  | 'QUOTATION_SENT'
  | 'AWAITING_USER_DECISION'
  | 'APPROVED'
  | 'CONFIRMED'
  | 'SAMPLES_RECEIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'READY_FOR_HANDOVER'
  | 'DISPATCHED'
  | 'NEEDS_INFORMATION'
  | 'OWNER_CLARIFICATION'
  | 'OWNER_REJECTED'
  | 'QUOTATION_DECLINED'
  | 'CANCELLED'
  | 'ON_HOLD';

export type RequestType = 'booking' | 'sample_analysis' | 'both';

export type EquipmentStatus = 'available' | 'unavailable' | 'maintenance' | 'retired';

export interface Equipment {
  id: string;
  name: string;
  model: string;
  category: string; // Configurable research domain or resource type
  location: string;
  description: string;
  status: EquipmentStatus;
  isArchived: boolean;
  operatingHours: string;
  capacityPerHour: number;
  hourlyRateDemo: number;
  assignedOwnerIds: string[];
  specifications: Record<string, string>;
  imageUrl?: string;
}

export interface SampleDetails {
  description: string;
  quantity: string;
  storageConditions: string;
  isHazardous: boolean;
  hazardNotes?: string;
  analysisRequested: string;
  returnRequested: boolean;
}

export interface ServiceRequest {
  id: string;
  trackingId: string; // Non-sequential safe identifier e.g. RND-2026-X8K9
  requestType: RequestType;
  status: WorkflowStatus;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requesterOrg: string;
  department: string;
  equipmentId: string;
  preferredDateStart: string;
  preferredDateEnd?: string;
  preferredTimeSlot?: string;
  sampleDetails?: SampleDetails;
  projectTitle: string;
  purposeNotes: string;
  internalNotes?: string;
  publicNotes?: string;
  quotationAmount?: number;
  quotationStatus?: 'pending' | 'sent' | 'accepted' | 'declined';
  assignedOwnerId?: string;
  scheduledUsageHours?: number;
  actualUsageHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  id: string;
  requestId: string;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  timestamp: string;
  actorName: string;
  actorRole: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'Equipment' | 'Staff' | 'Request' | 'Quotation' | 'Session' | 'Maintenance';
  entityId: string;
  details: string;
}

export interface UsageSession {
  id: string;
  equipmentId: string;
  requestId: string;
  operatorName: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  hoursRecorded: number;
  onTimeStart: boolean;
  onTimeEnd: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  title: string;
  reportedBy: string;
  startDate: string;
  estimatedEndDate: string;
  resolvedDate?: string;
  status: 'scheduled' | 'active' | 'resolved';
  costDemo?: number;
  description: string;
}
