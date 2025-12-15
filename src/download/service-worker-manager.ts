/**
 * Service Worker registration and communication manager
 */

import type { ServiceWorkerMessage } from './types';

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();

  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/download-sw.js', {
        scope: '/',
      });

      console.log('✅ Download Service Worker registered');

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });

      // Wait for SW to be active
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const success = await this.registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
      return false;
    }
  }

  on(eventType: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType)!.add(handler);
  }

  off(eventType: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private handleMessage(message: ServiceWorkerMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }

  async sendMessage(message: any): Promise<any> {
    if (!this.registration || !this.registration.active) {
      throw new Error('Service Worker not active');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      this.registration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }

  async clearEpisodeCache(episodeId: string): Promise<boolean> {
    try {
      const result = await this.sendMessage({
        type: 'CLEAR_CACHE',
        episodeId,
      });
      return result.success;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  async getCacheSize(episodeId: string): Promise<number> {
    try {
      const result = await this.sendMessage({
        type: 'GET_CACHE_SIZE',
        episodeId,
      });
      return result.size || 0;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  async clearAllCaches(): Promise<boolean> {
    try {
      const result = await this.sendMessage({
        type: 'CLEAR_ALL_CACHES',
      });
      return result.success;
    } catch (error) {
      console.error('Failed to clear all caches:', error);
      return false;
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  isRegistered(): boolean {
    return this.registration !== null;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register on import
export async function registerDownloadServiceWorker(): Promise<boolean> {
  return await serviceWorkerManager.register();
}
