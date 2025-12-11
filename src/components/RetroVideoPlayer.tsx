import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Loader2,
  X,
  Cast,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCast } from "@/hooks/use-cast";

interface RetroVideoPlayerProps {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label?: string; kind?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  onClose: () => void;
  onNext?: () => void;
  nextTitle?: string;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  resumeFrom?: number;
}

export function RetroVideoPlayer({ 
  source, 
  title, 
  tracks, 
  intro, 
  outro, 
  onClose, 
  onProgressUpdate, 
  resumeFrom,
  onNext,
  nextTitle 
}: RetroVideoPlayerProps) {
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
  const [buffered, setBuffered] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("off");

  const { isCasting, castAvailable, handleCastClick } = useCast(source, title, tracks);

  // Pause video when casting starts
  useEffect(() => {
    if (isCasting && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isCasting]);

  // Initialize HLS
=======
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
  const [buffered, setBuffered] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("off");

  const { isCasting, castAvailable, handleCastClick } = useCast(source, title, tracks);

  // Pause video when casting starts
  useEffect(() => {
    if (isCasting && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isCasting]);

  // Initialize HLS
>>>>>>> REPLACE
=======
interface RetroVideoPlayerProps {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label?: string; kind?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  onClose: () => void;
  onNext?: () => void;
  nextTitle?: string;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  resumeFrom?: number;
}

export function RetroVideoPlayer({ 
  source, 
  title, 
  tracks, 
  intro, 
  outro, 
  onClose, 
  onProgressUpdate, 
  resumeFrom,
  onNext,
  nextTitle 
}: RetroVideoPlayerProps) {
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
  const [buffered, setBuffered] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("off");

  const { isCasting, castAvailable, handleCastClick } = useCast(source, title, tracks);

  // Pause video when casting starts
  useEffect(() => {
    if (isCasting && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isCasting]);

  // Initialize HLS
=======
interface RetroVideoPlayerProps {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label?: string; kind?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  onClose: () => void;
  onNext?: () => void;
  nextTitle?: string;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  resumeFrom?: number;
}

export function RetroVideoPlayer({ 
  source, 
  title, 
  tracks, 
  intro, 
  outro, 
  onClose, 
  onProgressUpdate, 
  resumeFrom,
  onNext,
  nextTitle 
}: RetroVideoPlayerProps) {
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
  const [buffered, setBuffered] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("off");

  const { isCasting, castAvailable, handleCastClick } = useCast(source, title, tracks);

  // Pause video when casting starts
  useEffect(() => {
    if (isCasting && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isCasting]);

  // Initialize HLS
=======
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
  const [buffered, setBuffered] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("off");

  const { isCasting, castAvailable, handleCastClick } = useCast(source, title, tracks);

  // Pause video when casting starts
  useEffect(() => {
    if (isCasting && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isCasting]);

  // Initialize HLS
>>>>>>> REPLACE
              <div className="flex items-center gap-1">
                {castAvailable && (
                  <button
                    onClick={handleCastClick}
                    className={`text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black ${isCasting ? "bg-[#FF69B4]/20" : ""}`}
                    title="Cast to TV"
                  >
                    <Cast size={18} />
                  </button>
                )}
                {tracks && tracks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FF69B4]">
                    <span>Subs</span>
                    <select
                      value={selectedSubtitle}
                      onChange={handleSubtitleChange}
                      className="bg-black/70 border-2 border-[#FF69B4] text-[#FF69B4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]"
                    >
                      <option value="off">Off</option>
                      {tracks.map((track, idx) => {
                        const label = getTrackLabel(track, idx);
                        return (
                          <option key={`${label}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
=======
              <div className="flex items-center gap-1">
                {castAvailable && (
                  <button
                    onClick={handleCastClick}
                    className={`text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black ${isCasting ? "bg-[#FF69B4]/20" : ""}`}
                    title="Cast to TV"
                  >
                    <Cast size={18} />
                  </button>
                )}
                {tracks && tracks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FF69B4]">
                    <span>Subs</span>
                    <select
                      value={selectedSubtitle}
                      onChange={handleSubtitleChange}
                      className="bg-black/70 border-2 border-[#FF69B4] text-[#FF69B4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]"
                    >
                      <option value="off">Off</option>
                      {tracks.map((track, idx) => {
                        const label = getTrackLabel(track, idx);
                        return (
                          <option key={`${label}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
=======
              <div className="flex items-center gap-1">
                {castAvailable && (
                  <button
                    onClick={handleCastClick}
                    className={`text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black ${isCasting ? "bg-[#FF69B4]/20" : ""}`}
                    title="Cast to TV"
                  >
                    <Cast size={18} />
                  </button>
                )}
                {tracks && tracks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FF69B4]">
                    <span>Subs</span>
                    <select
                      value={selectedSubtitle}
                      onChange={handleSubtitleChange}
                      className="bg-black/70 border-2 border-[#FF69B4] text-[#FF69B4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]"
                    >
                      <option value="off">Off</option>
                      {tracks.map((track, idx) => {
                        const label = getTrackLabel(track, idx);
                        return (
                          <option key={`${label}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
>>>>>>> REPLACE
=======
              <div className="flex items-center gap-1">
                {castAvailable && (
                  <button
                    onClick={handleCastClick}
                    className={`text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black ${isCasting ? "bg-[#FF69B4]/20" : ""}`}
                    title="Cast to TV"
                  >
                    <Cast size={18} />
                  </button>
                )}
                {tracks && tracks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FF69B4]">
                    <span>Subs</span>
                    <select
                      value={selectedSubtitle}
                      onChange={handleSubtitleChange}
                      className="bg-black/70 border-2 border-[#FF69B4] text-[#FF69B4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]"
                    >
                      <option value="off">Off</option>
                      {tracks.map((track, idx) => {
                        const label = getTrackLabel(track, idx);
                        return (
                          <option key={`${label}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
=======
              <div className="flex items-center gap-1">
                {castAvailable && (
                  <button
                    onClick={handleCastClick}
                    className={`text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black ${isCasting ? "bg-[#FF69B4]/20" : ""}`}
                    title="Cast to TV"
                  >
                    <Cast size={18} />
                  </button>
                )}
                {tracks && tracks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FF69B4]">
                    <span>Subs</span>
                    <select
                      value={selectedSubtitle}
                      onChange={handleSubtitleChange}
                      className="bg-black/70 border-2 border-[#FF69B4] text-[#FF69B4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]"
                    >
                      <option value="off">Off</option>
                      {tracks.map((track, idx) => {
                        const label = getTrackLabel(track, idx);
                        return (
                          <option key={`${label}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
=======
              <div className="flex items-center gap-1">
                {castAvailable && (
                  <button
                    onClick={handleCastClick}
                    className={`text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black ${isCasting ? "bg-[#FF69B4]/20" : ""}`}
                    title="Cast to TV"
                  >
                    <Cast size={18} />
                  </button>
                )}
                {tracks && tracks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FF69B4]">
                    <span>Subs</span>
                    <select
                      value={selectedSubtitle}
                      onChange={handleSubtitleChange}
                      className="bg-black/70 border-2 border-[#FF69B4] text-[#FF69B4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]"
                    >
                      <option value="off">Off</option>
                      {tracks.map((track, idx) => {
                        const label = getTrackLabel(track, idx);
                        return (
                          <option key={`${label}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
  source: string;
  title: string;
  tracks?: Array<{ file: string; label?: string; kind?: string }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  onClose: () => void;
  onNext?: () => void;
  nextTitle?: string;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  resumeFrom?: number;
}

export function RetroVideoPlayer({ 
  source, 
  title, 
  tracks, 
  intro, 
  outro, 
  onClose, 
  onProgressUpdate, 
  resumeFrom,
  onNext,
  nextTitle 
}: RetroVideoPlayerProps) {
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
  }, [source]);

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
  }, [selectedSubtitle, tracks, source]);

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
  }, [resumeFrom, source]);

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
  }, [onProgressUpdate, intro, outro, source]);

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
  }, [showControls]);

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

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-[80] bg-[#0B0F19]"
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
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="bg-black/80 hover:bg-black border-2 border-[#FF69B4] text-[#FF69B4] font-mono uppercase"
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
          <h2 className="text-[#FF69B4] text-lg font-mono uppercase tracking-wider bg-black/80 px-4 py-2 border-2 border-[#FF69B4]" style={{
            textShadow: '0 0 10px #FF69B4'
          }}>
            {title}
          </h2>
        </motion.div>

        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          crossOrigin="anonymous"
          playsInline
          data-retro-player="true"
        >
          {tracks?.map((track, idx) => {
            const label = getTrackLabel(track, idx);
            return (
              <track
                key={`${label}-${idx}`}
                kind={track.kind || "subtitles"}
                src={track.file}
                label={label}
                srcLang={track.label?.slice(0, 2)?.toLowerCase() || "en"}
              />
            );
          })}
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="h-16 w-16 animate-spin text-[#FF69B4]" style={{
              filter: 'drop-shadow(0 0 10px #FF69B4)'
            }} />
          </div>
        )}

        {/* Skip Buttons */}
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
                className="bg-[#FF69B4] hover:bg-[#FF1493] text-black font-mono uppercase tracking-wider border-2 border-[#FF69B4] shadow-[0_0_10px_rgba(255,105,180,0.5)]"
              >
                Skip Intro
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="bg-[#FF69B4] hover:bg-[#FF1493] text-black font-mono uppercase tracking-wider border-2 border-[#FF69B4] shadow-[0_0_10px_rgba(255,105,180,0.5)]"
              >
                Skip Outro
              </Button>
              {onNext && nextTitle && (
                <Button
                  onClick={onNext}
                  className="bg-[#00FFAA] hover:bg-[#00DD88] text-black font-mono uppercase tracking-wider border-2 border-[#00FFAA] shadow-[0_0_10px_rgba(0,255,170,0.5)]"
                >
                  Next Episode
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Play/Pause */}
        <AnimatePresence>
          {showControls && !isPlaying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="w-24 h-24 bg-black/80 border-4 border-[#FF69B4] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform pointer-events-auto"
                onClick={togglePlay}
                style={{
                  boxShadow: '0 0 20px rgba(255, 105, 180, 0.5)'
                }}
              >
                <Play className="h-12 w-12 text-[#FF69B4] fill-[#FF69B4] ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Overlay */}
        <motion.div
          className={`absolute inset-0 z-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t-2 border-[#FF69B4]">
            {/* Progress Bar */}
            <div
              className="relative h-2 bg-[#1a1a2e] cursor-pointer border-b-2 border-[#FF69B4]/30"
              onClick={handleSeek}
            >
              <div className="absolute top-0 left-0 h-full bg-[#FF69B4]/30 pointer-events-none" style={{ width: `${buffered}%` }} />
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF69B4] to-[#FF1493] pointer-events-none transition-all" style={{ 
                width: `${(currentTime / duration) * 100}%`,
                boxShadow: '0 0 10px rgba(255, 105, 180, 0.8)'
              }} />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={togglePlay} 
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button 
                  onClick={() => skip(-10)} 
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  <SkipBack size={18} />
                </button>

                <button 
                  onClick={() => skip(10)} 
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  <SkipForward size={18} />
                </button>

                <div className="flex items-center gap-2 relative group">
                  <button 
                    onClick={toggleMute} 
                    className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all h-1 bg-[#1a1a2e] appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#FF69B4] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_5px_rgba(255,105,180,0.8)]"
                  />
                </div>

                <div className="text-[#FF69B4] text-sm font-mono ml-2 select-none tracking-wider">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {tracks && tracks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FF69B4]">
                    <span>Subs</span>
                    <select
                      value={selectedSubtitle}
                      onChange={handleSubtitleChange}
                      className="bg-black/70 border-2 border-[#FF69B4] text-[#FF69B4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF69B4]"
                    >
                      <option value="off">Off</option>
                      {tracks.map((track, idx) => {
                        const label = getTrackLabel(track, idx);
                        return (
                          <option key={`${label}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}