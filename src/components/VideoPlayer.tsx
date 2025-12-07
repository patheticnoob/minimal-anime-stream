import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { VideoPlayerUI } from "@/components/VideoPlayerUI";
import { VideoSkipButtons } from "@/components/VideoSkipButtons";
import { VideoProgressBar } from "@/components/VideoProgressBar";
import { VideoPlayerControls } from "@/components/VideoPlayerControls";

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
  const {
    videoRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isFullscreen,
    setIsFullscreen,
    isLoading,
    setIsLoading,
    playbackRate,
    setPlaybackRate,
    buffered,
    setBuffered,
    togglePlay,
    toggleFullscreen,
  } = useVideoPlayer(source, resumeFrom);

  const controlsTimeoutRef = useRef<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<number | -1>(-1);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [audioTracks] = useState<Array<{ name: string; id: number }>>([]);
  const [currentAudio] = useState(0);

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
  }, [onProgressUpdate, intro, outro, setIsPlaying, setCurrentTime, setDuration, setBuffered, setIsLoading]);

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
  }, [setIsFullscreen]);

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
  }, [togglePlay, toggleFullscreen, volume]);

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
        <VideoPlayerUI
          title={title}
          showControls={showControls}
          isPlaying={isPlaying}
          onClose={onClose}
          onTogglePlay={togglePlay}
        >
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

          <VideoSkipButtons
            showSkipIntro={showSkipIntro}
            showSkipOutro={showSkipOutro}
            onSkipIntro={skipIntro}
            onSkipOutro={skipOutro}
            onNext={onNext}
            nextTitle={nextTitle}
          />

          <motion.div
            className={`absolute inset-0 z-10 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            data-testid="video-controls"
          >
            <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[180px] bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              <VideoProgressBar
                currentTime={currentTime}
                duration={duration}
                buffered={buffered}
                onSeek={handleSeek}
              />

              <VideoPlayerControls
                isPlaying={isPlaying}
                isMuted={isMuted}
                isFullscreen={isFullscreen}
                volume={volume}
                currentTime={currentTime}
                duration={duration}
                showVolume={showVolume}
                playbackRate={playbackRate}
                currentSubtitle={currentSubtitle}
                audioTracks={audioTracks}
                currentAudio={currentAudio}
                videoRef={videoRef}
                onTogglePlay={togglePlay}
                onToggleMute={toggleMute}
                onToggleFullscreen={toggleFullscreen}
                onVolumeChange={handleVolumeChange}
                onSetVolume={setShowVolume}
                onSkipBackward={() => skip(-10)}
                onSkipForward={() => skip(10)}
                onSetPlaybackRate={handleSetPlaybackRate}
                onSetSubtitle={handleSetSubtitle}
                onSetAudio={() => {}}
                onShowEpisodes={() => {}}
                formatTime={formatTime}
              />
            </div>
          </motion.div>
        </VideoPlayerUI>
      </motion.div>
    </AnimatePresence>
  );
}