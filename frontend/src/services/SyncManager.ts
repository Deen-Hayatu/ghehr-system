import offlineDB, { SyncQueueItem } from './OfflineDatabase';

// Network status detection
export class NetworkManager {
  private static instance: NetworkManager;
  private isOnline: boolean = navigator.onLine;
  private callbacks: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Network: ONLINE');
      this.isOnline = true;
      this.notifyCallbacks();
      // Auto-sync when coming back online
      SyncManager.getInstance().syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Network: OFFLINE');
      this.isOnline = false;
      this.notifyCallbacks();
    });

    // Additional connectivity check using a simple fetch
    this.checkConnectivity();
    setInterval(() => this.checkConnectivity(), 30000); // Check every 30 seconds
  }

  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const wasOffline = !this.isOnline;
      this.isOnline = response.ok;
      
      if (wasOffline && this.isOnline) {
        console.log('🔄 Connectivity restored, starting sync...');
        this.notifyCallbacks();
        SyncManager.getInstance().syncPendingOperations();
      }
    } catch (error) {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      
      if (wasOnline) {
        console.log('📡 Lost connectivity to server');
        this.notifyCallbacks();
      }
    }
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public onStatusChange(callback: (isOnline: boolean) => void): void {
    this.callbacks.push(callback);
  }

  public removeStatusListener(callback: (isOnline: boolean) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.isOnline));
  }
}

// Sync Manager for handling offline operations
export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private retryAttempts: number = 3;
  private retryDelay: number = 2000; // 2 seconds

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Add operation to sync queue
  async queueOperation(
    operation: 'create' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    data: any,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    try {
      await offlineDB.addToSyncQueue(operation, entityType, entityId, data, priority);
      console.log(`🔄 Queued ${operation} operation for ${entityType}:${entityId}`);
      
      // If online, try to sync immediately
      if (NetworkManager.getInstance().getStatus()) {
        this.syncPendingOperations();
      }
    } catch (error) {
      console.error('❌ Failed to queue sync operation:', error);
    }
  }

  // Sync all pending operations
  async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress || !NetworkManager.getInstance().getStatus()) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting sync of pending operations...');

    try {
      const pendingOperations = await offlineDB.getPendingSyncOperations();
      
      if (pendingOperations.length === 0) {
        console.log('✅ No pending operations to sync');
        this.syncInProgress = false;
        return;
      }

      console.log(`📋 Found ${pendingOperations.length} pending operations`);

      // Sort by priority (high -> normal -> low) and timestamp
      const sortedOperations = pendingOperations.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      // Process operations sequentially to maintain order
      for (const operation of sortedOperations) {
        await this.processSyncOperation(operation);
      }

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process individual sync operation
  private async processSyncOperation(operation: SyncQueueItem): Promise<void> {
    const { id, operation: op, entityType, entityId, data } = operation;

    try {
      console.log(`🔄 Syncing ${op} ${entityType}:${entityId}`);

      let response: Response;
      const apiUrl = this.getApiUrl(entityType, entityId, op);
      const requestOptions: RequestInit = {
        method: this.getHttpMethod(op),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: op !== 'delete' ? JSON.stringify(data) : undefined
      };

      response = await fetch(apiUrl, requestOptions);

      if (response.ok) {
        // Sync successful, remove from queue
        await offlineDB.removeFromSyncQueue(id!);
        console.log(`✅ Successfully synced ${op} ${entityType}:${entityId}`);
        
        // Update local data with server response if needed
        if (op !== 'delete') {
          const serverData = await response.json();
          await this.updateLocalData(entityType, serverData.data);
        }
      } else if (response.status === 409) {
        // Conflict detected
        const serverData = await response.json();
        await this.handleConflict(operation, serverData);
      } else {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Failed to sync ${op} ${entityType}:${entityId}:`, error);
      
      // Increment attempt counter
      operation.attempts = (operation.attempts || 0) + 1;
      
      if (operation.attempts >= operation.maxAttempts) {
        console.error(`❌ Max attempts reached for ${op} ${entityType}:${entityId}, removing from queue`);
        await offlineDB.removeFromSyncQueue(id!);
      } else {
        // Update the operation with new attempt count
        await offlineDB.save('syncQueue', operation);
        console.log(`🔄 Will retry ${op} ${entityType}:${entityId} (attempt ${operation.attempts}/${operation.maxAttempts})`);
      }
    }
  }

  // Handle sync conflicts
  private async handleConflict(operation: SyncQueueItem, serverResponse: any): Promise<void> {
    console.log(`⚠️ Conflict detected for ${operation.entityType}:${operation.entityId}`);
    
    // Store conflict for user resolution
    await offlineDB.addConflict(
      operation.entityType,
      operation.entityId,
      operation.data,
      serverResponse.data
    );

    // Remove operation from sync queue (will be re-added after conflict resolution)
    await offlineDB.removeFromSyncQueue(operation.id!);
    
    // Emit conflict event for UI to handle
    window.dispatchEvent(new CustomEvent('sync-conflict', {
      detail: {
        entityType: operation.entityType,
        entityId: operation.entityId,
        localData: operation.data,
        serverData: serverResponse.data
      }
    }));
  }

  // Update local data after successful sync
  private async updateLocalData(entityType: string, serverData: any): Promise<void> {
    try {
      const storeName = this.getStoreName(entityType);
      await offlineDB.save(storeName, serverData);
      console.log(`📱 Updated local ${entityType} data from server`);
    } catch (error) {
      console.error(`❌ Failed to update local ${entityType} data:`, error);
    }
  }

  // Helper methods
  private getApiUrl(entityType: string, entityId: string, operation: string): string {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const entityEndpoint = this.getEntityEndpoint(entityType);
    
    switch (operation) {
      case 'create':
        return `${baseUrl}/${entityEndpoint}`;
      case 'update':
        return `${baseUrl}/${entityEndpoint}/${entityId}`;
      case 'delete':
        return `${baseUrl}/${entityEndpoint}/${entityId}`;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private getHttpMethod(operation: string): string {
    switch (operation) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private getEntityEndpoint(entityType: string): string {
    const endpoints: { [key: string]: string } = {
      patient: 'patients',
      appointment: 'appointments',
      clinicalNote: 'notes',
      labOrder: 'lab-orders',
      billing: 'billing'
    };
    
    return endpoints[entityType] || entityType;
  }

  private getStoreName(entityType: string): string {
    const storeNames: { [key: string]: string } = {
      patient: 'patients',
      appointment: 'appointments',
      clinicalNote: 'clinicalNotes',
      labOrder: 'labOrders',
      billing: 'billing'
    };
    
    return storeNames[entityType] || entityType;
  }

  private getAuthToken(): string {
    // Get JWT token from localStorage or context
    return localStorage.getItem('authToken') || '';
  }

  // Manual sync trigger
  async forcSync(): Promise<void> {
    console.log('🔄 Manual sync triggered');
    await this.syncPendingOperations();
  }

  // Get sync status
  getSyncStatus(): { inProgress: boolean; pendingCount: number } {
    return {
      inProgress: this.syncInProgress,
      pendingCount: 0 // Will be updated with actual count
    };
  }
}

// Initialize network manager
const networkManager = NetworkManager.getInstance();
const syncManager = SyncManager.getInstance();

export { networkManager, syncManager };
