import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { PlayerInfoPanel } from "@/components/PlayerInfoPanel";

interface VideoPlayerProps {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string }>;
  onClose: () => void;
  // Add optional "next" props; if not provided, countdown UI won't show
  onNext?: () => void;
  nextTitle?: string;

  // New: Info panel data & episode wiring
  info?: {
    title?: string;
    image?: string;
    description?: string;
    type?: string;
    language?: { sub?: string | null; dub?: string | null };
  };
  episodes?: Array<{ id: string; title?: string; number?: number }>;
  currentEpisode?: number; // episode number for highlighting
  onSelectEpisode?: (ep: { id: string; title?: string; number?: number }) => void;
}

export function VideoPlayer({ source, title, tracks, onClose, onNext, nextTitle, info, episodes, currentEpisode, onSelectEpisode }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPaused, setUserPaused] = useState(false); // track user-intent pause for info panel
  const progressRef = useRef<HTMLDivElement>(null); // progress rail ref
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  // New UI/UX state
  const [controlsTimer, setControlsTimer] = useState<number | null>(null);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  // Quality and tracks
  const [qualities, setQualities] = useState<Array<{ label: string; level: number; height?: number }>>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [audioTracks, setAudioTracks] = useState<Array<{ name: string; id: number }>>([]);
  const [currentAudio, setCurrentAudio] = useState<number>(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<number | -1>(-1); // -1 = Off

  // Auto hide controls after inactivity
  const kickControlsTimer = () => {
    if (controlsTimer) {
      window.clearTimeout(controlsTimer);
    }
    const id = window.setTimeout(() => setShowControls(false), 2500);
    setControlsTimer(id);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure volume persists on mount
    video.volume = volume;

    // Cleanup any previous HLS instance when source changes/unmounts
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError("Failed to load video. Please try a different server.");
      setIsLoading(false);
    };

    // Extra buffering UX
    const handleSeeking = () => setIsLoading(true);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setIsLoading(false);
      // Auto-enable the first subtitle track if available
      try {
        const list = video.textTracks;
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            list[i].mode = "disabled";
          }
          list[0].mode = "showing";
          setCurrentSubtitle(0);
        }
      } catch {}
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    // HLS setup with robust config and recovery
    const isHlsLike = source.includes(".m3u8") || source.includes("/proxy?url=");

    if (isHlsLike) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hlsConfig = {
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            backBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            liveBackBufferLength: 60,
            lowLatencyMode: false,
            xhrSetup: (xhr: XMLHttpRequest) => {
              if (!source.includes("/proxy?url=")) {
                try {
                  xhr.setRequestHeader("Referer", "https://megacloud.blog/");
                } catch {}
              }
            },
          } as const;

          const hls = new Hls(hlsConfig);
          hlsRef.current = hls;

          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(source);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            // Populate quality list from levels
            const levels = (hls.levels || []).map((lvl: any, idx: number) => ({
              label: lvl.height ? `${lvl.height}p` : (lvl.name || `${Math.round((lvl.bitrate || 0) / 1000)} kbps`),
              level: idx,
              height: lvl.height,
            }));
            // Deduplicate by height label
            const dedup: Record<string, { label: string; level: number; height?: number }> = {};
            levels.forEach((l) => {
              dedup[l.label] = l;
            });
            const q = Object.values(dedup).sort((a, b) => (b.height || 0) - (a.height || 0));
            setQualities(q);
            setCurrentQuality(hls.autoLevelEnabled ? -1 : hls.currentLevel ?? -1);

            // Populate audio tracks
            const aud = (hls.audioTracks || []).map((t: any, i: number) => ({ name: t.name || `Track ${i + 1}`, id: i }));
            setAudioTracks(aud);
            setCurrentAudio(hls.audioTrack ?? 0);
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (_e: any, data: any) => {
            setCurrentQuality(data.level ?? -1);
          });

          hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_e: any, data: any) => {
            setCurrentAudio(data.id ?? 0);
          });

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            console.error("HLS error:", data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  try {
                    hls.startLoad();
                  } catch {
                    setError("Network error while loading stream.");
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  try {
                    hls.recoverMediaError();
                  } catch {
                    setError("Media error while playing stream.");
                  }
                  break;
                default:
                  hls.destroy();
                  hlsRef.current = null;
                  setError("Failed to load video stream.");
                  break;
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS (Safari)
          video.src = source;
        } else {
          setError("This browser cannot play HLS streams.");
          setIsLoading(false);
        }
      });
    } else {
      // Non-HLS source
      video.src = source;
    }

    // Track buffered range
    const updateBuffered = () => {
      try {
        if (video.buffered.length > 0) {
          const end = video.buffered.end(video.buffered.length - 1);
          setBufferedEnd(end);
        }
      } catch {}
    };
    video.addEventListener("progress", updateBuffered);
    const onVolume = () => setVolume(video.volume);
    video.addEventListener("volumechange", onVolume);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, [source]);

  // Quality, audio, subtitle handlers
  const setQuality = (lvl: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    if (lvl === -1) {
      hls.currentLevel = -1; // Auto
      setCurrentQuality(-1);
      return;
    }
    hls.autoLevelEnabled = false;
    hls.currentLevel = lvl;
    setCurrentQuality(lvl);
  };

  const setAudio = (id: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.audioTrack = id;
    setCurrentAudio(id);
  };

  const setSubtitle = (idx: number | -1) => {
    const v = videoRef.current;
    if (!v) return;
    const list = v.textTracks;
    for (let i = 0; i < list.length; i++) {
      list[i].mode = "disabled";
    }
    if (idx !== -1 && list[idx]) {
      list[idx].mode = "showing";
    }
    setCurrentSubtitle(idx);
  };

  // Skip intro helper (basic heuristic)
  const showSkipIntro = duration > 60 && currentTime > 5 && currentTime < Math.min(120, duration * 0.25);
  const handleSkipIntro = () => {
    const v = videoRef.current;
    if (!v) return;
    const jumpTo = Math.min((currentTime || 0) + 85, Math.max(duration - 1, 0));
    v.currentTime = isFinite(jumpTo) ? jumpTo : (duration || 0);
  };

  // Next-episode countdown near the end (if provided)
  const nearEnd = duration > 0 && currentTime / duration > 0.92;

  // Controls mouse/touch activity
  const handlePointerActivity = () => {
    setShowControls(true);
    kickControlsTimer();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      setUserPaused(true);
      video.pause();
    } else {
      setUserPaused(false);
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn("Fullscreen operation failed:", err);
      // Silently fail - fullscreen may be blocked by permissions policy in iframe
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Add computed progress percentages for the seek rail
  const playedPercent = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPercent = duration ? Math.min(100, (bufferedEnd / duration) * 100) : 0;

  // Progress hover calculations (timestamp tooltip)
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(Math.max(x / rect.width, 0), 1);
    setHoverTime(duration * ratio);
    setHoverX(x);
  };
  const clearProgressHover = () => setHoverTime(null);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handlePointerActivity}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onTouchStart={handlePointerActivity}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Close Button */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          className="absolute top-4 left-4 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
        >
          <h2 className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded">
            {title}
          </h2>
        </motion.div>

        {/* Big center Play/Pause button */}
        <AnimatePresence>
          {showControls && (
            <motion.button
              onClick={togglePlay}
              className="absolute inset-0 m-auto h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Toggle play"
              style={{ width: "fit-content" }}
            >
              {isPlaying ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white" />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          crossOrigin="anonymous"
          playsInline
        >
          {tracks?.map((track, idx) => (
            <track
              key={idx}
              kind={track.kind || "subtitles"}
              src={track.file}
              label={track.label || "Unknown"}
              srcLang={(track.label?.slice(0, 2)?.toLowerCase() || "en")}
              default={(track as any)?.default === true}
            />
          ))}
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/80 p-6 rounded-lg text-center">
              <p className="text-white mb-4">{error}</p>
              <Button onClick={onClose} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        )}

        {/* Controls */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        >
          <div className="rounded-xl border border-white/10 bg-gradient-to-t from-black/70 to-black/30 backdrop-blur px-3 pt-3 pb-2">
            {/* Progress Rail with buffered + played */}
            <div
              ref={progressRef}
              className="relative h-2 mb-3 select-none"
              onMouseMove={(e) => {
                handlePointerActivity();
                handleProgressHover(e);
              }}
              onTouchStart={handlePointerActivity}
              onMouseLeave={clearProgressHover}
            >
              <div className="absolute inset-0 rounded-full bg-white/10" />
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/20" style={{ width: `${bufferedPercent}%` }} />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                style={{ width: `${playedPercent}%` }}
                initial={false}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-7 translate-x-[-50%] px-2 py-0.5 rounded bg-black/80 text-white text-xs border border-white/10"
                  style={{ left: hoverX }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
              {/* Invisible range overlay to capture seeking */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
              />
            </div>

            {/* Bottom controls row */}
            <div className="flex items-center justify-between gap-3">
              {/* Left cluster */}
              <div className="flex items-center gap-2 md:gap-3">
                <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/10">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                {/* Rewind 10s */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.currentTime = Math.max(0, (v.currentTime || 0) - 10);
                  }}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                {/* Forward 10s */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.currentTime = Math.min(duration || 0, (v.currentTime || 0) + 10);
                  }}
                >
                  <RotateCw className="h-5 w-5" />
                </Button>

                {/* Volume with popover slider */}
                <Popover open={showVolume} onOpenChange={setShowVolume}>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                      {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-40 bg-black/90 border-white/10 text-white">
                    <div className="px-2 py-1">
                      <Slider
                        value={[Math.round((volume || 0) * 100)]}
                        onValueChange={(v) => {
                          const video = videoRef.current;
                          if (!video) return;
                          const val = (v?.[0] ?? 100) / 100;
                          video.volume = val;
                          video.muted = val === 0;
                          setVolume(val);
                          setIsMuted(val === 0);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <span className="text-white/90 text-xs md:text-sm tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right cluster */}
              <div className="flex items-center gap-1 md:gap-2">
                {/* Subtitles menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">CC</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-black/90 text-white border-white/10">
                    <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setSubtitle(-1)}
                    >
                      {currentSubtitle === -1 ? "✓ " : ""} Off
                    </DropdownMenuItem>
                    {(videoRef.current?.textTracks ? Array.from(videoRef.current.textTracks) : []).map((t, i) => (
                      <DropdownMenuItem key={i} className="cursor-pointer" onClick={() => setSubtitle(i)}>
                        {currentSubtitle === i ? "✓ " : ""}{t.label || `Track ${i + 1}`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Audio menu (if any) */}
                {audioTracks.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">Audio</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-black/90 text-white border-white/10">
                      <DropdownMenuLabel>Audio Track</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {audioTracks.map((a) => (
                        <DropdownMenuItem key={a.id} className="cursor-pointer" onClick={() => setAudio(a.id)}>
                          {currentAudio === a.id ? "✓ " : ""} {a.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button size="icon" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skip Intro chip */}
        <AnimatePresence>
          {showSkipIntro && (
            <motion.button
              onClick={handleSkipIntro}
              className="absolute left-4 bottom-28 md:bottom-32 bg-white/15 text-white border border-white/20 px-3 py-1.5 rounded-full backdrop-blur hover:bg-white/25"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              Skip Intro
            </motion.button>
          )}
        </AnimatePresence>

        {/* Next Episode countdown (if handler provided) */}
        <AnimatePresence>
          {onNext && nearEnd && (
            <motion.div
              className="absolute right-4 bottom-28 md:bottom-32 bg-black/80 text-white border border-white/10 px-4 py-3 rounded-lg backdrop-blur"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-sm mb-2">Up next{nextTitle ? `: ${nextTitle}` : ""}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-gray-200" onClick={onNext}>
                  Play Next
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setShowControls(false)}>
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New: On-Pause Info Panel overlay (Hotstar-style) */}
        <AnimatePresence>
          {userPaused && !error && (
            <>
              {/* Dim overlay */}
              <motion.div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              {/* Sliding info panel */}
              <motion.div
                className="absolute top-0 right-0 h-full w-full md:w-[380px] lg:w-[420px] bg-black/85 border-l border-white/10"
                initial={{ x: 480, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 480, opacity: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
              >
                <PlayerInfoPanel
                  title={ (typeof ( ( { title } )) !== "undefined") ? title : ( ( ( (typeof ( ( { title } )) !== "undefined") ? title : "" ) ) ) }
                  image={ (typeof ( ( { info } )) !== "undefined") ? ( (info?.image) ) : undefined }
                  description={ (typeof ( ( { info } )) !== "undefined") ? ( (info?.description) ) : undefined }
                  type={ (typeof ( ( { info } )) !== "undefined") ? ( (info?.type) ) : undefined }
                  language={ (typeof ( ( { info } )) !== "undefined") ? ( (info?.language) ) : undefined }
                  episodes={episodes}
                  currentEpisodeNumber={currentEpisode}
                  onSelectEpisode={onSelectEpisode}
                  onClose={() => {
                    // resume playback on close
                    setUserPaused(false);
                    const v = videoRef.current;
                    if (v) v.play();
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}