import { useState } from "react";
import { motion } from "framer-motion";
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
  Subtitles,
} from "lucide-react";
import { formatTime } from "./NothingPlayerUtils";
import { findThumbnailForTime, type ThumbnailCue } from "@/lib/vttParser";

interface NothingPlayerControlsProps {
  showControls: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onSkip: (seconds: number) => void;
  showSubtitles: boolean;
  setShowSubtitles: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  subtitles: Array<{ index: number; label: string; language: string }>;
  currentSubtitle: number;
  onChangeSubtitle: (index: number) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  thumbnailCues: ThumbnailCue[];
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function NothingPlayerControls({
  showControls,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  buffered,
  onSeek,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onSkip,
  showSubtitles,
  setShowSubtitles,
  showSettings,
  setShowSettings,
  subtitles,
  currentSubtitle,
  onChangeSubtitle,
  playbackRate,
  onChangePlaybackRate,
  thumbnailCues,
  isDragging,
  onDragStart,
  onDragEnd,
}: NothingPlayerControlsProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState<{ url: string; x: number; width: number; height: number; spriteX: number; spriteY: number } | null>(null);

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!Number.isFinite(duration) || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    const pos = (clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (Number.isFinite(newTime)) {
      onSeek(newTime);
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (thumbnailCues.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const pos = (clientX - rect.left) / rect.width;
    const hoverTime = pos * duration;
    
    const thumbnail = findThumbnailForTime(thumbnailCues, hoverTime);
    
    if (thumbnail) {
      setThumbnailPreview({
        url: thumbnail.url,
        x: clientX - rect.left,
        width: thumbnail.width || 160,
        height: thumbnail.height || 90,
        spriteX: thumbnail.x || 0,
        spriteY: thumbnail.y || 0,
      });
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleProgressLeave = () => {
    if (!isDragging) {
      setThumbnailPreview(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    onDragStart();
    handleProgressHover(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handleProgressHover(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleSeekClick(e);
      onDragEnd();
      setThumbnailPreview(null);
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 z-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      data-testid="video-controls"
    >
      <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 px-3 md:px-5 pb-3 md:pb-5">
        <div
          className="relative h-1.5 bg-white/20 cursor-pointer mb-4 rounded-full overflow-visible hover:h-2 transition-all group touch-none"
          onClick={handleSeekClick}
          onMouseMove={handleProgressHover}
          onMouseLeave={handleProgressLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="video-progress-bar"
        >
          {thumbnailPreview && (
            <div
              className="absolute bottom-full mb-3 pointer-events-none z-50"
              style={{ 
                left: `${thumbnailPreview.x}px`, 
                transform: "translateX(-50%)",
              }}
            >
              <div className="relative">
                <div 
                  className="relative bg-black rounded-md overflow-hidden shadow-2xl border-2 border-white/20"
                  style={{
                    width: `${thumbnailPreview.width}px`,
                    height: `${thumbnailPreview.height}px`,
                  }}
                >
                  <img
                    src={thumbnailPreview.url}
                    alt="Video preview"
                    crossOrigin="anonymous"
                    style={{
                      width: `${thumbnailPreview.width}px`,
                      height: `${thumbnailPreview.height}px`,
                      objectFit: 'none',
                      objectPosition: `-${thumbnailPreview.spriteX}px -${thumbnailPreview.spriteY}px`,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/20"
                />
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 h-full bg-white/20 pointer-events-none rounded-full" style={{ width: `${buffered}%` }} />
          <div className="absolute top-0 left-0 h-full bg-[#ff4d4f] pointer-events-none transition-all rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border-2 border-[#ff4d4f]"
            style={{ left: `${(currentTime / duration) * 100}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={onTogglePlay} className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 bg-white/10" data-testid="play-pause-button">
              {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>

            <button onClick={() => onSkip(-10)} className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 bg-white/10" data-testid="skip-back-button">
              <SkipBack size={22} />
            </button>

            <button onClick={() => onSkip(10)} className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 bg-white/10" data-testid="skip-forward-button">
              <SkipForward size={22} />
            </button>

            <div className="flex items-center gap-2 relative group">
              <button onClick={onToggleMute} className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 bg-white/10" data-testid="mute-button">
                {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all h-1.5 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                data-testid="volume-slider"
              />
            </div>

            <div className="text-white text-xs font-mono font-bold ml-2 select-none bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10" data-testid="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitles(!showSubtitles);
                  setShowSettings(false);
                }}
                className={`text-white hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 ${currentSubtitle >= 0 ? "bg-[#ff4d4f] text-white" : "bg-white/10"}`}
                data-testid="subtitles-button"
              >
                <Subtitles size={22} />
              </button>

              {showSubtitles && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-xl rounded-3xl p-3 min-w-[220px] shadow-2xl border-2 border-white/30" data-testid="subtitles-menu">
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-3 border-b border-white/20">Subtitles</div>
                  <button
                    onClick={() => onChangeSubtitle(-1)}
                    className={`block w-full text-left px-4 py-3 text-white text-sm font-medium hover:bg-white/10 transition-colors rounded-lg ${currentSubtitle === -1 ? "bg-[#ff4d4f] text-white" : ""}`}
                    data-testid="subtitle-off"
                  >
                    Off {currentSubtitle === -1 && "✓"}
                  </button>
                  {subtitles.map((subtitle) => (
                    <button
                      key={subtitle.index}
                      onClick={() => onChangeSubtitle(subtitle.index)}
                      className={`block w-full text-left px-4 py-3 text-white text-sm font-medium hover:bg-white/10 transition-colors rounded-lg ${currentSubtitle === subtitle.index ? "bg-[#ff4d4f] text-white" : ""}`}
                      data-testid={`subtitle-${subtitle.language}`}
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
                className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 bg-white/10"
                data-testid="settings-button"
              >
                <Settings size={22} />
              </button>

              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-xl rounded-3xl p-3 min-w-[220px] shadow-2xl border-2 border-white/30" data-testid="settings-menu">
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-3 border-b border-white/20">Playback Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => onChangePlaybackRate(rate)}
                      className={`block w-full text-left px-4 py-3 text-white text-sm font-medium hover:bg-white/10 transition-colors rounded-lg ${playbackRate === rate ? "bg-[#ff4d4f] text-white" : ""}`}
                      data-testid={`playback-rate-${rate}`}
                    >
                      {rate}x {playbackRate === rate && "✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={onToggleFullscreen} className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 bg-white/10" data-testid="fullscreen-button">
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
