/**
 * Episode Download Manager
 * Handles downloading and caching episodes using localStorage
 * This is an experimental feature that can be easily removed
 */

export interface DownloadedEpisode {
  episodeId: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  tracks: Array<{ file: string; label: string; kind?: string }>;
  downloadedAt: number;
  size?: number;
}

const STORAGE_KEY_PREFIX = 'episode_download_';
const DOWNLOADS_INDEX_KEY = 'episode_downloads_index';

export class EpisodeDownloadManager {
  /**
   * Get all downloaded episodes index
   */
  static getDownloadsIndex(): string[] {
    try {
      const index = localStorage.getItem(DOWNLOADS_INDEX_KEY);
      return index ? JSON.parse(index) : [];
    } catch (error) {
      console.error('Failed to get downloads index:', error);
      return [];
    }
  }

  /**
   * Update downloads index
   */
  private static updateDownloadsIndex(episodeId: string, remove = false): void {
    try {
      let index = this.getDownloadsIndex();
      
      if (remove) {
        index = index.filter(id => id !== episodeId);
      } else if (!index.includes(episodeId)) {
        index.push(episodeId);
      }
      
      localStorage.setItem(DOWNLOADS_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update downloads index:', error);
    }
  }

  /**
   * Check if an episode is downloaded
   */
  static isDownloaded(episodeId: string): boolean {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${episodeId}`) !== null;
  }

  /**
   * Get a downloaded episode
   */
  static getDownload(episodeId: string): DownloadedEpisode | null {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${episodeId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get download:', error);
      return null;
    }
  }

  /**
   * Save an episode download
   */
  static async saveDownload(episode: DownloadedEpisode): Promise<boolean> {
    try {
      const data = JSON.stringify(episode);
      
      // Check localStorage space (rough estimate)
      const estimatedSize = new Blob([data]).size;
      
      // Try to save
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${episode.episodeId}`, data);
      this.updateDownloadsIndex(episode.episodeId);
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please delete some downloads.');
        return false;
      }
      console.error('Failed to save download:', error);
      return false;
    }
  }

  /**
   * Delete a downloaded episode
   */
  static deleteDownload(episodeId: string): boolean {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${episodeId}`);
      this.updateDownloadsIndex(episodeId, true);
      return true;
    } catch (error) {
      console.error('Failed to delete download:', error);
      return false;
    }
  }

  /**
   * Get all downloaded episodes
   */
  static getAllDownloads(): DownloadedEpisode[] {
    const index = this.getDownloadsIndex();
    const downloads: DownloadedEpisode[] = [];
    
    for (const episodeId of index) {
      const download = this.getDownload(episodeId);
      if (download) {
        downloads.push(download);
      }
    }
    
    return downloads.sort((a, b) => b.downloadedAt - a.downloadedAt);
  }

  /**
   * Get total storage used (approximate)
   */
  static getStorageUsed(): number {
    let total = 0;
    const index = this.getDownloadsIndex();
    
    for (const episodeId of index) {
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${episodeId}`);
      if (data) {
        total += new Blob([data]).size;
      }
    }
    
    return total;
  }

  /**
   * Clear all downloads
   */
  static clearAllDownloads(): boolean {
    try {
      const index = this.getDownloadsIndex();
      
      for (const episodeId of index) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${episodeId}`);
      }
      
      localStorage.removeItem(DOWNLOADS_INDEX_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear downloads:', error);
      return false;
    }
  }

  /**
   * Format bytes to human readable
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
