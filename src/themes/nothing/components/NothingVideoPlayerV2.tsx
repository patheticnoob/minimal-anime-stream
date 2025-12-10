import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parseVTTThumbnails, type ThumbnailCue } from "@/lib/vttParser";
import { NothingPlayerControls } from "./NothingPlayerControls";
import { NothingPlayerOverlay } from "./NothingPlayerOverlay";

interface NothingVideoPlayerV2Props {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
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

export function NothingVideoPlayerV2({ source, title, tracks, intro, outro, headers, onClose, onProgressUpdate, resumeFrom, info, episodes, currentEpisode, onNext, nextTitle }: NothingVideoPlayerV2Props) {
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
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (isPlaying) {
        setShowControls(true);
        controlsTimeoutRef.current = window.setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const style = document.createElement('style');
    style.id = 'subtitle-position-style';
    
    if (showControls) {
      style.textContent = `
        video::-webkit-media-text-track-container {
          transform: translateY(-120px) !important;
        }
        video::cue {
          transform: translateY(-120px) !important;
        }
      `;
    } else {
      style.textContent = `
        video::-webkit-media-text-track-container {
          transform: translateY(-60px) !important;
        }
        video::cue {
          transform: translateY(-60px) !important;
        }
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
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const lastTapRef = useRef<{ time: number; x: number; side: 'left' | 'right' | 'center' | null }>({ time: 0, x: 0, side: null });

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const rect = video.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const centerWidth = rect.width * 0.4;
    const centerHeight = rect.height * 0.4;
    const centerLeft = (rect.width - centerWidth) / 2;
    const centerTop = (rect.height - centerHeight) / 2;
    
    const isInCenter = 
      clickX >= centerLeft && 
      clickX <= centerLeft + centerWidth &&
      clickY >= centerTop && 
      clickY <= centerTop + centerHeight;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current.time;
    const isDoubleTap = timeSinceLastTap < 300;

    let side: 'left' | 'right' | 'center' | null = null;
    if (isInCenter) {
      side = 'center';
    } else if (clickX < centerLeft) {
      side = 'left';
    } else if (clickX > centerLeft + centerWidth) {
      side = 'right';
    }

    // Center Tap Logic
    if (side === 'center') {
      // Clear any pending side tap timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (isPlaying) {
        video.pause();
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      } else {
        video.play();
        setShowControls(false);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      }
      
      lastTapRef.current = { time: now, x: clickX, side };
      return;
    }

    // Side Tap Logic
    if (isDoubleTap && lastTapRef.current.side === side) {
      // Double Tap detected - Cancel single tap action
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (side === 'left') {
        skip(-10);
      } else if (side === 'right') {
        skip(10);
      }
      
      // Reset to prevent triple tap
      lastTapRef.current = { time: 0, x: 0, side: null };
    } else {
      // Single Tap detected (Potential)
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      lastTapRef.current = { time: now, x: clickX, side };

      clickTimeoutRef.current = window.setTimeout(() => {
        if (showControls) {
          setShowControls(false);
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        } else {
          setShowControls(true);
          if (isPlaying) {
            controlsTimeoutRef.current = window.setTimeout(() => {
              setShowControls(false);
            }, 3000);
          }
        }
        clickTimeoutRef.current = null;
      }, 300);
    }
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

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
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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

    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = "hidden";
    }

    if (trackIndex >= 0 && trackIndex < video.textTracks.length) {
      video.textTracks[trackIndex].mode = "showing";
      setCurrentSubtitle(trackIndex);
    } else {
      setCurrentSubtitle(-1);
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

        track.mode = "hidden";
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

      if (defaultTrackIndex === -1) {
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          if (track.kind === "metadata") continue;

          const label = normalize(track.label);
          const lang = normalize(track.language);

          if (label.includes("english") || lang === "en" || lang === "eng" || lang.startsWith("en-")) {
            defaultTrackIndex = i;
            console.log("✅ English subtitles enabled as fallback");
            break;
          }
        }
      }

      if (defaultTrackIndex === -1 && tracksList.length > 0) {
        defaultTrackIndex = tracksList[0].index;
      }

      if (defaultTrackIndex >= 0) {
        video.textTracks[defaultTrackIndex].mode = "showing";
        setCurrentSubtitle(defaultTrackIndex);
      } else {
        setCurrentSubtitle(-1);
      }
    };

    const handleTrackChange = () => {
      requestAnimationFrame(updateSubtitles);
    };

    video.addEventListener("loadedmetadata", updateSubtitles);
    video.textTracks.addEventListener?.("addtrack", handleTrackChange);
    video.textTracks.addEventListener?.("removetrack", handleTrackChange);

    return () => {
      video.removeEventListener("loadedmetadata", updateSubtitles);
      video.textTracks.removeEventListener?.("addtrack", handleTrackChange);
      video.textTracks.removeEventListener?.("removetrack", handleTrackChange);
    };
  }, [tracks]);

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
        className="relative w-full aspect-video bg-black rounded-[32px] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        data-testid="video-player-container"
      >
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
          onClick={handleVideoClick}
          crossOrigin="anonymous"
          playsInline
          data-testid="video-element"
        >
          {tracks?.map((track, idx) => (
            <track
              key={idx}
              kind={track.kind === "thumbnails" ? "metadata" : (track.kind || "subtitles")}
              src={track.file}
              label={track.label || "Unknown"}
              srcLang={track.label?.slice(0, 2)?.toLowerCase() || "en"}
              default={track.default || false}
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
        />
      </motion.div>
    </AnimatePresence>
  );
}