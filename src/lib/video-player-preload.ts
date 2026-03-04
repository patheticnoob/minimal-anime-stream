/**
 * Video Player Preloader
 * Preloads the video player component and caches it in memory for faster loading
 */

const PRELOAD_CACHE_KEY = 'videoPlayerPreloaded';
const PRELOAD_TIMESTAMP_KEY = 'videoPlayerPreloadTimestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let preloadedComponent: any = null;
let isPreloading = false;
let prerenderedContainer: HTMLDivElement | null = null;

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

    // Dynamically import the video player component and all dependencies
    const [
      NothingVideoPlayerV2Module,
      hlsModule,
      NothingPlayerControlsModule,
      NothingPlayerOverlayModule,
      NothingGestureOverlayModule,
      NothingPlayerGesturesModule,
    ] = await Promise.all([
      import('@/themes/nothing/components/NothingVideoPlayerV2'),
      import('hls.js'),
      import('@/themes/nothing/components/NothingPlayerControls'),
      import('@/themes/nothing/components/NothingPlayerOverlay'),
      import('@/themes/nothing/components/NothingGestureOverlay'),
      import('@/themes/nothing/components/NothingPlayerGestures'),
    ]);

    preloadedComponent = {
      NothingVideoPlayerV2: NothingVideoPlayerV2Module.NothingVideoPlayerV2,
      Hls: hlsModule.default,
      NothingPlayerControls: NothingPlayerControlsModule.NothingPlayerControls,
      NothingPlayerOverlay: NothingPlayerOverlayModule.NothingPlayerOverlay,
      NothingGestureOverlay: NothingGestureOverlayModule.NothingGestureOverlay,
      usePlayerGestures: NothingPlayerGesturesModule.usePlayerGestures,
    };

    // Mark as cached in localStorage
    localStorage.setItem(PRELOAD_CACHE_KEY, 'true');
    localStorage.setItem(PRELOAD_TIMESTAMP_KEY, Date.now().toString());

    console.log('[VideoPlayerPreload] Video player and all dependencies preloaded successfully');
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
 * Create an invisible prerendered video player container
 * This pre-renders the video player structure in the DOM for instant display
 */
export function prerenderVideoPlayerContainer(): void {
  // Only in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Avoid duplicate prerenders
  if (prerenderedContainer) return;

  try {
    // Create a hidden container
    prerenderedContainer = document.createElement('div');
    prerenderedContainer.id = 'video-player-prerender';
    prerenderedContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1920px;
      height: 1080px;
      pointer-events: none;
      visibility: hidden;
      opacity: 0;
      z-index: -9999;
    `;

    // Create the basic video player structure
    prerenderedContainer.innerHTML = `
      <div class="relative w-full h-full bg-black">
        <video class="w-full h-full" preload="none"></video>
        <div class="absolute inset-0 pointer-events-none"></div>
      </div>
    `;

    document.body.appendChild(prerenderedContainer);
    console.log('[VideoPlayerPreload] Video player container prerendered');
  } catch (error) {
    console.error('[VideoPlayerPreload] Failed to prerender container:', error);
  }
}

/**
 * Remove the prerendered container
 */
export function removePrerenderContainer(): void {
  if (prerenderedContainer && prerenderedContainer.parentNode) {
    prerenderedContainer.parentNode.removeChild(prerenderedContainer);
    prerenderedContainer = null;
  }
}

/**
 * Clear the preload cache
 */
export function clearVideoPlayerCache(): void {
  try {
    localStorage.removeItem(PRELOAD_CACHE_KEY);
    localStorage.removeItem(PRELOAD_TIMESTAMP_KEY);
    preloadedComponent = null;
    removePrerenderContainer();
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
      async () => {
        await preloadVideoPlayer();
        // After components are loaded, prerender the container
        prerenderVideoPlayerContainer();
      },
      { timeout: 3000 }
    );
  } else {
    setTimeout(async () => {
      await preloadVideoPlayer();
      // After components are loaded, prerender the container
      prerenderVideoPlayerContainer();
    }, 2000);
  }
}

/**
 * Preload video player on homepage when user is viewing content
 * This ensures instant loading when user clicks on any episode
 */
export function preloadOnHomepage(): void {
  // Only in browser
  if (typeof window === 'undefined') return;

  // If already preloaded, just ensure container is rendered
  if (preloadedComponent) {
    prerenderVideoPlayerContainer();
    return;
  }

  // Otherwise trigger full preload
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(
      async () => {
        await preloadVideoPlayer();
        prerenderVideoPlayerContainer();
      },
      { timeout: 2000 }
    );
  } else {
    setTimeout(async () => {
      await preloadVideoPlayer();
      prerenderVideoPlayerContainer();
    }, 1000);
  }
}
