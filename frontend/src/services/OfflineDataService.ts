import offlineDB from './OfflineDatabase';
import { syncManager, networkManager } from './SyncManager';

// Generic offline-first data service
export class OfflineDataService<T extends { id: string }> {
  private entityType: string;
  private storeName: string;
  private apiEndpoint: string;

  constructor(entityType: string, storeName: string, apiEndpoint: string) {
    this.entityType = entityType;
    this.storeName = storeName;
    this.apiEndpoint = apiEndpoint;
  }

  // Create new entity (offline-first)
  async create(data: Omit<T, 'id'>): Promise<T> {
    const id = this.generateId();
    const entityData = { ...data, id } as T;

    try {
      // Save to local storage immediately
      await offlineDB.save(this.storeName, entityData);
      console.log(`💾 ${this.entityType} saved locally:`, id);

      // Queue for sync when online
      await syncManager.queueOperation('create', this.entityType, id, entityData, 'normal');

      return entityData;
    } catch (error) {
      console.error(`❌ Failed to create ${this.entityType}:`, error);
      throw error;
    }
  }

  // Update existing entity (offline-first)
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      // Get current data
      const currentData = await offlineDB.get(this.storeName, id);
      if (!currentData) {
        throw new Error(`${this.entityType} not found: ${id}`);
      }

      const updatedData = { ...currentData, ...data, id } as T;

      // Save to local storage immediately
      await offlineDB.save(this.storeName, updatedData);
      console.log(`💾 ${this.entityType} updated locally:`, id);

      // Queue for sync when online
      await syncManager.queueOperation('update', this.entityType, id, updatedData, 'normal');

