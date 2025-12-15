/**
 * Download Orchestrator - Manages download queue and progress tracking
 */

import { serviceWorkerManager } from './service-worker-manager';
import { downloadStorage } from './download-storage';
import type { DownloadMetadata, DownloadProgressEvent } from './types';

class DownloadOrchestrator {
  private activeDownloads: Map<string, AbortController> = new Map();
  private downloadQueue: string[] = [];
  private maxParallelDownloads = 3;
  private progressCallbacks: Map<string, Set<(progress: DownloadProgressEvent) => void>> = new Map();

  async startDownload(
    episodeId: string,
    animeId: string,
    episodeNumber: number,
    title: string,
    videoUrl: string
  ): Promise<void> {
    // Check if already downloading
    if (this.activeDownloads.has(episodeId)) {
      console.log('Episode already downloading:', episodeId);
      return;
    }

    // Check if already downloaded
    const existing = await downloadStorage.getDownload(episodeId);
    if (existing && existing.status === 'completed') {
      console.log('Episode already downloaded:', episodeId);
      return;
    }

    // Create metadata
    const metadata: DownloadMetadata = {
      episodeId,
      animeId,
      episodeNumber,
      title,
      videoUrl,
      status: 'pending',
      progress: 0,
      segmentCount: 0,
      downloadedSegments: 0,
      startedAt: Date.now(),
    };

    await downloadStorage.saveDownload(metadata);

    // Add to queue
    this.downloadQueue.push(episodeId);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    // Check if we can start more downloads
    while (
      this.activeDownloads.size < this.maxParallelDownloads &&
      this.downloadQueue.length > 0
    ) {
      const episodeId = this.downloadQueue.shift();
      if (!episodeId) continue;

      const metadata = await downloadStorage.getDownload(episodeId);
      if (!metadata) continue;

      this.executeDownload(metadata);
    }
  }

  private async executeDownload(metadata: DownloadMetadata): Promise<void> {
    const { episodeId, videoUrl } = metadata;
    const abortController = new AbortController();
    this.activeDownloads.set(episodeId, abortController);

    try {
      // Update status to downloading
      await downloadStorage.updateStatus(episodeId, 'downloading');
      this.emitProgress(episodeId, { 
        episodeId, 
        progress: 0, 
        downloadedSegments: 0, 
        totalSegments: 0,
        downloadedSize: 0
      });

      // Fetch the m3u8 manifest
      const manifestResponse = await fetch(videoUrl, { signal: abortController.signal });
      const manifestText = await manifestResponse.text();

      // Parse segment URLs from manifest
      const segments = this.parseM3U8(manifestText, videoUrl);
      
      if (segments.length === 0) {
        throw new Error('No segments found in manifest');
      }

      // Update segment count
      await downloadStorage.saveDownload({
        ...metadata,
        segmentCount: segments.length,
        status: 'downloading',
      });

      // Download segments sequentially
      let downloadedSegments = 0;
      let downloadedSize = 0;

      for (const segmentUrl of segments) {
        if (abortController.signal.aborted) {
          throw new Error('Download cancelled');
        }

        try {
          // Fetch segment through our proxy (which will be cached by SW)
          const response = await fetch(segmentUrl, { signal: abortController.signal });
          const blob = await response.blob();
          downloadedSize += blob.size;
          downloadedSegments++;

          const progress = (downloadedSegments / segments.length) * 100;

          // Update progress
          await downloadStorage.updateProgress(episodeId, progress, downloadedSegments);
          
          this.emitProgress(episodeId, {
            episodeId,
            progress,
            downloadedSegments,
            totalSegments: segments.length,
            downloadedSize,
            totalSize: downloadedSize * (segments.length / downloadedSegments),
          });

          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          if (abortController.signal.aborted) {
            throw new Error('Download cancelled');
          }
          console.warn('Failed to download segment:', segmentUrl, err);
          // Continue with next segment
        }
      }

      // Mark as completed
      await downloadStorage.updateStatus(episodeId, 'completed');
      this.emitProgress(episodeId, {
        episodeId,
        progress: 100,
        downloadedSegments: segments.length,
        totalSegments: segments.length,
        downloadedSize,
      });

      console.log('✅ Download completed:', episodeId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      await downloadStorage.updateStatus(episodeId, 'failed', errorMessage);
      console.error('❌ Download failed:', episodeId, error);
    } finally {
      this.activeDownloads.delete(episodeId);
      this.processQueue(); // Process next in queue
    }
  }

  private parseM3U8(manifestText: string, baseUrl: string): string[] {
    const lines = manifestText.split('\n');
    const segments: string[] = [];
    const baseUrlObj = new URL(baseUrl);
    const basePath = baseUrlObj.pathname.substring(0, baseUrlObj.pathname.lastIndexOf('/') + 1);

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        // Resolve relative URLs
        let segmentUrl = trimmed;
        if (!segmentUrl.startsWith('http')) {
          segmentUrl = `${baseUrlObj.origin}${basePath}${segmentUrl}`;
        }
        
        // Proxy the segment URL
        const raw = import.meta.env.VITE_CONVEX_URL as string;
        let base = raw;
        try {
          const u = new URL(raw);
          const hostname = u.hostname.replace('.convex.cloud', '.convex.site');
          base = `${u.protocol}//${hostname}`;
        } catch {
          base = raw.replace('convex.cloud', 'convex.site');
        }
        base = base.replace('/.well-known/convex.json', '').replace(/\/$/, '');
        
        const proxiedUrl = `${base}/proxy?url=${encodeURIComponent(segmentUrl)}`;
        segments.push(proxiedUrl);
      }
    }

    return segments;
  }

  async cancelDownload(episodeId: string): Promise<void> {
    const controller = this.activeDownloads.get(episodeId);
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(episodeId);
    }

    // Remove from queue
    const queueIndex = this.downloadQueue.indexOf(episodeId);
    if (queueIndex !== -1) {
      this.downloadQueue.splice(queueIndex, 1);
    }

    await downloadStorage.updateStatus(episodeId, 'cancelled');
    this.processQueue();
  }

  async deleteDownload(episodeId: string): Promise<void> {
    await this.cancelDownload(episodeId);
    await downloadStorage.deleteDownload(episodeId);
    await serviceWorkerManager.clearEpisodeCache(episodeId);
  }

  onProgress(episodeId: string, callback: (progress: DownloadProgressEvent) => void): () => void {
    if (!this.progressCallbacks.has(episodeId)) {
      this.progressCallbacks.set(episodeId, new Set());
    }
    this.progressCallbacks.get(episodeId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.progressCallbacks.get(episodeId);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private emitProgress(episodeId: string, progress: DownloadProgressEvent): void {
    const callbacks = this.progressCallbacks.get(episodeId);
    if (callbacks) {
      callbacks.forEach(callback => callback(progress));
    }
  }

  async getDownloadStatus(episodeId: string): Promise<DownloadMetadata | null> {
    return await downloadStorage.getDownload(episodeId);
  }

  async getAllDownloads(): Promise<DownloadMetadata[]> {
    return await downloadStorage.getAllDownloads();
  }

  isDownloading(episodeId: string): boolean {
    return this.activeDownloads.has(episodeId);
  }
}

export const downloadOrchestrator = new DownloadOrchestrator();
