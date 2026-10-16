import {
  Equipment,
  StaffUser,
  ServiceRequest,
  WorkflowStatus,
  AuditLog,
  UsageSession,
  MaintenanceRecord,
  UserRole,
} from '@/types';
import {
  DEMO_EQUIPMENT,
  DEMO_STAFF,
  DEMO_REQUESTS,
  DEMO_AUDIT_LOGS,
  DEMO_USAGE_SESSIONS,
  DEMO_MAINTENANCE_RECORDS,
} from './mock-data';
import { canActorTransition, generateTrackingId } from './workflow';

const STORAGE_KEY_PREFIX = 'rnd_portal_demo_';

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

/**
 * Clean Data Access Layer (DAL) Interface
 * Readies the codebase for future Google Sheets Persistent Adapter
 */
export interface IDataStore {
  // Equipment
  getEquipmentList(): Promise<Equipment[]>;
  getEquipmentById(id: string): Promise<Equipment | null>;
  saveEquipment(item: Equipment, actorName: string, actorRole: string): Promise<Equipment>;
  archiveEquipment(id: string, actorName: string, actorRole: string): Promise<boolean>;

  // Staff
  getStaffList(): Promise<StaffUser[]>;
  getStaffById(id: string): Promise<StaffUser | null>;
  saveStaff(user: StaffUser, actorName: string, actorRole: string): Promise<StaffUser>;
  toggleStaffStatus(id: string, actorName: string, actorRole: string): Promise<boolean>;

  // Requests
  getRequests(filterRole?: UserRole, ownerId?: string): Promise<ServiceRequest[]>;
  getRequestByTrackingId(trackingId: string): Promise<ServiceRequest | null>;
  createPublicRequest(data: Omit<ServiceRequest, 'id' | 'trackingId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ServiceRequest>;
  updateRequestStatus(
    trackingId: string,
    newStatus: WorkflowStatus,
    actorName: string,
    actorRole: UserRole,
    notes?: string
  ): Promise<{ success: boolean; request?: ServiceRequest; error?: string }>;
  updateRequestDetails(
    trackingId: string,
    updates: Partial<ServiceRequest>,
    actorName: string,
    actorRole: string
  ): Promise<ServiceRequest | null>;

  // Audit Logs
  getAuditLogs(): Promise<AuditLog[]>;
  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;

  // Usage & Maintenance
  getUsageSessions(): Promise<UsageSession[]>;
  getMaintenanceRecords(): Promise<MaintenanceRecord[]>;
  addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>, actorName: string, actorRole: string): Promise<MaintenanceRecord>;
}

/**
 * In-Memory & LocalStorage Development/Demo Adapter
 * Fully operational for evaluation without requiring external credentials.
 */
class DemoDataStore implements IDataStore {
  private getEquipmentState(): Equipment[] {
    return getStored<Equipment[]>('equipment', DEMO_EQUIPMENT);
  }
  private saveEquipmentState(data: Equipment[]) {
    setStored('equipment', data);
  }

  private getStaffState(): StaffUser[] {
    return getStored<StaffUser[]>('staff', DEMO_STAFF);
  }
  private saveStaffState(data: StaffUser[]) {
    setStored('staff', data);
  }

  private getRequestsState(): ServiceRequest[] {
    return getStored<ServiceRequest[]>('requests', DEMO_REQUESTS);
  }
  private saveRequestsState(data: ServiceRequest[]) {
    setStored('requests', data);
  }

  private getAuditLogsState(): AuditLog[] {
    return getStored<AuditLog[]>('audit_logs', DEMO_AUDIT_LOGS);
  }
  private saveAuditLogsState(data: AuditLog[]) {
    setStored('audit_logs', data);
  }

  private getMaintenanceState(): MaintenanceRecord[] {
    return getStored<MaintenanceRecord[]>('maintenance', DEMO_MAINTENANCE_RECORDS);
  }
  private saveMaintenanceState(data: MaintenanceRecord[]) {
    setStored('maintenance', data);
  }

  async getEquipmentList(): Promise<Equipment[]> {
    return this.getEquipmentState().filter((eq) => !eq.isArchived);
  }

