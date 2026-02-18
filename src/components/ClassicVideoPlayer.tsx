import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ClassicVideoPlayerProps {
  src: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  headers?: Record<string, string> | null;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  initialTime?: number;
  nextEpisodeTitle?: string;
  adTagUrl?: string;
}

declare global {
  interface Window {
    fluidPlayer?: any;
  }
}

export function ClassicVideoPlayer({
  src,
  tracks = [],
  intro,
  outro,
  onProgress,
  onEnded,
  initialTime = 0,
  adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpreonly&cmsid=496&vid=short_onecue&correlator=',
}: ClassicVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);

  // Initialize FluidPlayer
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Wait for FluidPlayer to be available
    const initPlayer = () => {
      if (!window.fluidPlayer) {
        console.warn('FluidPlayer not loaded yet, retrying...');
        setTimeout(initPlayer, 100);
        return;
      }

      try {
        // Destroy existing player instance
        if (playerInstanceRef.current) {
          try {
            playerInstanceRef.current.destroy();
          } catch (e) {
            console.warn('Error destroying previous player:', e);
          }
        }

        // Set video source
        video.src = src;

        // Initialize FluidPlayer with IMA ads
        const player = window.fluidPlayer(video, {
          layoutControls: {
            controlBar: {
              autoHideTimeout: 3,
              animated: true,
              autoHide: true,
            },
            autoPlay: false,
            mute: false,
            allowTheatre: true,
            playPauseAnimation: true,
            playbackRateEnabled: true,
            allowDownload: false,
            playButtonShowing: true,
            fillToContainer: true,
            primaryColor: '#8b5cf6',
          },
          vastOptions: {
            adList: [
              {
                roll: 'preRoll',
                vastTag: adTagUrl,
              },
            ],
            adCTAText: 'Visit Advertiser',
            adCTATextPosition: 'top right',
          },
        });

        playerInstanceRef.current = player;

        // Set initial time
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }

        // Add event listeners
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        toast.success('Player loaded successfully');
      } catch (error) {
        console.error('Error initializing FluidPlayer:', error);
        toast.error('Failed to initialize video player');
      }
    };

    initPlayer();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying player on cleanup:', e);
        }
      }
    };
  }, [src, adTagUrl, initialTime]);

  // Load subtitles
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Remove existing tracks
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    // Add new tracks
    tracks.forEach((track, index) => {
      const trackElement = document.createElement('track');
      trackElement.kind = (track.kind as TextTrackKind) || 'subtitles';
      trackElement.label = track.label;
      trackElement.src = track.file;
      trackElement.default = track.default || index === 0;
      video.appendChild(trackElement);
    });
  }, [tracks]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const duration = video.duration;

    // Check for skip intro/outro
    if (intro && current >= intro.start && current <= intro.end) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }

    if (outro && current >= outro.start && current <= outro.end) {
      setShowSkipOutro(true);
    } else {
      setShowSkipOutro(false);
    }

    // Save progress
    if (onProgress && duration > 0) {
      onProgress(current, duration);
    }
  }, [intro, outro, onProgress]);

  const handleEnded = useCallback(() => {
    if (onEnded) {
      onEnded();
    }
  }, [onEnded]);

  const skipIntro = useCallback(() => {
    const video = videoRef.current;
    if (video && intro) {
      video.currentTime = intro.end;
      toast.success('Skipped intro');
    }
  }, [intro]);

  const skipOutro = useCallback(() => {
    const video = videoRef.current;
    if (video && outro) {
      video.currentTime = outro.end;
      toast.success('Skipped outro');
    }
  }, [outro]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        crossOrigin="anonymous"
      />

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <button
          onClick={skipIntro}
          className="absolute bottom-24 right-4 z-50 bg-white/90 text-black px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors"
        >
          Skip Intro
        </button>
      )}

      {/* Skip Outro Button */}
      {showSkipOutro && (
        <button
          onClick={skipOutro}
          className="absolute bottom-24 right-4 z-50 bg-white/90 text-black px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors"
        >
          Skip Outro
        </button>
      )}
    </div>
  );
}