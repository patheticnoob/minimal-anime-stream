import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string }>;
  onClose: () => void;
}

export function VideoPlayer({ source, title, tracks, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    // Load HLS if needed
    if (source.includes(".m3u8") || source.includes("/proxy?url=")) {
      import("hls.js").then((HlsModule) => {
        const Hls = HlsModule.default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            xhrSetup: (xhr, url) => {
              // For proxied sources, we need to proxy all segment requests too
              if (source.includes("/proxy?url=")) {
                // This is already a proxied URL, don't modify
                return;
              }
              // For direct URLs, set referer
              xhr.setRequestHeader("Referer", "https://megacloud.blog/");
            },
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("HLS manifest loaded successfully");
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            console.error("HLS error:", data);
            if (data.fatal) {
              setError("Failed to load video stream.");
              setIsLoading(false);
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        }
      });
    } else {
      video.src = source;
    }

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
    };
  }, [source]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
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

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
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

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          crossOrigin="anonymous"
        >
          {tracks?.map((track, idx) => (
            <track
              key={idx}
              kind={track.kind || "subtitles"}
              src={track.file}
              label={track.label || "Unknown"}
              srcLang={track.label?.toLowerCase() || "en"}
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
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        >
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full mb-4 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}