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

  const buttonClass = "text-white hover:bg-white/20 p-3 rounded-full transition-all hover:scale-105 bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center w-12 h-12";
  const activeButtonClass = "bg-[#ff4d4f] text-white hover:bg-[#ff4d4f]/90 border-[#ff4d4f]";

  return (
    <motion.div
      className={`absolute inset-0 z-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      data-testid="video-controls"
    >
      <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:px-8 md:pb-8">
        {/* Progress Bar */}
        <div
          className="relative h-1.5 bg-white/10 cursor-pointer mb-6 rounded-full overflow-visible hover:h-2 transition-all group touch-none"
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
              className="absolute bottom-full mb-4 pointer-events-none z-50"
              style={{ 
                left: `${thumbnailPreview.x}px`, 
                transform: "translateX(-50%)",
              }}
            >
              <div className="relative">
                <div 
                  className="relative bg-black rounded-lg overflow-hidden shadow-2xl border border-white/20"
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
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-mono text-center py-0.5">
                    {formatTime((thumbnailPreview.x / (containerRef?.current?.clientWidth || 1)) * duration)}
                  </div>
                </div>
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/20"
                />
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 h-full bg-white/20 pointer-events-none rounded-full" style={{ width: `${buffered}%` }} />
          <div className="absolute top-0 left-0 h-full bg-[#ff4d4f] pointer-events-none transition-all rounded-full shadow-[0_0_10px_rgba(255,77,79,0.5)]" style={{ width: `${(currentTime / duration) * 100}%` }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border-2 border-[#ff4d4f]"
            style={{ left: `${(currentTime / duration) * 100}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onTogglePlay} className={buttonClass} data-testid="play-pause-button">
              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
            </button>

            <button onClick={() => onSkip(-10)} className={buttonClass} data-testid="skip-back-button">
              <SkipBack size={18} />
            </button>

            <button onClick={() => onSkip(10)} className={buttonClass} data-testid="skip-forward-button">
              <SkipForward size={18} />
            </button>

            <div className="flex items-center gap-3 relative group ml-2">
              <button onClick={onToggleMute} className={buttonClass} data-testid="mute-button">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300 ease-out">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1.5 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                  data-testid="volume-slider"
                />
              </div>
            </div>

            <div className="hidden md:flex flex-col justify-center ml-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 min-w-[100px]" data-testid="time-display">
              <span className="text-[#ff4d4f] text-xs font-mono font-bold leading-none mb-1">{formatTime(currentTime)}</span>
              <span className="text-white/40 text-[10px] font-mono font-medium leading-none">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitles(!showSubtitles);
                  setShowSettings(false);
                }}
                className={`${buttonClass} ${currentSubtitle >= 0 ? activeButtonClass : ""}`}
                data-testid="subtitles-button"
              >
                <Subtitles size={20} />
              </button>

              {showSubtitles && (
                <div className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-xl rounded-2xl p-2 min-w-[240px] shadow-2xl border border-white/10 overflow-hidden z-50" data-testid="subtitles-menu">
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-3 border-b border-white/10">Subtitles</div>
                  <div className="max-h-[300px] overflow-y-auto py-2 custom-scrollbar">
                    <button
                      onClick={() => onChangeSubtitle(-1)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${currentSubtitle === -1 ? "text-[#ff4d4f]" : "text-white hover:bg-white/10"}`}
                      data-testid="subtitle-off"
                    >
                      <span>Off</span>
                      {currentSubtitle === -1 && <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]" />}
                    </button>
                    {subtitles.map((subtitle) => (
                      <button
                        key={subtitle.index}
                        onClick={() => onChangeSubtitle(subtitle.index)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${currentSubtitle === subtitle.index ? "text-[#ff4d4f]" : "text-white hover:bg-white/10"}`}
                        data-testid={`subtitle-${subtitle.language}`}
                      >
                        <span className="truncate pr-4">{subtitle.label}</span>
                        {currentSubtitle === subtitle.index && <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowSubtitles(false);
                }}
                className={buttonClass}
                data-testid="settings-button"
              >
                <Settings size={20} />
              </button>

              {showSettings && (
                <div className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-xl rounded-2xl p-2 min-w-[200px] shadow-2xl border border-white/10 overflow-hidden z-50" data-testid="settings-menu">
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-3 border-b border-white/10">Playback Speed</div>
                  <div className="py-2">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => onChangePlaybackRate(rate)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${playbackRate === rate ? "text-[#ff4d4f]" : "text-white hover:bg-white/10"}`}
                        data-testid={`playback-rate-${rate}`}
                      >
                        <span>{rate}x</span>
                        {playbackRate === rate && <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={onToggleFullscreen} className={buttonClass} data-testid="fullscreen-button">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper for container ref access in formatTime call
const containerRef = { current: { clientWidth: 0 } };