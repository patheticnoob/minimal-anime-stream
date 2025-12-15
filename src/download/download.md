# Episode Download System - Implementation Guide

## Overview
This is a Service Worker-based download system that enables background downloading of HLS video episodes with progress tracking and parallel download support.

## Features
- ✅ Background HLS segment downloading
- ✅ Real-time progress tracking (percentage)
- ✅ Parallel download queue (multiple episodes)
- ✅ Offline playback support
- ✅ Persistent cache across sessions
- ✅ Automatic cache management

## Architecture

### Files Created
1. **`public/download-sw.js`** - Service Worker for intercepting and caching video segments
2. **`src/download/service-worker-manager.ts`** - Service Worker registration and communication
3. **`src/download/download-orchestrator.ts`** - Download queue and progress management
4. **`src/download/download-storage.ts`** - IndexedDB storage for download metadata
5. **`src/download/types.ts`** - TypeScript types for download system
6. **`src/themes/nothing/components/EpisodeDownloadButton.tsx`** - React component with progress UI

### Integration Points
- **Watch.tsx**: Integrated `EpisodeDownloadButton` next to each episode
- **main.tsx**: Added Service Worker registration on app load

## Implementation Status

### ✅ Completed
- Service Worker setup and registration
- HLS segment interception and caching
- IndexedDB metadata storage
- Download orchestrator with queue management
- Progress tracking and callbacks
- Episode download button UI with status indicators
- Parallel download support (max 3 concurrent)
- Download cancellation and deletion

### 🔄 Current Functionality
1. **Download Button States:**
   - Gray download icon: Not downloaded
   - Blue spinner with percentage: Downloading
   - Green checkmark: Completed
   - Red X: Failed
   - Yellow pause: Cancelled

2. **Download Process:**
   - Click download → Fetches episode sources
   - Parses HLS manifest for segments
   - Downloads segments sequentially
   - Caches in Service Worker
   - Updates progress in real-time
   - Stores metadata in IndexedDB

3. **Offline Playback:**
   - Cached segments served by Service Worker
   - Works without internet connection
   - Automatic fallback to cache

## Usage

### In Watch.tsx

The `EpisodeDownloadButton` is integrated next to each episode in the episode list. It automatically:
- Checks download status on mount
- Subscribes to progress updates
- Handles download/cancel/delete actions
- Shows visual feedback for all states

### User Flow
1. Navigate to Watch page
2. Click download icon next to any episode
3. Button shows spinner with percentage
4. Download continues in background
5. Green checkmark appears when complete
6. Click checkmark to remove cached episode

## Technical Details

### Service Worker Caching
- Cache name format: `episode-{episodeId}`
- Intercepts requests to `/proxy?url=` containing `.ts` or `.m3u8`
- Serves from cache when available
- Falls back to network if cache miss

### Download Orchestrator
- Max 3 parallel downloads
- Sequential segment downloading per episode
- Abort controller for cancellation
- Progress callbacks for UI updates
- Automatic queue processing

### Storage
- **IndexedDB**: Download metadata (status, progress, timestamps)
- **Cache API**: Video segments (actual video data)
- **Persistent**: Survives page reloads and browser restarts

## Storage Limits

### Browser Storage Quotas
- **Chrome/Edge**: ~60% of available disk space
- **Firefox**: ~50% of available disk space
- **Safari**: ~1GB (may prompt user)

### Typical Episode Sizes
- 720p episode (24min): ~300-500 MB
- 1080p episode (24min): ~800-1200 MB

### Recommendations
- Monitor storage usage
- Implement cleanup for old downloads
- Warn users about storage limits

## Uninstall / Removal Instructions

To completely remove this download feature:

### 1. Delete Files