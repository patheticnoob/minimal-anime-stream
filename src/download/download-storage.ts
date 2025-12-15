/**
 * IndexedDB storage for download metadata
 */

import type { DownloadMetadata, DownloadStatus } from './types';

const DB_NAME = 'episode-downloads';
const DB_VERSION = 1;
const STORE_NAME = 'downloads';

class DownloadStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'episodeId' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('animeId', 'animeId', { unique: false });
        }
      };
    });
  }

  async saveDownload(metadata: DownloadMetadata): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(metadata);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDownload(episodeId: string): Promise<DownloadMetadata | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(episodeId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDownloads(): Promise<DownloadMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDownload(episodeId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(episodeId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateProgress(episodeId: string, progress: number, downloadedSegments: number): Promise<void> {
    const download = await this.getDownload(episodeId);
    if (!download) return;

    download.progress = progress;
    download.downloadedSegments = downloadedSegments;
    
    if (progress >= 100) {
      download.status = 'completed';
      download.completedAt = Date.now();
    }

    await this.saveDownload(download);
  }

  async updateStatus(episodeId: string, status: DownloadStatus, error?: string): Promise<void> {
    const download = await this.getDownload(episodeId);
    if (!download) return;

    download.status = status;
    if (error) download.error = error;
    if (status === 'completed') download.completedAt = Date.now();

    await this.saveDownload(download);
  }

  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const downloadStorage = new DownloadStorage();