      return updatedData;
    } catch (error) {
      console.error(`❌ Failed to update ${this.entityType}:`, error);
      throw error;
    }
  }

  // Delete entity (offline-first)
  async delete(id: string): Promise<void> {
    try {
      // Mark as deleted locally (soft delete)
      const currentData = await offlineDB.get(this.storeName, id);
      if (currentData) {
        currentData.deleted = true;
        currentData.deletedAt = new Date().toISOString();
        await offlineDB.save(this.storeName, currentData);
      }

      console.log(`🗑️ ${this.entityType} marked for deletion:`, id);

      // Queue for sync when online
      await syncManager.queueOperation('delete', this.entityType, id, null, 'normal');
    } catch (error) {
      console.error(`❌ Failed to delete ${this.entityType}:`, error);
      throw error;
    }
  }

  // Get entity by ID (local-first)
  async getById(id: string): Promise<T | null> {
    try {
      const data = await offlineDB.get(this.storeName, id);
      
      // Don't return deleted items
      if (data && !data.deleted) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Failed to get ${this.entityType}:`, error);
      throw error;
    }
  }

  // Get all entities (local-first with optional server sync)
  async getAll(forceSync: boolean = false): Promise<T[]> {
    try {
      // Get local data first
      const localData = await offlineDB.getAll(this.storeName, item => !item.deleted);

      // If we're online and force sync is requested, try to get fresh data
      if (forceSync && networkManager.getStatus()) {
        try {
          const response = await fetch(`${this.getApiUrl()}`, {
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`
            }
          });

          if (response.ok) {
            const serverData = await response.json();
            
            // Update local storage with server data
            if (serverData.data && Array.isArray(serverData.data)) {
              for (const item of serverData.data) {
                await offlineDB.save(this.storeName, item);
              }
              
              // Return fresh data
              return serverData.data.filter((item: any) => !item.deleted);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to sync ${this.entityType} from server, using local data:`, error);
        }
      }

      return localData;
    } catch (error) {
      console.error(`❌ Failed to get all ${this.entityType}:`, error);
      throw error;
    }
  }

  // Search entities locally
  async search(query: string, fields: string[] = []): Promise<T[]> {
    try {
      const allData = await this.getAll();
      
      if (!query.trim()) {
        return allData;
      }

      const searchQuery = query.toLowerCase();
      
      return allData.filter(item => {
        // If no specific fields provided, search all string fields
        if (fields.length === 0) {
          return JSON.stringify(item).toLowerCase().includes(searchQuery);
        }
        
        // Search specific fields
        return fields.some(field => {
          const value = (item as any)[field];
          return value && value.toString().toLowerCase().includes(searchQuery);
        });
      });
    } catch (error) {
      console.error(`❌ Failed to search ${this.entityType}:`, error);
      throw error;
    }
  }

  // Get entities with pagination (local)
  async getPaginated(page: number = 1, limit: number = 10, filters: any = {}): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      let allData = await this.getAll();
      
      // Apply filters
      if (Object.keys(filters).length > 0) {
        allData = allData.filter(item => {
          return Object.entries(filters).every(([key, value]) => {
            if (value === null || value === undefined || value === '') {
              return true;
            }
            
            const itemValue = (item as any)[key];
            if (typeof value === 'string') {
              return itemValue && itemValue.toString().toLowerCase().includes(value.toLowerCase());
            }
            
            return itemValue === value;
          });
        });
      }

      const total = allData.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const data = allData.slice(offset, offset + limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error(`❌ Failed to paginate ${this.entityType}:`, error);
      throw error;
    }
  }

  // Helper methods
  private generateId(): string {
    // Generate temporary ID for offline creation
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getApiUrl(): string {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/${this.apiEndpoint}`;
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

// Specific service implementations
export class PatientService extends OfflineDataService<any> {
  constructor() {
    super('patient', 'patients', 'patients');
  }

  // Patient-specific methods
  async searchByPhone(phoneNumber: string): Promise<any[]> {
    return this.search(phoneNumber, ['phoneNumber', 'emergencyContact.phoneNumber']);
  }

  async searchByEmail(email: string): Promise<any[]> {
    return this.search(email, ['email']);
  }

  async getByPatientId(patientId: string): Promise<any | null> {
    const allPatients = await this.getAll();
    return allPatients.find(p => p.patientId === patientId) || null;
  }
}

export class AppointmentService extends OfflineDataService<any> {
  constructor() {
    super('appointment', 'appointments', 'appointments');
  }

  // Appointment-specific methods
  async getByPatientId(patientId: string): Promise<any[]> {
    const allAppointments = await this.getAll();
    return allAppointments.filter(a => a.patientId === patientId);
  }

  async getByDate(date: string): Promise<any[]> {
    const allAppointments = await this.getAll();
    return allAppointments.filter(a => a.date === date);
  }

  async getByStatus(status: string): Promise<any[]> {
    const allAppointments = await this.getAll();
    return allAppointments.filter(a => a.status === status);
  }
}

export class ClinicalNotesService extends OfflineDataService<any> {
  constructor() {
    super('clinicalNote', 'clinicalNotes', 'notes');
  }

  // Clinical notes specific methods
  async getByPatientId(patientId: string): Promise<any[]> {
    const allNotes = await this.getAll();
    return allNotes.filter(n => n.patientId === patientId)
                   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export class LabOrderService extends OfflineDataService<any> {
  constructor() {
    super('labOrder', 'labOrders', 'lab-orders');
  }

  // Lab order specific methods
  async getByPatientId(patientId: string): Promise<any[]> {
    const allOrders = await this.getAll();
    return allOrders.filter(o => o.patientId === patientId);
  }

  async getByStatus(status: string): Promise<any[]> {
    const allOrders = await this.getAll();
    return allOrders.filter(o => o.status === status);
  }
}

export class BillingService extends OfflineDataService<any> {
  constructor() {
    super('billing', 'billing', 'billing');
  }

  // Billing specific methods
  async getByPatientId(patientId: string): Promise<any[]> {
    const allBilling = await this.getAll();
    return allBilling.filter(b => b.patientId === patientId);
  }

  async getUnpaid(): Promise<any[]> {
    const allBilling = await this.getAll();
    return allBilling.filter(b => b.status === 'pending' || b.status === 'overdue');
  }
}

// Service instances
export const patientService = new PatientService();
export const appointmentService = new AppointmentService();
export const clinicalNotesService = new ClinicalNotesService();
export const labOrderService = new LabOrderService();
export const billingService = new BillingService();
