/**
 * TypeScript types for the download system
 */

export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';

export interface DownloadMetadata {
  episodeId: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  status: DownloadStatus;
  progress: number; // 0-100
  segmentCount: number;
  downloadedSegments: number;
  totalSize?: number;
  downloadedSize?: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export interface DownloadProgressEvent {
  episodeId: string;
  progress: number;
  downloadedSegments: number;
  totalSegments: number;
  downloadedSize: number;
  totalSize?: number;
}

export interface ServiceWorkerMessage {
  type: 'CACHE_SEGMENT' | 'DOWNLOAD_PROGRESS' | 'DOWNLOAD_COMPLETE' | 'DOWNLOAD_ERROR';
  episodeId: string;
  data?: any;
}

export interface HLSManifest {
  segments: string[];
  duration: number;
  baseUrl: string;
}
