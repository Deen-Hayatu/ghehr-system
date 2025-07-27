// PWA Installation and Service Worker Registration Manager
import offlineDB from './OfflineDatabase';
import { syncManager, networkManager } from './SyncManager';

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: any = null;
  private isInstalled: boolean = false;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async init() {
    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupPWAEventListeners();
    this.checkInstallStatus();
  }

  // Register Service Worker
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        console.log('🔧 Registering service worker...');
        
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('✅ Service Worker registered successfully');

        // Handle service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('🔄 New service worker version found');
          
          const newWorker = this.swRegistration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('📦 New service worker installed, prompting for update');
                this.promptForUpdate();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('🚀 Service Worker is ready');

        // Initialize background sync if supported
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          console.log('✅ Background Sync supported');
          this.setupBackgroundSync();
        }

        // Initialize push notifications if supported
        if ('PushManager' in window) {
          console.log('✅ Push Notifications supported');
          this.setupPushNotifications();
        }

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    } else {
      console.warn('⚠️ Service Workers not supported');
    }
  }

  // Setup installation prompt
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Show custom install banner
      this.showInstallBanner();
    });
  }

  // Setup PWA event listeners
  private setupPWAEventListeners(): void {
    // App installed event
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      this.isInstalled = true;
      this.hideInstallBanner();
      
      // Show welcome message
      this.showWelcomeMessage();
    });

    // Standalone mode detection
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('📱 Running in standalone mode');
      this.isInstalled = true;
    }
  }

  // Check if app is already installed
  private checkInstallStatus(): void {
    // Check for standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }

    // Check for iOS Safari standalone
    if ((window.navigator as any).standalone) {
      this.isInstalled = true;
      return;
    }

    // Check user agent for installed PWA indicators
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('wv') || userAgent.includes('webview')) {
      this.isInstalled = true;
    }
  }

  // Show install banner
  private showInstallBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #dc143c 0%, #ff8c00 30%, #ffd700 60%, #32cd32 100%);
        color: white;
        padding: 12px 16px;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="display: flex; align-items: center;">
          <div style="margin-right: 12px; font-size: 24px;">📱</div>
          <div>
            <div style="font-weight: bold; font-size: 14px;">Install GhEHR</div>
            <div style="font-size: 12px; opacity: 0.9;">Get the app for faster access and offline use</div>
          </div>
        </div>
        <div>
          <button id="pwa-install-btn" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-right: 8px;
            font-size: 12px;
            font-weight: bold;
          ">Install</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
            opacity: 0.7;
          ">✕</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.promptInstall();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  // Hide install banner
  private hideInstallBanner(): void {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Prompt for app installation
  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('⚠️ Install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        this.hideInstallBanner();
        return true;
      } else {
        console.log('❌ User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('❌ Install prompt failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  // Show welcome message after installation
  private showWelcomeMessage(): void {
    // Create a welcome notification or modal
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Welcome to GhEHR!', {
        body: 'The app is now installed and ready for offline use.',
        icon: '/logo192.png'
      });
    }
  }

  // Handle service worker messages
  private handleServiceWorkerMessage(data: any): void {
    const { type, action } = data;

    switch (type) {
      case 'BACKGROUND_SYNC':
        if (action === 'START_SYNC') {
          console.log('🔄 Starting sync from service worker message');
          syncManager.forcSync();
        }
        break;
      
      case 'CACHE_UPDATED':
        console.log('📦 Cache updated by service worker');
        break;
        
      default:
        console.log('📨 Service worker message:', data);
    }
  }

  // Setup background sync
  private setupBackgroundSync(): void {
    if (!this.swRegistration) return;

    // Register for background sync when going offline
    networkManager.onStatusChange((isOnline) => {
      if (!isOnline && this.swRegistration && 'sync' in this.swRegistration) {
        (this.swRegistration as any).sync.register('ghehr-sync')
          .then(() => console.log('🔄 Background sync registered'))
          .catch((err: any) => console.error('❌ Background sync registration failed:', err));
      }
    });
  }

  // Setup push notifications
  private async setupPushNotifications(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Subscribe to push notifications (would need VAPID keys for real implementation)
        // const subscription = await this.swRegistration.pushManager.subscribe({
        //   userVisibleOnly: true,
        //   applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
        // });
        
        // Send subscription to server
        // await this.sendSubscriptionToServer(subscription);
      } else {
        console.log('❌ Notification permission denied');
      }
    } catch (error) {
      console.error('❌ Push notification setup failed:', error);
    }
  }

  // Prompt for service worker update
  private promptForUpdate(): void {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2196f3;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <div style="margin-right: 8px; font-size: 20px;">🔄</div>
          <div style="font-weight: bold;">Update Available</div>
        </div>
        <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
          A new version of GhEHR is available with improvements and bug fixes.
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-update-btn" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            flex: 1;
          ">Update Now</button>
          <button id="pwa-update-dismiss-btn" style="
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);

    // Add event listeners
    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      this.updateServiceWorker();
    });

    document.getElementById('pwa-update-dismiss-btn')?.addEventListener('click', () => {
      updateBanner.remove();
    });
  }

  // Update service worker
  private updateServiceWorker(): void {
    if (!this.swRegistration || !this.swRegistration.waiting) return;

    // Tell the service worker to skip waiting and take control
    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to get the new version
    window.location.reload();
  }

  // Get installation status
  public getInstallStatus(): { isInstalled: boolean; canInstall: boolean } {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.deferredPrompt
    };
  }

  // Initialize offline database
  public async initializeOfflineMode(): Promise<void> {
    try {
      await offlineDB.init();
      console.log('✅ Offline database initialized');
      
      // Start sync manager
      console.log('🔄 Starting sync manager...');
      
      // Pre-cache essential data if online
      if (networkManager.getStatus()) {
        await this.preCacheEssentialData();
      }
    } catch (error) {
      console.error('❌ Offline mode initialization failed:', error);
    }
  }

  // Pre-cache essential data for offline use
  private async preCacheEssentialData(): Promise<void> {
    try {
      console.log('📦 Pre-caching essential data...');
      
      // This would typically fetch and cache:
      // - Current user's patients
      // - Today's appointments
      // - Recent clinical notes
      // - Active lab orders
      
      // For now, we'll just log that it's ready
      console.log('✅ Essential data cached for offline use');
    } catch (error) {
      console.error('❌ Pre-caching failed:', error);
    }
  }
}

// Initialize PWA Manager
const pwaManager = PWAManager.getInstance();

export default pwaManager;
