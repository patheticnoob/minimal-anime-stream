import { useEffect, useRef, useState } from 'react';

interface UseVideoAdsProps {
  videoElement: HTMLVideoElement | null;
  adTagUrl: string;
  onAdStart?: () => void;
  onAdComplete?: () => void;
  onAdError?: (error: any) => void;
}

export function useVideoAds({
  videoElement,
  adTagUrl,
  onAdStart,
  onAdComplete,
  onAdError,
}: UseVideoAdsProps) {
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const adsManagerRef = useRef<any>(null);
  const adsLoaderRef = useRef<any>(null);
  const adDisplayContainerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoElement || !adTagUrl) return;

    // Check if IMA SDK is loaded
    if (!window.google?.ima) {
      console.warn('Google IMA SDK not loaded');
      return;
    }

    const google = window.google;

    const initializeAds = () => {
      try {
        const adDisplayContainer = new google.ima.AdDisplayContainer(
          document.getElementById('ad-container'),
          videoElement
        );
        adDisplayContainerRef.current = adDisplayContainer;

        const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
        adsLoaderRef.current = adsLoader;

        adsLoader.addEventListener(
          google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          onAdsManagerLoaded,
          false
        );
        adsLoader.addEventListener(
          google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdErrorEvent,
          false
        );

        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = adTagUrl;
        adsRequest.linearAdSlotWidth = videoElement.clientWidth;
        adsRequest.linearAdSlotHeight = videoElement.clientHeight;
        adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
        adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

        adsLoader.requestAds(adsRequest);
      } catch (error) {
        console.error('Error initializing ads:', error);
        onAdError?.(error);
      }
    };

    const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
      const adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      const adsManager = adsManagerLoadedEvent.getAdsManager(
        videoElement,
        adsRenderingSettings
      );
      adsManagerRef.current = adsManager;

      adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdErrorEvent
      );
      adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested
      );
      adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested
      );
      adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAdEvent
      );

      try {
        adsManager.init(
          videoElement.clientWidth,
          videoElement.clientHeight,
          google.ima.ViewMode.NORMAL
        );
        adsManager.start();
        setAdsLoaded(true);
      } catch (adError) {
        console.error('AdsManager could not be started:', adError);
        videoElement.play();
      }
    };

    const onAdErrorEvent = (adErrorEvent: any) => {
      console.error('Ad error:', adErrorEvent.getError());
      onAdError?.(adErrorEvent.getError());
      if (adsManagerRef.current) {
        adsManagerRef.current.destroy();
      }
      videoElement.play();
    };

    const onContentPauseRequested = () => {
      videoElement.pause();
      setAdPlaying(true);
      onAdStart?.();
    };

    const onContentResumeRequested = () => {
      setAdPlaying(false);
      onAdComplete?.();
      videoElement.play();
    };

    const onAdEvent = (adEvent: any) => {
      const ad = adEvent.getAd();
      if (ad && !ad.isLinear()) {
        videoElement.play();
      }
    };

    // Initialize ads when video is ready
    if (videoElement.readyState >= 2) {
      initializeAds();
    } else {
      videoElement.addEventListener('loadedmetadata', initializeAds, { once: true });
    }

    return () => {
      if (adsManagerRef.current) {
        adsManagerRef.current.destroy();
      }
      if (adsLoaderRef.current) {
        adsLoaderRef.current.destroy();
      }
    };
  }, [videoElement, adTagUrl, onAdStart, onAdComplete, onAdError]);

  const playAds = () => {
    if (adDisplayContainerRef.current) {
      adDisplayContainerRef.current.initialize();
    }
  };

  return {
    adsLoaded,
    adPlaying,
    playAds,
  };
}
