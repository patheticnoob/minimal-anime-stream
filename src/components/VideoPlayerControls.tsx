import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, Settings } from "lucide-react";

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  showVolume: boolean;
  playbackRate: number;
  currentSubtitle: number | -1;
  audioTracks: Array<{ name: string; id: number }>;
  currentAudio: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onTogglePlay: () => void;
  onToggleFullscreen: () => void;
  onVolumeChange: (value: number[]) => void;
  onSetVolume: (show: boolean) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onSetPlaybackRate: (rate: number) => void;
  onSetSubtitle: (idx: number | -1) => void;
  onSetAudio: (id: number) => void;
  onShowEpisodes: () => void;
  formatTime: (seconds: number) => string;
}

export default function VideoPlayerControls({
  isPlaying,
  isMuted,
  volume,
  currentTime,
  duration,
  isFullscreen,
  showVolume,
  playbackRate,
  currentSubtitle,
  audioTracks,
  currentAudio,
  videoRef,
  onTogglePlay,
  onToggleFullscreen,
  onVolumeChange,
  onSetVolume,
  onSkipBackward,
  onSkipForward,
  onSetPlaybackRate,
  onSetSubtitle,
  onSetAudio,
  onShowEpisodes,
  formatTime,
}: VideoPlayerControlsProps) {
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Left cluster */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onTogglePlay} 
          className="text-white hover:bg-white/10"
          data-testid="play-pause-button"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        {/* Rewind 10s */}
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={onSkipBackward}
          data-testid="skip-back-button"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {/* Forward 10s */}
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={onSkipForward}
          data-testid="skip-forward-button"
        >
          <RotateCw className="h-5 w-5" />
        </Button>

        {/* Volume with popover slider */}
        <Popover open={showVolume} onOpenChange={onSetVolume}>
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
                onValueChange={onVolumeChange}
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
        {/* Subtitles menu */}
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
              onClick={() => onSetSubtitle(-1)}
              data-testid="subtitle-off"
            >
              {currentSubtitle === -1 ? "✓ " : ""} Off
            </DropdownMenuItem>
            {(videoRef.current?.textTracks ? Array.from(videoRef.current.textTracks) : []).map((t, i) => (
              <DropdownMenuItem 
                key={i} 
                className="cursor-pointer" 
                onClick={() => onSetSubtitle(i)}
                data-testid={`subtitle-${t.language || i}`}
              >
                {currentSubtitle === i ? "✓ " : ""}{t.label || `Track ${i + 1}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Audio menu (if any) */}
        {audioTracks.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">Audio</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-black/90 text-white border-white/10">
              <DropdownMenuLabel>Audio Track</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {audioTracks.map((a) => (
                <DropdownMenuItem key={a.id} className="cursor-pointer" onClick={() => onSetAudio(a.id)}>
                  {currentAudio === a.id ? "✓ " : ""} {a.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Playback Speed Settings */}
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
                onClick={() => onSetPlaybackRate(rate)}
                data-testid={`playback-rate-${rate}`}
              >
                {playbackRate === rate ? "✓ " : ""} {rate}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Episodes overlay trigger */}
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={onShowEpisodes}
          data-testid="episodes-button"
        >
          Episodes
        </Button>

        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onToggleFullscreen} 
          className="text-white hover:bg-white/10"
          data-testid="fullscreen-button"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}