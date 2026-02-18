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

  // Initialize IMA SDK
  useEffect(() => {
    if (!videoElement || !window.google?.ima) {
      console.log('⏳ Waiting for IMA SDK or video element...');
      return;
    }

    try {
      // Create ad display container
      const adDisplayContainer = new window.google.ima.AdDisplayContainer(
        document.getElementById('ad-container'),
        videoElement
      );
      adDisplayContainerRef.current = adDisplayContainer;

      // Create ads loader
      const adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);
      adsLoaderRef.current = adsLoader;

      // Add event listeners
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

    try {
      // Initialize ad display container
      adDisplayContainerRef.current.initialize();

      // Create ads request
      const adsRequest = new window.google.ima.AdsRequest();
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
      if (!window.google || !window.google.ima) {
        console.warn('Google IMA SDK not loaded');
        return;
      }
      
      const google = window.google;
      // At this point, google and google.ima are guaranteed to exist
      const adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      const adsManager = adsManagerLoadedEvent.getAdsManager(
        videoElement,
        adsRenderingSettings
      );
      adsManagerRef.current = adsManager;

      // Add event listeners
      adsManager.addEventListener(
        window.google!.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError
      );
      adsManager.addEventListener(
        window.google!.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested
      );
      adsManager.addEventListener(
        window.google!.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested
      );
      adsManager.addEventListener(
        window.google!.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAdComplete
      );

      // Initialize and start ads
      adsManager.init(
        videoElement?.clientWidth || 640,
        videoElement?.clientHeight || 360,
        window.google!.ima.ViewMode.NORMAL
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
