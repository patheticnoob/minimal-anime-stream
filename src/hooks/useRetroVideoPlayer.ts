import { useEffect, useRef, useState, useCallback, RefObject } from "react";

interface UseRetroVideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  source: string;
  tracks?: Array<{ file: string; label?: string; kind?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  resumeFrom?: number;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
}

export function useRetroVideoPlayer({
  videoRef,
  containerRef,
  source,
  tracks,
  intro,
  outro,
  resumeFrom,
  onProgressUpdate,
}: UseRetroVideoPlayerProps) {
  const hlsRef = useRef<any>(null);
  const hasRestoredProgress = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("off");

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
  }, [source, resumeFrom, videoRef]);

  // Sync subtitle tracks
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      setSelectedSubtitle(getTrackLabel(tracks[0], 0));
    } else {
      setSelectedSubtitle("off");
    }
  }, [tracks, source]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncTracks = () => {
      const textTracks = video.textTracks;
      for (let i = 0; i < textTracks.length; i += 1) {
        const derivedLabel =
          tracks && tracks[i]
            ? getTrackLabel(tracks[i], i)
            : textTracks[i].label || `Track ${i + 1}`;
        textTracks[i].mode =
          selectedSubtitle !== "off" && derivedLabel === selectedSubtitle
            ? "showing"
            : "disabled";
      }
    };

    syncTracks();
    video.addEventListener("loadeddata", syncTracks);
    return () => {
      video.removeEventListener("loadeddata", syncTracks);
    };
  }, [selectedSubtitle, tracks, source, videoRef]);

  // Resume from saved progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!resumeFrom || resumeFrom <= 0) return;
    if (hasRestoredProgress.current) return;

    const applyResume = () => {
      if (hasRestoredProgress.current) return;
      if (video.currentTime <= 1) {
        video.currentTime = resumeFrom;
      }
      hasRestoredProgress.current = true;
    };

    if (video.readyState >= 1) {
      applyResume();
      return;
    }

    const handleLoadedMetadata = () => {
      applyResume();
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, [resumeFrom, source, videoRef]);

  // Update progress and skip buttons
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

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [onProgressUpdate, intro, outro, source, videoRef]);

  // Subtitle positioning based on controls visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const styleId = "subtitle-position-style-retro";
    const translateValue = showControls ? "-120px" : "-60px";
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      video[data-retro-player="true"]::-webkit-media-text-track-container {
        transform: translateY(${translateValue}) !important;
      }
      video[data-retro-player="true"]::cue {
        transform: translateY(${translateValue}) !important;
      }
    `;

    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [showControls, videoRef]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying, videoRef]);

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

  const handleSubtitleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubtitle(event.target.value);
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
  }, [containerRef]);

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

  const getTrackLabel = (
    track: { file: string; label?: string; kind?: string },
    index: number,
  ) => {
    const label = track.label || "";
    const trimmed = label.trim();
    if (trimmed.length > 0) return trimmed;
    if (track.kind) return track.kind.toUpperCase();
    return `Track ${index + 1}`;
  };

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    isLoading,
    buffered,
    showSkipIntro,
    showSkipOutro,
    selectedSubtitle,
    setShowControls,
    setSelectedSubtitle,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    skip,
    skipIntro,
    skipOutro,
    handleSeek,
    handleVolumeChange,
    handleSubtitleChange,
    formatTime,
    getTrackLabel,
  };
}
