import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface RetroVideoControlsProps {
  showControls: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  tracks?: Array<{ file: string; label?: string; kind?: string }>;
  selectedSubtitle: string;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTogglePlay: () => void;
  onSkip: (seconds: number) => void;
  onToggleMute: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubtitleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onToggleFullscreen: () => void;
  formatTime: (time: number) => string;
  getTrackLabel: (track: { file: string; label?: string; kind?: string }, index: number) => string;
}

export function RetroVideoControls({
  showControls,
  isPlaying,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  isFullscreen,
  tracks,
  selectedSubtitle,
  onSeek,
  onTogglePlay,
  onSkip,
  onToggleMute,
  onVolumeChange,
  onSubtitleChange,
  onToggleFullscreen,
  formatTime,
  getTrackLabel,
}: RetroVideoControlsProps) {
  return (
    <motion.div
      className={`absolute inset-0 z-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t-2 border-[#FF69B4]">
        {/* Progress Bar */}
        <div
          className="relative h-2 bg-[#1a1a2e] cursor-pointer border-b-2 border-[#FF69B4]/30"
          onClick={onSeek}
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
              onClick={onTogglePlay} 
              className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button 
              onClick={() => onSkip(-10)} 
              className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
            >
              <SkipBack size={18} />
            </button>

            <button 
              onClick={() => onSkip(10)} 
              className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
            >
              <SkipForward size={18} />
            </button>

            <div className="flex items-center gap-2 relative group">
              <button 
                onClick={onToggleMute} 
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
                onChange={onVolumeChange}
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
                  onChange={onSubtitleChange}
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
              onClick={onToggleFullscreen}
              className="text-[#FF69B4] hover:text-[#FF1493] p-2 transition-colors border-2 border-[#FF69B4] bg-black/50 hover:bg-black"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
