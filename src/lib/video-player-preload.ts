/**
 * Video Player Preloader
 * Preloads the video player component and caches it in memory for faster loading
 */

const PRELOAD_CACHE_KEY = 'videoPlayerPreloaded';
const PRELOAD_TIMESTAMP_KEY = 'videoPlayerPreloadTimestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let preloadedComponent: any = null;
let isPreloading = false;

/**
 * Check if the video player component is already cached
 */
export function isVideoPlayerCached(): boolean {
  try {
    const timestamp = localStorage.getItem(PRELOAD_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const age = Date.now() - parseInt(timestamp, 10);
    return age < CACHE_DURATION;
  } catch {
    return false;
  }
}

/**
 * Preload the video player component in the background
 */
export async function preloadVideoPlayer(): Promise<void> {
  // Avoid duplicate preload attempts
  if (isPreloading || preloadedComponent) {
    return;
  }

  // Check if already cached and fresh
  if (isVideoPlayerCached()) {
    return;
  }

  try {
    isPreloading = true;

    // Dynamically import the video player component
    const [NothingVideoPlayerV2Module, hlsModule] = await Promise.all([
      import('@/themes/nothing/components/NothingVideoPlayerV2'),
      import('hls.js'),
    ]);

    preloadedComponent = {
      NothingVideoPlayerV2: NothingVideoPlayerV2Module.NothingVideoPlayerV2,
      Hls: hlsModule.default,
    };

    // Mark as cached in localStorage
    localStorage.setItem(PRELOAD_CACHE_KEY, 'true');
    localStorage.setItem(PRELOAD_TIMESTAMP_KEY, Date.now().toString());

    console.log('[VideoPlayerPreload] Video player preloaded successfully');
  } catch (error) {
    console.error('[VideoPlayerPreload] Failed to preload video player:', error);
  } finally {
    isPreloading = false;
  }
}

/**
 * Get the preloaded video player component
 */
export function getPreloadedVideoPlayer() {
  return preloadedComponent;
}

/**
 * Clear the preload cache
 */
export function clearVideoPlayerCache(): void {
  try {
    localStorage.removeItem(PRELOAD_CACHE_KEY);
    localStorage.removeItem(PRELOAD_TIMESTAMP_KEY);
    preloadedComponent = null;
    console.log('[VideoPlayerPreload] Cache cleared');
  } catch (error) {
    console.error('[VideoPlayerPreload] Failed to clear cache:', error);
  }
}

/**
 * Initialize preloading on app start
 * Call this early in the app lifecycle
 */
export function initVideoPlayerPreload(): void {
  // Only preload in browser environment
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(
      () => {
        preloadVideoPlayer();
      },
      { timeout: 3000 }
    );
  } else {
    setTimeout(() => {
      preloadVideoPlayer();
    }, 2000);
  }
}
