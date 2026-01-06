import { useCallback, useEffect, useRef, useState } from "react";
import {
  Captions,
  Loader2,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

type Track = { file: string; label: string; kind?: string };

interface NothingVideoPlayerProps {
  source: string;
  title: string;
  episodeLabel?: string;
  tracks?: Track[];
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  resumeFrom?: number;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onNext?: () => void;
  nextTitle?: string;
}

export function NothingVideoPlayer({
  source,
  title,
  episodeLabel,
  tracks = [],
  intro,
  outro,
  resumeFrom = 0,
  onProgressUpdate,
  onNext,
  nextTitle,
}: NothingVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const lastSavedRef = useRef(0);
  const hasResumedRef = useRef(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [subtitles, setSubtitles] = useState<Array<{ index: number; label: string }>>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showIntroCta, setShowIntroCta] = useState(false);
  const [showOutroCta, setShowOutroCta] = useState(false);

  const formatTime = (value: number) => {
    if (!Number.isFinite(value)) return "0:00";
    const hrs = Math.floor(value / 3600);
    const mins = Math.floor((value % 3600) / 60);
    const secs = Math.floor(value % 60).toString().padStart(2, "0");
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs}` : `${mins}:${secs}`;
  };

  const reportProgress = useCallback(
    (video: HTMLVideoElement) => {
      if (!onProgressUpdate || !Number.isFinite(video.duration) || video.duration <= 0) return;
      onProgressUpdate(Math.floor(video.currentTime), Math.floor(video.duration));
      lastSavedRef.current = video.currentTime;
    },
    [onProgressUpdate],
  );

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    setIsBuffering(true);
    hasResumedRef.current = false;

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute("src");
      video.load();
    };

    const attachNative = () => {
      video.src = source;
      video.load();
    };

    const loadHls = async () => {
      const { default: Hls } = await import("hls.js");
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
                xhr.setRequestHeader("Referer", "https://megacloud.blog/");
              } catch {
                // ignore
              }
            }
          },
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNative();
      } else {
        attachNative();
      }
    };

    if (source.includes(".m3u8") || source.includes("/proxy?url=")) {
      loadHls();
    } else {
      attachNative();
    }

    return cleanup;
  }, [source]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      if (resumeFrom > 0 && !hasResumedRef.current && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(resumeFrom, Math.max(0, video.duration - 2));
        hasResumedRef.current = true;
      }
      reportProgress(video);
      syncTracks();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      resetControlsTimeout();
    };

    const handlePause = () => {
      setIsPlaying(false);
      reportProgress(video);
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          setBuffered((bufferedEnd / video.duration) * 100);
        }
      }
      if (
        intro &&
        video.currentTime >= intro.start &&
        video.currentTime < intro.end
      ) {
        setShowIntroCta(true);
      } else {
        setShowIntroCta(false);
      }
      if (
        outro &&
        video.currentTime >= outro.start &&
        video.currentTime < outro.end
      ) {
        setShowOutroCta(true);
      } else {
        setShowOutroCta(false);
      }
      if (onProgressUpdate && video.currentTime - lastSavedRef.current >= 10) {
        reportProgress(video);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowOutroCta(false);
      reportProgress(video);
      setShowControls(true);
    };

    const syncTracks = () => {
      const list = Array.from(video.textTracks).map((track, index) => ({
        index,
        label: track.label || track.language || `Track ${index + 1}`,
      }));
      setSubtitles(list);
      if (list.length > 0 && currentSubtitle === -1) {
        const englishIndex = list.find(
          ({ label }) => label.toLowerCase().includes("english") || label.toLowerCase().includes("eng"),
        )?.index;
        if (typeof englishIndex === "number") {
          setCurrentSubtitle(englishIndex);
          video.textTracks[englishIndex].mode = "showing";
        }
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [intro, outro, onProgressUpdate, reportProgress, resumeFrom, currentSubtitle, resetControlsTimeout]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen) {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      } else {
        resetControlsTimeout();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.min(Math.max(video.currentTime + seconds, 0), duration || video.duration || 0);
    video.currentTime = target;
    resetControlsTimeout();
  };

  const seekTo = (percentage: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(duration) || duration <= 0) return;
    video.currentTime = (percentage / 100) * duration;
    resetControlsTimeout();
  };

  const changeVolume = (nextVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = nextVolume;
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume || 0.6;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  };

  const changeSubtitle = (index: number) => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentSubtitle(index);
    Array.from(video.textTracks).forEach((track, idx) => {
      track.mode = idx === index ? "showing" : "hidden";
    });
    setShowSubtitleMenu(false);
    resetControlsTimeout();
  };

  const handleContainerInteraction = () => {
    resetControlsTimeout();
  };

  const handleVideoClick = () => {
    resetControlsTimeout();
    togglePlay();
  };

  return (
    <div ref={containerRef} className="nothing-player-shell">
      <div 
        className="relative aspect-video nothing-player-surface overflow-hidden"
        style={{ borderRadius: 'clamp(24px, 4vw, 32px)' }}
        onMouseMove={handleContainerInteraction}
        onTouchStart={handleContainerInteraction}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          crossOrigin="anonymous"
        >
          {tracks.map((track, idx) => (
            <track
              key={`${track.file}-${idx}`}
              src={track.file}
              kind={track.kind || "subtitles"}
              label={track.label}
            />
          ))}
        </video>

        <div className="absolute inset-0 pointer-events-none nothing-player-noise" />

        {/* Brand label - hide in fullscreen */}
        {!isFullscreen && (
          <div className="absolute top-5 left-6 flex items-center gap-3 text-white/80 font-semibold tracking-[0.2em] text-xs">
            <span className="nothing-brand-dot" />
            Nothing Anime
          </div>
        )}

        {/* Title and episode - hide in fullscreen or show only when controls visible */}
        {(title || episodeLabel) && (!isFullscreen || showControls) && (
          <div className="absolute bottom-36 md:bottom-40 left-6 text-white space-y-1 pointer-events-none">
            <p className="uppercase text-sm tracking-[0.35em] text-white/60">Now Playing</p>
            <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
            {episodeLabel && <p className="text-sm text-white/70">{episodeLabel}</p>}
          </div>
        )}

        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-white/80" />
          </div>
        )}

        {/* Skip buttons - show when controls visible */}
        {showIntroCta && intro && showControls && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              seekTo((intro.end / (duration || intro.end)) * 100);
            }}
            className="nothing-chip absolute top-5 right-5"
          >
            Skip Intro
          </button>
        )}

        {showOutroCta && outro && showControls && (
          <div className="absolute top-5 right-5 flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                seekTo((outro.end / (duration || outro.end)) * 100);
              }}
              className="nothing-chip"
            >
              Skip Outro
            </button>
            {onNext && nextTitle && !isFullscreen && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }} 
                className="nothing-chip nothing-chip-accent"
              >
                Next • {nextTitle}
              </button>
            )}
          </div>
        )}

        {/* Controls - show/hide based on state */}
        <div 
          className={`nothing-player-controls px-3 md:px-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="nothing-player-slider mb-2">
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            <div
              className="absolute inset-y-0 left-0 bg-[#ff4d4f] rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={(event) => seekTo(parseFloat(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between text-white/80 text-xs mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-white">
            <button onClick={() => skip(-10)} className="nothing-player-btn" aria-label="Back 10 seconds">
              <RotateCcw className="h-5 w-5" />
            </button>
            <button onClick={togglePlay} className="nothing-player-btn nothing-player-btn-primary" aria-label="Play/Pause">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => skip(10)} className="nothing-player-btn" aria-label="Forward 10 seconds">
              <RotateCw className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2">
              <button onClick={toggleMute} className="nothing-player-btn" aria-label="Mute">
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(event) => changeVolume(parseFloat(event.target.value))}
                className="nothing-volume-slider w-20"
              />
            </div>

            <button onClick={toggleMute} className="sm:hidden nothing-player-btn" aria-label="Mute">
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSubtitleMenu((prev) => !prev)}
                className={`nothing-player-btn ${currentSubtitle >= 0 ? "text-[#ff4d4f]" : ""}`}
                aria-label="Subtitles"
              >
                <Captions className="h-5 w-5" />
              </button>
              {showSubtitleMenu && (
                <div className="absolute bottom-full right-0 mb-3 bg-white/95 backdrop-blur-xl rounded-2xl p-2 min-w-[220px] max-w-[280px] shadow-2xl border border-black/10">
                  <div className="text-black/40 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-2 border-b border-black/5">Subtitles</div>
                  <div className="max-h-[280px] overflow-y-auto py-1">
                    <button 
                      onClick={() => changeSubtitle(-1)} 
                      className={`flex items-center justify-between w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-black/5 transition-all ${currentSubtitle === -1 ? "bg-[#ff4d4f]/10 text-[#ff4d4f] font-semibold" : "text-[#050814]"}`}
                    >
                      <span>Off</span>
                      {currentSubtitle === -1 && <span className="text-[#ff4d4f] text-lg">✓</span>}
                    </button>
                    {subtitles.map((track) => (
                      <button
                        key={track.index}
                        onClick={() => changeSubtitle(track.index)}
                        className={`flex items-center justify-between w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-black/5 transition-all ${currentSubtitle === track.index ? "bg-[#ff4d4f]/10 text-[#ff4d4f] font-semibold" : "text-[#050814]"}`}
                      >
                        <span className="truncate">{track.label}</span>
                        {currentSubtitle === track.index && <span className="text-[#ff4d4f] text-lg ml-2">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="nothing-player-btn ml-auto" aria-label="Fullscreen">
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Next episode banner - hide in fullscreen */}
      {nextTitle && onNext && !isFullscreen && (
        <div className="nothing-next-banner">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Up Next</p>
            <p className="text-white font-semibold">{nextTitle}</p>
          </div>
          <button onClick={onNext} className="nothing-chip nothing-chip-accent">
            Play Next
          </button>
        </div>
      )}
    </div>
  );
}