  async getEquipmentById(id: string): Promise<Equipment | null> {
    const list = this.getEquipmentState();
    return list.find((eq) => eq.id === id) || null;
  }

  async saveEquipment(item: Equipment, actorName: string, actorRole: string): Promise<Equipment> {
    const list = this.getEquipmentState();
    const index = list.findIndex((eq) => eq.id === item.id);
    let updated: Equipment;
    if (index >= 0) {
      updated = { ...item };
      list[index] = updated;
      await this.logAction({
        actorName,
        actorRole,
        action: 'EQUIPMENT_UPDATED',
        entityType: 'Equipment',
        entityId: item.id,
        details: `Updated equipment "${item.name}" (Status: ${item.status})`,
      });
    } else {
      updated = { ...item, id: `eq-${Date.now()}` };
      list.unshift(updated);
      await this.logAction({
        actorName,
        actorRole,
        action: 'EQUIPMENT_CREATED',
        entityType: 'Equipment',
        entityId: updated.id,
        details: `Added new equipment "${item.name}" in category ${item.category}`,
      });
    }
    this.saveEquipmentState(list);
    return updated;
  }

  async archiveEquipment(id: string, actorName: string, actorRole: string): Promise<boolean> {
    const list = this.getEquipmentState();
    const item = list.find((eq) => eq.id === id);
    if (!item) return false;
    item.isArchived = true;
    item.status = 'retired';
    this.saveEquipmentState(list);
    await this.logAction({
      actorName,
      actorRole,
      action: 'EQUIPMENT_ARCHIVED',
      entityType: 'Equipment',
      entityId: id,
      details: `Archived equipment "${item.name}"`,
    });
    return true;
  }

  async getStaffList(): Promise<StaffUser[]> {
    return this.getStaffState();
  }

  async getStaffById(id: string): Promise<StaffUser | null> {
    return this.getStaffState().find((s) => s.id === id) || null;
  }

  async saveStaff(user: StaffUser, actorName: string, actorRole: string): Promise<StaffUser> {
    const list = this.getStaffState();
    const idx = list.findIndex((s) => s.id === user.id);
    let saved: StaffUser;
    if (idx >= 0) {
      saved = { ...user };
      list[idx] = saved;
      await this.logAction({
        actorName,
        actorRole,
        action: 'STAFF_UPDATED',
        entityType: 'Staff',
        entityId: user.id,
        details: `Updated staff profile for ${user.fullName} (${user.role})`,
      });
    } else {
      saved = { ...user, id: `staff-${Date.now()}`, createdAt: new Date().toISOString() };
      list.push(saved);
      await this.logAction({
        actorName,
        actorRole,
        action: 'STAFF_CREATED',
        entityType: 'Staff',
        entityId: saved.id,
        details: `Created new staff account for ${user.fullName} (${user.username}, role: ${user.role})`,
      });
    }
    this.saveStaffState(list);
    return saved;
  }

  async toggleStaffStatus(id: string, actorName: string, actorRole: string): Promise<boolean> {
    const list = this.getStaffState();
    const user = list.find((s) => s.id === id);
    if (!user) return false;
    user.status = user.status === 'active' ? 'inactive' : 'active';
    this.saveStaffState(list);
    await this.logAction({
      actorName,
      actorRole,
      action: 'STAFF_STATUS_TOGGLED',
      entityType: 'Staff',
      entityId: id,
      details: `Changed account status for ${user.fullName} to ${user.status.toUpperCase()}`,
    });
    return true;
  }

  async getRequests(filterRole?: UserRole, ownerId?: string): Promise<ServiceRequest[]> {
    const list = this.getRequestsState();
    if (filterRole === 'owner' && ownerId) {
      // Equipment owners only see requests assigned to them or their equipment
      const staffList = this.getStaffState();
      const owner = staffList.find((s) => s.id === ownerId || s.username === ownerId);
      const assignedEq = owner?.assignedEquipmentIds || [];
      return list.filter((r) => r.assignedOwnerId === owner?.id || assignedEq.includes(r.equipmentId));
    }
    return list;
  }

