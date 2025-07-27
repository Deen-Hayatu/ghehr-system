// IndexedDB wrapper for offline data storage
interface SyncQueueItem {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  data: any;
  priority: 'high' | 'normal' | 'low';
  timestamp: string;
  attempts: number;
  maxAttempts: number;
}

interface ConflictItem {
  id?: number;
  entityType: string;
  entityId: string;
  localData: any;
  serverData: any;
  timestamp: string;
  resolved: boolean;
  resolution?: any;
  resolvedAt?: string;
}

class OfflineDatabase {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null;
  private stores: {
    patients: string;
    appointments: string;
    clinicalNotes: string;
    labOrders: string;
    billing: string;
    syncQueue: string;
    conflicts: string;
  };

  constructor() {
    this.dbName = 'GhEHR_Offline';
    this.version = 1;
    this.db = null;
    this.stores = {
      patients: 'patients',
      appointments: 'appointments',
      clinicalNotes: 'clinicalNotes',
      labOrders: 'labOrders',
      billing: 'billing',
      syncQueue: 'syncQueue',
      conflicts: 'conflicts'
    };
  }

  // Initialize the database
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBRequest).result;
        this.createStores();
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBRequest).result;
        console.log('✅ IndexedDB initialized successfully');
        resolve(this.db!);
      };

      request.onerror = (event) => {
        console.error('❌ IndexedDB initialization failed:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Create object stores for different data types
  private createStores(): void {
    if (!this.db) return;

    // Patients store
    if (!this.db.objectStoreNames.contains(this.stores.patients)) {
      const patientsStore = this.db.createObjectStore(this.stores.patients, { 
        keyPath: 'id' 
      });
      patientsStore.createIndex('patientId', 'patientId', { unique: true });
      patientsStore.createIndex('email', 'email', { unique: false });
      patientsStore.createIndex('phoneNumber', 'phoneNumber', { unique: false });
      patientsStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // Appointments store
    if (!this.db.objectStoreNames.contains(this.stores.appointments)) {
      const appointmentsStore = this.db.createObjectStore(this.stores.appointments, { 
        keyPath: 'id' 
      });
      appointmentsStore.createIndex('patientId', 'patientId', { unique: false });
      appointmentsStore.createIndex('date', 'date', { unique: false });
      appointmentsStore.createIndex('status', 'status', { unique: false });
      appointmentsStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // Clinical Notes store
    if (!this.db.objectStoreNames.contains(this.stores.clinicalNotes)) {
      const notesStore = this.db.createObjectStore(this.stores.clinicalNotes, { 
        keyPath: 'id' 
      });
      notesStore.createIndex('patientId', 'patientId', { unique: false });
      notesStore.createIndex('createdAt', 'createdAt', { unique: false });
      notesStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // Lab Orders store
    if (!this.db.objectStoreNames.contains(this.stores.labOrders)) {
      const labStore = this.db.createObjectStore(this.stores.labOrders, { 
        keyPath: 'id' 
      });
      labStore.createIndex('patientId', 'patientId', { unique: false });
      labStore.createIndex('status', 'status', { unique: false });
      labStore.createIndex('scheduledDate', 'scheduledDate', { unique: false });
      labStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // Billing store
    if (!this.db.objectStoreNames.contains(this.stores.billing)) {
      const billingStore = this.db.createObjectStore(this.stores.billing, { 
        keyPath: 'id' 
      });
      billingStore.createIndex('patientId', 'patientId', { unique: false });
      billingStore.createIndex('status', 'status', { unique: false });
      billingStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // Sync Queue store - for pending operations
    if (!this.db.objectStoreNames.contains(this.stores.syncQueue)) {
      const syncStore = this.db.createObjectStore(this.stores.syncQueue, { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      syncStore.createIndex('operation', 'operation', { unique: false });
      syncStore.createIndex('entityType', 'entityType', { unique: false });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncStore.createIndex('priority', 'priority', { unique: false });
    }

    // Conflicts store - for conflict resolution
    if (!this.db.objectStoreNames.contains(this.stores.conflicts)) {
      const conflictsStore = this.db.createObjectStore(this.stores.conflicts, { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      conflictsStore.createIndex('entityId', 'entityId', { unique: false });
      conflictsStore.createIndex('entityType', 'entityType', { unique: false });
      conflictsStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    console.log('✅ IndexedDB stores created successfully');
  }

  // Generic method to add/update data
  async save(storeName: string, data: any): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const timestamp = new Date().toISOString();
    const dataWithTimestamp = {
      ...data,
      lastModified: timestamp,
      isOffline: !navigator.onLine
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(dataWithTimestamp);

      request.onsuccess = () => {
        console.log(`✅ Data saved to ${storeName}:`, data.id);
        resolve(dataWithTimestamp);
      };

      request.onerror = () => {
        console.error(`❌ Failed to save to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // Generic method to get data by ID
  async get(storeName: string, id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`❌ Failed to get from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // Generic method to get all data from a store
  async getAll(storeName: string, filter?: (item: any) => boolean): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;
        
        // Apply filter if provided
        if (filter) {
          results = results.filter(filter);
        }
        
        resolve(results);
      };

      request.onerror = () => {
        console.error(`❌ Failed to get all from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // Delete data by ID
  async delete(storeName: string, id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`✅ Data deleted from ${storeName}:`, id);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`❌ Failed to delete from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // Add operation to sync queue
  async addToSyncQueue(
    operation: 'create' | 'update' | 'delete', 
    entityType: string, 
    entityId: string, 
    data: any, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<any> {
    const syncItem: SyncQueueItem = {
      operation,
      entityType,
      entityId,
      data,
      priority,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    };

    return this.save(this.stores.syncQueue, syncItem);
  }

  // Get pending sync operations
  async getPendingSyncOperations(): Promise<SyncQueueItem[]> {
    return this.getAll(this.stores.syncQueue);
  }

  // Remove from sync queue after successful sync
  async removeFromSyncQueue(id: number): Promise<boolean> {
    return this.delete(this.stores.syncQueue, id.toString());
  }

  // Add conflict for resolution
  async addConflict(entityType: string, entityId: string, localData: any, serverData: any): Promise<any> {
    const conflict: ConflictItem = {
      entityType,
      entityId,
      localData,
      serverData,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    return this.save(this.stores.conflicts, conflict);
  }

  // Get unresolved conflicts
  async getConflicts(): Promise<ConflictItem[]> {
    return this.getAll(this.stores.conflicts, conflict => !conflict.resolved);
  }

  // Mark conflict as resolved
  async resolveConflict(conflictId: number, resolution: any): Promise<void> {
    const conflict = await this.get(this.stores.conflicts, conflictId.toString());
    if (conflict) {
      conflict.resolved = true;
      conflict.resolution = resolution;
      conflict.resolvedAt = new Date().toISOString();
      await this.save(this.stores.conflicts, conflict);
    }
  }

  // Clear all data (for development/testing)
  async clearAll(): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const storeNames = Object.values(this.stores);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      let completed = 0;
      
      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === storeNames.length) {
            console.log('✅ All offline data cleared');
            resolve(true);
          }
        };
        
        request.onerror = () => {
          console.error(`❌ Failed to clear ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }
}

// Create singleton instance
const offlineDB = new OfflineDatabase();

export default offlineDB;
export type { SyncQueueItem, ConflictItem };
