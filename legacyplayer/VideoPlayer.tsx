import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  Loader2,
  Subtitles,
  X,
} from "lucide-react";

interface VideoPlayerProps {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  onClose: () => void;
  onNext?: () => void;
  nextTitle?: string;
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
  resumeFrom 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const hasRestoredProgress = useRef(false);

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
            video.play().catch(() => {});
          });

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) {
              console.error("HLS Error:", data);
              setIsLoading(false);
            }
          });

          hlsRef.current = hls;
          return () => hls.destroy();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", () => {
            setIsLoading(false);
            if (resumeFrom && resumeFrom > 0 && !hasRestoredProgress.current) {
              video.currentTime = resumeFrom;
              hasRestoredProgress.current = true;
            }
            video.play().catch(() => {});
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
        video.play().catch(() => {});
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

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
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

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
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
      container.requestFullscreen().catch(() => {});
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

  // Load subtitle tracks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSubtitles = () => {
      const tracksList: Array<{ index: number; label: string; language: string }> = [];
      for (let i = 0; i < video.textTracks.length; i++) {
        tracksList.push({
          index: i,
          label: video.textTracks[i].label || video.textTracks[i].language || `Track ${i + 1}`,
          language: video.textTracks[i].language || "",
        });
      }
      setSubtitles(tracksList);

      // Auto-enable English subtitles
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
          setVolume((v) => Math.min(1, v + 0.1));
          if (videoRef.current) videoRef.current.volume = Math.min(1, volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          if (videoRef.current) videoRef.current.volume = Math.max(0, volume - 0.1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [togglePlay, toggleFullscreen, volume]);

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

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-[80] bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Close Button */}
        <motion.div
          className="absolute top-4 right-4 z-[100]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
        >
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
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
              srcLang={track.label?.slice(0, 2)?.toLowerCase() || "en"}
            />
          ))}
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
          </div>
        )}

        {/* Skip Intro Button */}
        <AnimatePresence>
          {showSkipIntro && (
            <motion.div
              className="absolute bottom-24 right-8 z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={skipIntro}
                className="bg-white/90 hover:bg-white text-black font-semibold px-6 py-2 rounded-md shadow-lg"
              >
                Skip Intro
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Outro Button */}
        <AnimatePresence>
          {showSkipOutro && (
            <motion.div
              className="absolute bottom-24 right-8 z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={skipOutro}
                className="bg-white/90 hover:bg-white text-black font-semibold px-6 py-2 rounded-md shadow-lg"
              >
                Skip Outro
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
              >
                <Play className="h-10 w-10 text-white fill-white ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Overlay */}
        <motion.div
          className={`absolute inset-0 z-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Top Gradient */}
          <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[180px] bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            {/* Progress Bar */}
            <div
              className="relative h-1.5 bg-white/20 cursor-pointer mb-4 rounded-full overflow-hidden hover:h-2 transition-all"
              onClick={handleSeek}
            >
              <div className="absolute top-0 left-0 h-full bg-white/30 pointer-events-none" style={{ width: `${buffered}%` }} />
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-blue-600 pointer-events-none transition-all" style={{ width: `${(currentTime / duration) * 100}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 pointer-events-none transition-opacity"
                style={{ left: `${(currentTime / duration) * 100}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="text-white hover:bg-white/15 p-2 rounded transition-all hover:scale-110">
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button onClick={() => skip(-10)} className="text-white hover:bg-white/15 p-2 rounded transition-all hover:scale-110">
                  <SkipBack size={22} />
                </button>

                <button onClick={() => skip(10)} className="text-white hover:bg-white/15 p-2 rounded transition-all hover:scale-110">
                  <SkipForward size={22} />
                </button>

                <div className="flex items-center gap-2 relative group">
                  <button onClick={toggleMute} className="text-white hover:bg-white/15 p-2 rounded transition-all hover:scale-110">
                    {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all h-1 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>

                <div className="text-white text-sm font-medium ml-2 select-none">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSubtitles(!showSubtitles);
                      setShowSettings(false);
                    }}
                    className={`text-white hover:bg-white/15 p-2 rounded transition-all hover:scale-110 ${currentSubtitle >= 0 ? "bg-blue-600/30 text-blue-400" : ""}`}
                  >
                    <Subtitles size={22} />
                  </button>

                  {showSubtitles && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-xl rounded-lg p-3 min-w-[200px] shadow-2xl border border-white/10">
                      <div className="text-white/60 text-xs font-semibold uppercase tracking-wide px-4 py-2">Subtitles</div>
                      <button
                        onClick={() => changeSubtitle(-1)}
                        className={`block w-full text-left px-4 py-2.5 text-white text-sm hover:bg-white/10 transition-colors ${currentSubtitle === -1 ? "bg-blue-600/20 text-blue-400" : ""}`}
                      >
                        Off {currentSubtitle === -1 && "✓"}
                      </button>
                      {subtitles.map((subtitle) => (
                        <button
                          key={subtitle.index}
                          onClick={() => changeSubtitle(subtitle.index)}
                          className={`block w-full text-left px-4 py-2.5 text-white text-sm hover:bg-white/10 transition-colors ${currentSubtitle === subtitle.index ? "bg-blue-600/20 text-blue-400" : ""}`}
                        >
                          {subtitle.label} {currentSubtitle === subtitle.index && "✓"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setShowSubtitles(false);
                    }}
                    className="text-white hover:bg-white/15 p-2 rounded transition-all hover:scale-110"
                  >
                    <Settings size={22} />
                  </button>

                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-xl rounded-lg p-3 min-w-[200px] shadow-2xl border border-white/10">
                      <div className="text-white/60 text-xs font-semibold uppercase tracking-wide px-4 py-2">Playback Speed</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full text-left px-4 py-2.5 text-white text-sm hover:bg-white/10 transition-colors ${playbackRate === rate ? "bg-blue-600/20 text-blue-400" : ""}`}
                        >
                          {rate}x {playbackRate === rate && "✓"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={toggleFullscreen} className="text-white hover:bg-white/15 p-2 rounded transition-all hover:scale-110">
                  {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