  async getRequestByTrackingId(trackingId: string): Promise<ServiceRequest | null> {
    const list = this.getRequestsState();
    const normalized = trackingId.trim().toUpperCase();
    return list.find((r) => r.trackingId.toUpperCase() === normalized) || null;
  }

  async createPublicRequest(
    data: Omit<ServiceRequest, 'id' | 'trackingId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceRequest> {
    const list = this.getRequestsState();
    const trackingId = generateTrackingId();
    const now = new Date().toISOString();
    const newReq: ServiceRequest = {
      ...data,
      id: `req-${Date.now()}`,
      trackingId,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
      publicNotes: 'Request received and queued for central reception review.',
      internalNotes: 'Automated initial intake from public portal.',
    };
    list.unshift(newReq);
    this.saveRequestsState(list);

    await this.logAction({
      actorName: data.requesterName,
      actorRole: 'Public Requester',
      action: 'PUBLIC_REQUEST_SUBMITTED',
      entityType: 'Request',
      entityId: trackingId,
      details: `New ${data.requestType} request submitted for ${data.projectTitle}`,
    });

    return newReq;
  }

  async updateRequestStatus(
    trackingId: string,
    newStatus: WorkflowStatus,
    actorName: string,
    actorRole: UserRole,
    notes?: string
  ): Promise<{ success: boolean; request?: ServiceRequest; error?: string }> {
    const list = this.getRequestsState();
    const req = list.find((r) => r.trackingId.toUpperCase() === trackingId.toUpperCase());
    if (!req) {
      return { success: false, error: 'Request not found' };
    }

    if (!canActorTransition(req.status, newStatus, actorRole)) {
      return {
        success: false,
        error: `Invalid transition from ${req.status} to ${newStatus} for role ${actorRole}`,
      };
    }

    const oldStatus = req.status;
    req.status = newStatus;
    req.updatedAt = new Date().toISOString();
    if (notes) {
      req.internalNotes = (req.internalNotes ? req.internalNotes + '\n' : '') + `[${new Date().toLocaleDateString()}] ${actorName}: ${notes}`;
    }

    this.saveRequestsState(list);

    await this.logAction({
      actorName,
      actorRole,
      action: 'STATUS_TRANSITION',
      entityType: 'Request',
      entityId: req.trackingId,
      details: `Status transitioned from ${oldStatus} to ${newStatus}. Notes: ${notes || 'None'}`,
    });

    return { success: true, request: req };
  }

  async updateRequestDetails(
    trackingId: string,
    updates: Partial<ServiceRequest>,
    actorName: string,
    actorRole: string
  ): Promise<ServiceRequest | null> {
    const list = this.getRequestsState();
    const req = list.find((r) => r.trackingId.toUpperCase() === trackingId.toUpperCase());
    if (!req) return null;

    Object.assign(req, updates);
    req.updatedAt = new Date().toISOString();
    this.saveRequestsState(list);

    await this.logAction({
      actorName,
      actorRole,
      action: 'REQUEST_UPDATED',
      entityType: 'Request',
      entityId: req.trackingId,
      details: `Updated request details: ${Object.keys(updates).join(', ')}`,
    });

    return req;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.getAuditLogsState().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const list = this.getAuditLogsState();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newLog);
    this.saveAuditLogsState(list.slice(0, 500)); // maintain rolling 500 logs
    return newLog;
  }

  async getUsageSessions(): Promise<UsageSession[]> {
    return DEMO_USAGE_SESSIONS;
  }

  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return this.getMaintenanceState();
  }

  async addMaintenanceRecord(
    record: Omit<MaintenanceRecord, 'id'>,
    actorName: string,
    actorRole: string
  ): Promise<MaintenanceRecord> {
    const list = this.getMaintenanceState();
    const newRec: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now()}`,
    };
    list.unshift(newRec);
    this.saveMaintenanceState(list);

    await this.logAction({
      actorName,
      actorRole,
      action: 'MAINTENANCE_LOGGED',
      entityType: 'Maintenance',
      entityId: newRec.id,
      details: `Recorded maintenance for equipment ${newRec.equipmentId}: ${newRec.title}`,
    });

    return newRec;
  }
}

// Global singleton instance of DAL
export const dataStore: IDataStore = new DemoDataStore();
