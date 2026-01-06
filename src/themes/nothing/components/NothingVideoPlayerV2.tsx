import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parseVTTThumbnails, type ThumbnailCue } from "@/lib/vttParser";
import { NothingPlayerControls } from "./NothingPlayerControls";
import { NothingPlayerOverlay } from "./NothingPlayerOverlay";
import { NothingGestureOverlay } from "./NothingGestureOverlay";
import { usePlayerGestures } from "./NothingPlayerGestures";
import { useCast } from "@/hooks/use-cast";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";

interface NothingVideoPlayerV2Props {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean; language?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  headers?: Record<string, string> | null;
  onClose: () => void;
  onNext?: () => void;
  nextTitle?: string;
  info?: {
    title?: string;
    image?: string;
    description?: string;
    type?: string;
    language?: { sub?: string | null; dub?: string | null };
  };
  episodes?: Array<{ id: string; title?: string; number?: number }>;
  currentEpisode?: number;
  onSelectEpisode?: (ep: { id: string; title?: string; number?: number }) => void;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  resumeFrom?: number;
}

export function NothingVideoPlayerV2({ source, title, tracks, intro, outro, headers, onClose, onProgressUpdate, resumeFrom, info, episodes, currentEpisode, onSelectEpisode, onNext, nextTitle }: NothingVideoPlayerV2Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const hasRestoredProgress = useRef(false);
  const wakeLockRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [subtitles, setSubtitles] = useState<Array<{ index: number; label: string; language: string }>>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [buffered, setBuffered] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [thumbnailCues, setThumbnailCues] = useState<ThumbnailCue[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const { isCasting, castAvailable, handleCastClick, changeCastSubtitle, resyncCastSubtitles } = useCast(
    source, 
    title, 
    tracks,
    info?.image,
    info?.description
  );

  const { buttonPressed } = useGamepad({ enableButtonEvents: true });
  const fullscreenCooldownRef = useRef<number>(0);

  const CONTROL_VISIBILITY_DURATION = 3000;

  const updateControlsVisibility = useCallback(
    (nextVisible: boolean | ((prevVisible: boolean) => boolean)) => {
      setShowControls((prevVisible) => {
        const resolvedVisible =
          typeof nextVisible === "function"
            ? nextVisible(prevVisible)
            : nextVisible;

        return resolvedVisible;
      });
    },
    [],
  );

  // Pause video when casting starts and sync time
  useEffect(() => {
    if (isCasting && videoRef.current) {
      videoRef.current.pause();
      console.log('📺 Video paused on mobile - casting to TV');
      
      // Ensure Cast device is at the same time position
      const castSession = (window as any).chrome?.cast?.framework?.CastContext?.getInstance()?.getCurrentSession();
      if (castSession) {
        const media = castSession.getMediaSession();
        if (media && videoRef.current.currentTime > 0) {
          const seekRequest = new (window as any).chrome.cast.media.SeekRequest();
          seekRequest.currentTime = videoRef.current.currentTime;
          media.seek(seekRequest, 
            () => console.log('✅ Cast synced to current time:', videoRef.current?.currentTime),
            (error: any) => console.error('❌ Error syncing Cast time:', error)
          );
        }
      }
    }
  }, [isCasting]);

  // Wake Lock API - Keep screen awake during fullscreen playback
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isFullscreen && isPlaying) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock activated');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock released');
        } catch (err) {
          console.log('Wake Lock release error:', err);
        }
      }
    };

    if (isFullscreen && isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isFullscreen, isPlaying]);

  // Cleanup click timeout
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Load and parse thumbnail VTT file
  useEffect(() => {
    const thumbnailTrack = tracks?.find(t => t.kind === "thumbnails");
    if (!thumbnailTrack) {
      setThumbnailCues([]);
      return;
    }

    parseVTTThumbnails(thumbnailTrack.file)
      .then((cues) => {
        setThumbnailCues(cues);
      })
      .catch((err) => {
        console.error('Failed to load thumbnail cues:', err);
        setThumbnailCues([]);
      });
  }, [tracks]);

  // Initialize HLS and resume from saved position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    hasRestoredProgress.current = false;
    const isHlsLike = source.includes(".m3u8") || source.includes("/proxy?url=");

    if (isHlsLike) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 60,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            xhrSetup: (xhr: XMLHttpRequest) => {
              if (!source.includes("/proxy?url=")) {
                try {
                  if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                      try {
                        xhr.setRequestHeader(key, value);
                      } catch (err) {
                        console.warn(`Failed to set header ${key}:`, err);
                      }
                    });
                  } else {
                    xhr.setRequestHeader("Referer", "https://megacloud.blog/");
                  }
                } catch (err) {
                  console.warn("Failed to set request headers:", err);
                }
              }
            },
          });

          hls.subtitleDisplay = true;
          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (resumeFrom && resumeFrom > 0 && !hasRestoredProgress.current) {
              console.log("📍 Resuming playback from:", resumeFrom, "seconds");
              video.currentTime = resumeFrom;
              hasRestoredProgress.current = true;
            } else {
              console.log("▶️ Starting from beginning");
            }
            video.play().catch((err) => {
              console.log("Autoplay prevented:", err);
            });
          });

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) {
              console.error("HLS Error:", data);
              setIsLoading(false);
            }
          });

          hlsRef.current = hls;

          return () => {
            hls.destroy();
          };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", () => {
            setIsLoading(false);
            if (resumeFrom && resumeFrom > 0 && !hasRestoredProgress.current) {
              console.log("📍 Resuming playback from:", resumeFrom, "seconds");
              video.currentTime = resumeFrom;
              hasRestoredProgress.current = true;
            } else {
              console.log("▶️ Starting from beginning");
            }
            video.play().catch((err) => {
              console.log("Autoplay prevented:", err);
            });
          });
        }
      });
    } else {
      video.src = source;
      video.addEventListener("loadedmetadata", () => {
        if (resumeFrom && resumeFrom > 0 && !hasRestoredProgress.current) {
          video.currentTime = resumeFrom;
          hasRestoredProgress.current = true;
          console.log("Resuming from:", resumeFrom);
        }
        video.play().catch((err) => {
          console.log("Autoplay prevented:", err);
        });
      });
    }
  }, [source]);

  // Update progress - save every 5 seconds and on key events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastSavedTime = 0;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration);
      }

      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }

      if (onProgressUpdate && video.currentTime - lastSavedTime >= 10) {
        onProgressUpdate(video.currentTime, video.duration);
        lastSavedTime = video.currentTime;
      }

      if (intro && video.currentTime >= intro.start && video.currentTime < intro.end) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }

      if (outro && video.currentTime >= outro.start && video.currentTime < outro.end) {
        setShowSkipOutro(true);
      } else {
        setShowSkipOutro(false);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onProgressUpdate && video.duration) {
        onProgressUpdate(video.currentTime, video.duration);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onProgressUpdate && video.duration) {
        onProgressUpdate(video.currentTime, video.duration);
      }
    };

    const handleSeeked = () => {
      if (onProgressUpdate && video.duration) {
        onProgressUpdate(video.currentTime, video.duration);
      }
      
      // Resync Cast subtitles after seek to prevent desync
      if (isCasting && resyncCastSubtitles) {
        setTimeout(() => {
          resyncCastSubtitles();
        }, 500); // Small delay to let Cast device finish seeking
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    const handleLoadedMetadata = () => {
      updateProgress();
      if (onProgressUpdate && video.duration && video.duration > 0) {
        console.log("📊 Saving initial progress with duration:", video.duration);
        onProgressUpdate(video.currentTime, video.duration);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onProgressUpdate]);

  useEffect(() => {
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }

    // Always auto-hide after inactivity whenever controls are visible
    if (showControls) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
        controlsTimeoutRef.current = null;
      }, CONTROL_VISIBILITY_DURATION);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, [showControls, isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const style = document.createElement('style');
    style.id = 'subtitle-position-style';
    
    // Enhanced subtitle styles for better visibility
    const commonCueStyles = `
      video::cue {
        background-color: rgba(0, 0, 0, 0.75) !important;
        color: white !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.9) !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        font-weight: 600 !important;
        font-size: 1.1em !important;
        line-height: 1.4 !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
      }
    `;

    if (showControls) {
      style.textContent = `
        video::-webkit-media-text-track-container {
          transform: translateY(-100px) !important;
          transition: transform 0.3s ease-out !important;
        }
        video::cue {
          transform: translateY(-100px) !important;
          transition: transform 0.3s ease-out !important;
        }
        ${commonCueStyles}
      `;
    } else {
      style.textContent = `
        video::-webkit-media-text-track-container {
          transform: translateY(-40px) !important;
          transition: transform 0.3s ease-out !important;
        }
        video::cue {
          transform: translateY(-40px) !important;
          transition: transform 0.3s ease-out !important;
        }
        ${commonCueStyles}
      `;
    }

    const existingStyle = document.getElementById('subtitle-position-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById('subtitle-position-style');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [showControls]);

  const handleMouseMove = () => {
    if (isDragging) return;
    updateControlsVisibility(true);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((err) => {
        // Ignore abort errors which happen when pausing quickly after playing
        if (err.name !== "AbortError") {
          console.error("Play error:", err);
        }
      });
    } else {
      video.pause();
    }
  }, []);

  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    if (Number.isFinite(newTime)) {
      video.currentTime = newTime;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume || 0.5;
      setVolume(volume || 0.5);
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = useCallback(() => {
    const now = Date.now();
    if (now - fullscreenCooldownRef.current < 800) {
      return; // Still in cooldown period
    }
    fullscreenCooldownRef.current = now;

    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    const doc = document as any;
    const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch((err: any) => {
          console.error("Error attempting to enable fullscreen:", err);
          // Fallback for iOS Safari which only supports fullscreen on video element
          if (video && (video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
          }
        });
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      } else if (video && (video as any).webkitEnterFullscreen) {
        // iOS Safari fallback
        (video as any).webkitEnterFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      } else if (video && (video as any).webkitExitFullscreen) {
        (video as any).webkitExitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const targetTime = video.currentTime + seconds;
    if (Number.isFinite(duration) && duration > 0) {
      video.currentTime = Math.max(0, Math.min(targetTime, duration));
    } else {
      video.currentTime = Math.max(0, targetTime);
    }
  };

  const skipIntro = () => {
    const video = videoRef.current;
    if (!video || !intro) return;
    video.currentTime = intro.end;
    setShowSkipIntro(false);
  };

  const skipOutro = () => {
    const video = videoRef.current;
    if (!video || !outro) return;
    video.currentTime = outro.end;
    setShowSkipOutro(false);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const changeSubtitle = (trackIndex: number) => {
    const video = videoRef.current;
    if (!video) return;

    console.log(`🎬 Changing subtitle to track ${trackIndex}`);

    // Disable all text tracks first
    for (let i = 0; i < video.textTracks.length; i++) {
      const track = video.textTracks[i];
      if (track.kind === "metadata") continue;
      track.mode = "disabled";
    }

    // Enable the selected track
    if (trackIndex >= 0 && trackIndex < video.textTracks.length) {
      const selectedTrack = video.textTracks[trackIndex];
      if (selectedTrack.kind !== "metadata") {
        selectedTrack.mode = "showing";
        console.log(`✅ Enabled subtitle track ${trackIndex}: ${selectedTrack.label}`);
      }
      setCurrentSubtitle(trackIndex);
      
      // Sync with Cast if casting
      if (isCasting && changeCastSubtitle && tracks) {
        const selectedApiTrack = tracks.find((_, idx) => {
          let subtitleIndex = 0;
          for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].kind !== 'thumbnails') {
              if (subtitleIndex === trackIndex) return i === idx;
              subtitleIndex++;
            }
          }
          return false;
        });
        
        if (selectedApiTrack) {
          console.log(`📺 Syncing Cast subtitle: ${selectedApiTrack.label}`);
          changeCastSubtitle(selectedApiTrack.file);
        }
      }
    } else {
      console.log(`❌ Disabled all subtitles`);
      setCurrentSubtitle(-1);
      
      // Turn off Cast subtitles
      if (isCasting && changeCastSubtitle) {
        changeCastSubtitle('');
      }
    }
    setShowSubtitles(false);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const normalize = (value?: string | null) => (value || "").trim().toLowerCase();

    const updateSubtitles = () => {
      const tracksList: Array<{ index: number; label: string; language: string }> = [];

      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if (track.kind === "metadata") continue;

        const label = track.label || track.language || `Track ${i + 1}`;
        tracksList.push({
          index: i,
          label,
          language: track.language || "",
        });
      }

      setSubtitles(tracksList);

      let defaultTrackIndex = -1;

      if (tracks && tracks.length > 0) {
        const defaultTrack = tracks.find((t) => t.default === true && t.kind !== "thumbnails");
        if (defaultTrack) {
          for (let i = 0; i < video.textTracks.length; i++) {
            const track = video.textTracks[i];
            if (track.kind === "metadata") continue;

            const trackLabel = normalize(track.label);
            const apiLabel = normalize(defaultTrack.label);
            const trackLang = normalize(track.language);
            const apiLang = normalize((defaultTrack as any).language);

            if (trackLabel === apiLabel || (apiLang && trackLang && trackLang === apiLang)) {
              defaultTrackIndex = i;
              console.log("✅ Default subtitle track enabled from API:", defaultTrack.label);
              break;
            }
          }
        }
      }

      if (defaultTrackIndex === -1 && tracksList.length > 0) {
        defaultTrackIndex = tracksList[0].index;
        console.log("✅ First available subtitle track enabled as fallback");
      }

      // Force enable the default track and ensure others are hidden
      if (video.textTracks && video.textTracks.length > 0) {
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          if (track.kind === "metadata") continue;

          if (i === defaultTrackIndex) {
            track.mode = "showing";
            console.log(`✅ Subtitle track ${i} (${track.label}) set to SHOWING`);
          } else {
            track.mode = "hidden";
          }
        }
      }

      setCurrentSubtitle(defaultTrackIndex >= 0 ? defaultTrackIndex : -1);
    };

    const handleTrackChange = () => {
      requestAnimationFrame(updateSubtitles);
    };

    video.addEventListener("loadedmetadata", updateSubtitles);
    video.addEventListener("loadeddata", updateSubtitles);
    video.textTracks.addEventListener?.("addtrack", handleTrackChange);
    video.textTracks.addEventListener?.("removetrack", handleTrackChange);
    video.textTracks.addEventListener?.("change", handleTrackChange);

    // CRITICAL: Run immediately when tracks change, even after idle
    // This ensures subtitles load after long idle periods
    const initTimeout = setTimeout(() => {
      if (video.textTracks.length > 0) {
        updateSubtitles();
      }
    }, 100);

    // Delayed reload after 3 seconds of playback to ensure subtitles are loaded
    // This fixes cases where initial load attempts failed or tracks weren't ready
    let playbackTimeout: number | null = null;
    const handlePlayForDelayedReload = () => {
      if (playbackTimeout) clearTimeout(playbackTimeout);
      playbackTimeout = window.setTimeout(() => {
        if (video.textTracks.length > 0 && !video.paused) {
          console.log("🔄 Reloading subtitles 3s after playback start");
          updateSubtitles();
        }
      }, 3000);
    };

    // Also run when video becomes ready after idle
    const handleCanPlayThrough = () => {
      if (video.textTracks.length > 0) {
        updateSubtitles();
      }
    };

    const handlePlay = () => {
      if (video.textTracks.length > 0) {
        updateSubtitles();
      }
      // Schedule delayed reload
      handlePlayForDelayedReload();
    };

    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("loadedmetadata", updateSubtitles);
      video.removeEventListener("loadeddata", updateSubtitles);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("play", handlePlay);
      video.textTracks.removeEventListener?.("addtrack", handleTrackChange);
      video.textTracks.removeEventListener?.("removetrack", handleTrackChange);
      video.textTracks.removeEventListener?.("change", handleTrackChange);
      clearTimeout(initTimeout);
      if (playbackTimeout) clearTimeout(playbackTimeout);
    };
  }, [tracks, source]);

  // Add gamepad controls for video player
  useEffect(() => {
    if (buttonPressed === null) return;

    // R1 (RB) - Toggle fullscreen (works anytime)
    if (buttonPressed === GAMEPAD_BUTTONS.RB) {
      updateControlsVisibility(true);
      toggleFullscreen();
      return;
    }

    // Only process fullscreen-specific controls when in fullscreen
    if (!isFullscreen) {
      return;
    }

    // Show controls briefly when button is pressed in fullscreen
    updateControlsVisibility(true);

    switch (buttonPressed) {
      case GAMEPAD_BUTTONS.RT: // R2 - Exit fullscreen
        toggleFullscreen();
        break;
      case GAMEPAD_BUTTONS.X: // X - Play/Pause
        togglePlay();
        break;
      case GAMEPAD_BUTTONS.DPAD_LEFT: // Left - Seek back 10s
        skip(-10);
        break;
      case GAMEPAD_BUTTONS.DPAD_RIGHT: // Right - Seek forward 10s
        skip(10);
        break;
      case GAMEPAD_BUTTONS.DPAD_UP: // Up - Volume up
        handleVolumeChange(Math.min(1, volume + 0.1));
        break;
      case GAMEPAD_BUTTONS.DPAD_DOWN: // Down - Volume down
        handleVolumeChange(Math.max(0, volume - 0.1));
        break;
      case GAMEPAD_BUTTONS.LB: // LB - Skip intro (if available)
        if (showSkipIntro) skipIntro();
        break;
      case GAMEPAD_BUTTONS.RB: // Already handled above for fullscreen toggle
        if (showSkipOutro) skipOutro();
        else if (onNext) onNext();
        break;
      default:
        break;
    }
  }, [buttonPressed, isFullscreen, togglePlay, toggleFullscreen, skip, volume, handleVolumeChange, onNext, showSkipIntro, showSkipOutro, skipIntro, skipOutro, updateControlsVisibility]);

  // Gesture Hook
  const { gestureHandlers, overlayProps } = usePlayerGestures({
    videoRef,
    isPlaying,
    togglePlay,
    seek: handleSeek,
    duration,
    currentTime,
    volume,
    setVolume: handleVolumeChange,
    brightness,
    setBrightness,
    toggleControls: (force) =>
      updateControlsVisibility(force !== undefined ? force : (prev) => !prev),
    areControlsVisible: showControls,
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowright":
          e.preventDefault();
          skip(10);
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-10);
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          if (videoRef.current) videoRef.current.volume = Math.min(1, volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          if (videoRef.current) videoRef.current.volume = Math.max(0, volume - 0.1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [togglePlay, toggleFullscreen, volume]);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-[32px] overflow-hidden group select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        data-testid="video-player-container"
        {...gestureHandlers}
      >
        <NothingGestureOverlay {...overlayProps} />

        <NothingPlayerOverlay
          title={title}
          showControls={showControls}
          isPlaying={isPlaying}
          isLoading={isLoading}
          showSkipIntro={showSkipIntro}
          showSkipOutro={showSkipOutro}
          onSkipIntro={skipIntro}
          onSkipOutro={skipOutro}
          onNext={onNext}
          nextTitle={nextTitle}
          onTogglePlay={togglePlay}
        />

        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          crossOrigin="anonymous"
          playsInline
          style={{ filter: `brightness(${brightness})` }}
          data-testid="video-element"
        >
          {tracks?.map((track, idx) => (
            <track
              key={idx}
              kind={track.kind === "thumbnails" ? "metadata" : (track.kind || "subtitles")}
              src={track.file}
              label={track.label || "Unknown"}
              srcLang={track.language?.toLowerCase() || track.label?.slice(0, 2)?.toLowerCase() || "en"}
              default={track.default ?? (track.kind !== "thumbnails" && idx === 0)}
            />
          ))}
        </video>

        <NothingPlayerControls
          showControls={showControls}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onSeek={handleSeek}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onSkip={skip}
          showSubtitles={showSubtitles}
          setShowSubtitles={setShowSubtitles}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          subtitles={subtitles}
          currentSubtitle={currentSubtitle}
          onChangeSubtitle={changeSubtitle}
          playbackRate={playbackRate}
          onChangePlaybackRate={changePlaybackRate}
          thumbnailCues={thumbnailCues}
          isDragging={isDragging}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          castAvailable={castAvailable}
          isCasting={isCasting}
          onCastClick={handleCastClick}
        />
      </motion.div>
    </AnimatePresence>
  );
}