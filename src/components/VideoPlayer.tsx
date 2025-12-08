import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
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

export function VideoPlayer({
  source,
  title,
  tracks,
  intro,
  outro,
  onClose,
  onProgressUpdate,
  resumeFrom,
  onNext,
  nextTitle,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const hasRestoredProgress = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<number | -1>(-1);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [audioTracks] = useState<Array<{ name: string; id: number }>>([]);
  const [currentAudio] = useState(0);

  // Wake Lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && isFullscreen && isPlaying) {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.log("Wake Lock error:", err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.log("Wake Lock release error:", err);
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

  // Initialize HLS
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
                  xhr.setRequestHeader("Referer", "https://megacloud.blog/");
                } catch {}
              }
            },
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (resumeFrom && resumeFrom > 0 && !hasRestoredProgress.current) {
              video.currentTime = resumeFrom;
              hasRestoredProgress.current = true;
            }
            video.play().catch((err) => console.log("Autoplay prevented:", err));
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
              video.currentTime = resumeFrom;
              hasRestoredProgress.current = true;
            }
            video.play().catch((err) => console.log("Autoplay prevented:", err));
          });
        }
      });
    } else {
      video.src = source;
      video.addEventListener("loadedmetadata", () => {
        if (resumeFrom && resumeFrom > 0 && !hasRestoredProgress.current) {
          video.currentTime = resumeFrom;
          hasRestoredProgress.current = true;
        }
        video.play().catch((err) => console.log("Autoplay prevented:", err));
      });
    }
  }, [source, resumeFrom]);

  // Update progress
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
  }, [onProgressUpdate, intro, outro]);

  // Auto-hide controls
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

  // Adjust subtitle position
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "subtitle-position-style";

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

    const existingStyle = document.getElementById("subtitle-position-style");
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById("subtitle-position-style");
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [showControls]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Load subtitle tracks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSubtitles = () => {
      let englishTrackIndex = -1;
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        const label = (track.label || "").toLowerCase();
        const lang = (track.language || "").toLowerCase();

        if (label.includes("english") || lang === "en" || lang === "eng" || lang.startsWith("en-")) {
          englishTrackIndex = i;
          break;
        }
      }

      if (englishTrackIndex >= 0) {
        video.textTracks[englishTrackIndex].mode = "showing";
        setCurrentSubtitle(englishTrackIndex);
      }
    };

    video.addEventListener("loadedmetadata", updateSubtitles);
    return () => {
      video.removeEventListener("loadedmetadata", updateSubtitles);
    };
  }, []);

  // Keyboard shortcuts
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
          handleVolumeUp();
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeDown();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [volume, isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const toggleFullscreen = useCallback(() => {
    const container = document.getElementById("video-player-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleMouseMove = () => {
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

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isFullscreen) {
      togglePlay();
      return;
    }

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

    if (isInCenter) {
      togglePlay();
    }

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(duration) || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (Number.isFinite(newTime)) {
      video.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleVolumeUp = () => {
    const newVolume = Math.min(1, volume + 0.1);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
  };

  const handleVolumeDown = () => {
    const newVolume = Math.max(0, volume - 0.1);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
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

  const handleSetPlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleSetSubtitle = (trackIndex: number | -1) => {
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
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        id="video-player-container"
        className="fixed inset-0 z-[80] bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        data-testid="video-player-container"
      >
        {/* Close Button */}
        <motion.div
          className="absolute top-4 right-4 z-[100]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white"
            data-testid="close-button"
          >
            <X className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          className="absolute top-4 left-4 z-[90]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
        >
          <h2 className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded">
            {title}
          </h2>
        </motion.div>

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
              kind={track.kind || "subtitles"}
              src={track.file}
              label={track.label || "Unknown"}
              srcLang={track.label?.slice(0, 2)?.toLowerCase() || "en"}
            />
          ))}
        </video>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20" data-testid="video-loading">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
          </div>
        )}

        {/* Center Play/Pause Button */}
        <AnimatePresence>
          {showControls && !isPlaying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="w-20 h-20 bg-white/15 backdrop-blur-lg rounded-full flex items-center justify-center cursor-pointer border-2 border-white/30 hover:bg-white/25 hover:scale-110 transition-all pointer-events-auto"
                onClick={togglePlay}
                data-testid="video-center-button"
              >
                <Play className="h-10 w-10 text-white fill-white ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Intro Button */}
        <AnimatePresence>
          {showSkipIntro && (
            <motion.div
              className="absolute bottom-24 right-8 z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Button
                onClick={skipIntro}
                className="bg-white/90 hover:bg-white text-black font-semibold px-6 py-2 rounded-md shadow-lg"
              >
                Skip Intro
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Outro & Next Episode Buttons */}
        <AnimatePresence>
          {showSkipOutro && (
            <motion.div
              className="absolute bottom-24 right-8 z-20 flex gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Button
                onClick={skipOutro}
                className="bg-white/90 hover:bg-white text-black font-semibold px-6 py-2 rounded-md shadow-lg"
              >
                Skip Outro
              </Button>
              {onNext && nextTitle && (
                <Button
                  onClick={onNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-lg"
                >
                  Next Episode
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={`absolute inset-0 z-10 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          data-testid="video-controls"
        >
          <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[180px] bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            {/* Progress Bar */}
            <div
              className="relative h-1.5 bg-white/20 cursor-pointer mb-4 rounded-full overflow-hidden hover:h-2 transition-all"
              onClick={handleSeek}
              data-testid="video-progress-bar"
            >
              <div
                className="absolute top-0 left-0 h-full bg-white/30 pointer-events-none"
                style={{ width: `${buffered}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-blue-600 pointer-events-none transition-all"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 pointer-events-none transition-opacity"
                style={{
                  left: `${progress}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Left cluster */}
              <div className="flex items-center gap-2 md:gap-3">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={togglePlay} 
                  className="text-white hover:bg-white/10"
                  data-testid="play-pause-button"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => skip(-10)}
                  data-testid="skip-back-button"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => skip(10)}
                  data-testid="skip-forward-button"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>

                <Popover open={showVolume} onOpenChange={setShowVolume}>
                  <PopoverTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-white hover:bg-white/10"
                      data-testid="mute-button"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-40 bg-black/90 border-white/10 text-white">
                    <div className="px-2 py-1">
                      <Slider
                        value={[Math.round((volume || 0) * 100)]}
                        onValueChange={handleVolumeChange}
                        data-testid="volume-slider"
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <span className="text-white/90 text-xs md:text-sm tabular-nums" data-testid="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right cluster */}
              <div className="flex items-center gap-1 md:gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-white hover:bg-white/10"
                      data-testid="subtitles-button"
                    >
                      CC
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-black/90 text-white border-white/10" data-testid="subtitles-menu">
                    <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleSetSubtitle(-1)}
                      data-testid="subtitle-off"
                    >
                      {currentSubtitle === -1 ? "✓ " : ""} Off
                    </DropdownMenuItem>
                    {(videoRef.current?.textTracks ? Array.from(videoRef.current.textTracks) : []).map((t, i) => (
                      <DropdownMenuItem 
                        key={i} 
                        className="cursor-pointer" 
                        onClick={() => handleSetSubtitle(i)}
                        data-testid={`subtitle-${t.language || i}`}
                      >
                        {currentSubtitle === i ? "✓ " : ""}{t.label || `Track ${i + 1}`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {audioTracks.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">Audio</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-black/90 text-white border-white/10">
                      <DropdownMenuLabel>Audio Track</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {audioTracks.map((a) => (
                        <DropdownMenuItem key={a.id} className="cursor-pointer">
                          {currentAudio === a.id ? "✓ " : ""} {a.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-white hover:bg-white/10"
                      data-testid="settings-button"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-black/90 text-white border-white/10" data-testid="settings-menu">
                    <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {playbackRates.map((rate) => (
                      <DropdownMenuItem 
                        key={rate} 
                        className="cursor-pointer" 
                        onClick={() => handleSetPlaybackRate(rate)}
                        data-testid={`playback-rate-${rate}`}
                      >
                        {playbackRate === rate ? "✓ " : ""} {rate}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  data-testid="episodes-button"
                >
                  Episodes
                </Button>

                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={toggleFullscreen} 
                  className="text-white hover:bg-white/10"
                  data-testid="fullscreen-button"
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}