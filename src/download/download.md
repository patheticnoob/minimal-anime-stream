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
6. **`src/download/DownloadButton.tsx`** - React component with progress UI
7. **`src/download/DownloadManager.tsx`** - Download queue management UI (optional)

### Integration Points
- **Watch.tsx**: Replaced `EpisodeDownloadButton` with new `DownloadButton`
- **main.tsx**: Added Service Worker registration on app load

## Implementation Logic

### 1. Service Worker (`public/download-sw.js`)
- Intercepts HLS segment requests (`.ts` files)
- Caches segments in Cache API
- Responds with cached segments when available
- Tracks download progress via postMessage

### 2. Download Orchestrator (`download-orchestrator.ts`)
- Manages download queue (max 3 parallel downloads)
- Fetches HLS manifest and parses segment URLs
- Downloads segments sequentially per episode
- Emits progress events (0-100%)
- Stores metadata in IndexedDB

### 3. Download Storage (`download-storage.ts`)
- Uses IndexedDB for persistent metadata
- Stores: episodeId, progress, status, segmentCount, downloadedAt
- Provides CRUD operations for download records

### 4. Service Worker Manager (`service-worker-manager.ts`)
- Registers Service Worker on app load
- Provides communication channel to SW
- Handles SW lifecycle events
- Exposes download control methods

### 5. Download Button Component (`DownloadButton.tsx`)
- Shows download/downloading/cached states
- Displays progress percentage during download
- Allows cancellation and deletion
- Integrates with download orchestrator

## Usage

### In Watch.tsx
