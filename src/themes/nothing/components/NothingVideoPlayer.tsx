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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    };

    const handlePause = () => {
      setIsPlaying(false);
      reportProgress(video);
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
  }, [intro, outro, onProgressUpdate, reportProgress, resumeFrom, currentSubtitle]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
  };

  const seekTo = (percentage: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(duration) || duration <= 0) return;
    video.currentTime = (percentage / 100) * duration;
  };

  const changeVolume = (nextVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = nextVolume;
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
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
  };

  return (
    <div ref={containerRef} className="nothing-player-shell">
      <div className="relative aspect-video nothing-player-surface">
        <video
          ref={videoRef}
          className="h-full w-full object-cover rounded-[32px]"
          playsInline
          crossOrigin="anonymous"
          onClick={togglePlay}
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

        <div className="absolute top-5 left-6 flex items-center gap-3 text-white/80 font-semibold tracking-[0.2em] text-xs">
          <span className="nothing-brand-dot" />
          Nothing Anime
        </div>

        {(title || episodeLabel) && (
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

        {showIntroCta && intro && (
          <button
            onClick={() => seekTo((intro.end / (duration || intro.end)) * 100)}
            className="nothing-chip absolute top-5 right-5"
          >
            Skip Intro
          </button>
        )}

        {showOutroCta && outro && (
          <div className="absolute top-5 right-5 flex gap-3">
            <button
              onClick={() => seekTo((outro.end / (duration || outro.end)) * 100)}
              className="nothing-chip"
            >
              Skip Outro
            </button>
            {onNext && nextTitle && (
              <button onClick={onNext} className="nothing-chip nothing-chip-accent">
                Next • {nextTitle}
              </button>
            )}
          </div>
        )}

        <div className="nothing-player-controls">
          <div className="nothing-player-slider">
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
            />
          </div>

          <div className="flex items-center justify-between text-white/80 text-xs sm:text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white">
            <button onClick={() => skip(-10)} className="nothing-player-btn" aria-label="Back 10 seconds">
              <RotateCcw className="h-5 w-5" />
            </button>
            <button onClick={togglePlay} className="nothing-player-btn nothing-player-btn-primary" aria-label="Play/Pause">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => skip(10)} className="nothing-player-btn" aria-label="Forward 10 seconds">
              <RotateCw className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pl-2">
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
                className="nothing-volume-slider"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSubtitleMenu((prev) => !prev)}
                className={`nothing-player-btn ${currentSubtitle >= 0 ? "text-[#ff4d4f]" : ""}`}
                aria-label="Subtitles"
              >
                <Captions className="h-5 w-5" />
              </button>
              {showSubtitleMenu && (
                <div className="nothing-dropdown absolute bottom-full right-0 mb-3">
                  <button onClick={() => changeSubtitle(-1)} className="nothing-dropdown-item">
                    {currentSubtitle === -1 ? "✓ " : ""}Off
                  </button>
                  {subtitles.map((track) => (
                    <button
                      key={track.index}
                      onClick={() => changeSubtitle(track.index)}
                      className="nothing-dropdown-item"
                    >
                      {currentSubtitle === track.index ? "✓ " : ""}
                      {track.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="nothing-player-btn ml-auto" aria-label="Fullscreen">
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {nextTitle && onNext && (
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