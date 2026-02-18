import { useEffect, useRef, useState } from 'react';

interface UseVideoAdsProps {
  videoElement: HTMLVideoElement | null;
  adTagUrl: string;
  shouldTrigger: boolean; // When skip intro button appears
  triggerDelay?: number; // Delay in ms after shouldTrigger becomes true
}

export function useVideoAds({
  videoElement,
  adTagUrl,
  shouldTrigger,
  triggerDelay = 3000,
}: UseVideoAdsProps) {
  const adDisplayContainerRef = useRef<any>(null);
  const adsLoaderRef = useRef<any>(null);
  const adsManagerRef = useRef<any>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const hasTriggeredRef = useRef(false);
  const triggerTimeoutRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);

  const initializeAdDisplay = () => {
    if (!adDisplayContainerRef.current || hasInitializedRef.current) return;
    try {
      adDisplayContainerRef.current.initialize();
      hasInitializedRef.current = true;
      console.log('✅ Ad display container initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ad display container:', error);
    }
  };

  useEffect(() => {
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
      adContainer.style.display = 'block';
      adContainer.style.opacity = isAdPlaying ? '1' : '0';
      adContainer.style.pointerEvents = isAdPlaying ? 'auto' : 'none';
    }
  }, [isAdPlaying]);

  useEffect(() => {
    if (!videoElement) return;

    const handleUserGesture = () => initializeAdDisplay();

    videoElement.addEventListener('play', handleUserGesture);
    videoElement.addEventListener('click', handleUserGesture);
    videoElement.addEventListener('touchstart', handleUserGesture);

    return () => {
      videoElement.removeEventListener('play', handleUserGesture);
      videoElement.removeEventListener('click', handleUserGesture);
      videoElement.removeEventListener('touchstart', handleUserGesture);
    };
  }, [videoElement]);

  // Initialize IMA SDK
  useEffect(() => {
    if (!videoElement || !window.google?.ima) {
      console.log('⏳ Waiting for IMA SDK or video element...');
      return;
    }

    try {
      const adContainer = document.getElementById('ad-container');
      if (!adContainer) {
        console.warn('❌ Ad container not found');
        return;
      }

      const adDisplayContainer = new window.google.ima.AdDisplayContainer(
        adContainer,
        videoElement
      );
      adDisplayContainerRef.current = adDisplayContainer;

      const adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);
      adsLoaderRef.current = adsLoader;

      adsLoader.addEventListener(
        window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded,
        false
      );
      adsLoader.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false
      );

      console.log('✅ IMA SDK initialized');
    } catch (error) {
      console.error('❌ Error initializing IMA SDK:', error);
    }

    return () => {
      if (adsManagerRef.current) {
        adsManagerRef.current.destroy();
      }
      if (adsLoaderRef.current) {
        adsLoaderRef.current.destroy();
      }
    };
  }, [videoElement]);

  // Trigger ad when skip intro appears (with delay)
  useEffect(() => {
    if (!shouldTrigger || hasTriggeredRef.current || !adsLoaderRef.current) {
      return;
    }

    console.log(`⏰ Skip intro detected, triggering ad in ${triggerDelay}ms...`);

    triggerTimeoutRef.current = window.setTimeout(() => {
      requestAd();
      hasTriggeredRef.current = true;
    }, triggerDelay);

    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, [shouldTrigger, triggerDelay]);

  const requestAd = () => {
    if (!adsLoaderRef.current || !adDisplayContainerRef.current) {
      console.error('❌ Ads loader or display container not ready');
      return;
    }

    const google = window.google;
    if (!google || !google.ima) {
      console.warn('Google IMA SDK not loaded');
      return;
    }

    try {
      initializeAdDisplay();

      const adsRequest = new google.ima.AdsRequest();
      adsRequest.adTagUrl = adTagUrl;
      adsRequest.linearAdSlotWidth = videoElement?.clientWidth || 640;
      adsRequest.linearAdSlotHeight = videoElement?.clientHeight || 360;
      adsRequest.nonLinearAdSlotWidth = videoElement?.clientWidth || 640;
      adsRequest.nonLinearAdSlotHeight = 150;

      console.log('📺 Requesting ad with VAST tag:', adTagUrl);
      adsLoaderRef.current.requestAds(adsRequest);
    } catch (error) {
      console.error('❌ Error requesting ads:', error);
    }
  };

  const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
    try {
      const google = window.google;
      if (!google || !google.ima) {
        console.warn('Google IMA SDK not loaded');
        return;
      }

      const ima = google.ima;
      const adsRenderingSettings = new ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      const adsManager = adsManagerLoadedEvent.getAdsManager(
        videoElement,
        adsRenderingSettings
      );
      adsManagerRef.current = adsManager;

      // Add event listeners
      adsManager.addEventListener(
        ima.AdErrorEvent.Type.AD_ERROR,
        onAdError
      );
      adsManager.addEventListener(
        ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested
      );
      adsManager.addEventListener(
        ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested
      );
      adsManager.addEventListener(
        ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAdComplete
      );

      // Initialize and start ads
      adsManager.init(
        videoElement?.clientWidth || 640,
        videoElement?.clientHeight || 360,
        ima.ViewMode.NORMAL
      );
      adsManager.start();

      console.log('✅ Ads manager loaded and started');
    } catch (error) {
      console.error('❌ Error loading ads manager:', error);
      onAdError();
    }
  };

  const onContentPauseRequested = () => {
    console.log('⏸️ Content paused for ad');
    videoElement?.pause();
    setIsAdPlaying(true);
  };

  const onContentResumeRequested = () => {
    console.log('▶️ Content resumed after ad');
    setIsAdPlaying(false);
    videoElement?.play();
  };

  const onAdComplete = () => {
    console.log('✅ All ads completed');
    setIsAdPlaying(false);
  };

  const onAdError = (adErrorEvent?: any) => {
    console.error('❌ Ad error:', adErrorEvent?.getError?.());
    setIsAdPlaying(false);
    if (adsManagerRef.current) {
      adsManagerRef.current.destroy();
    }
    // Resume content on error
    videoElement?.play();
  };

  return {
    isAdPlaying,
  };
}