import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, Settings } from 'lucide-react';
import { useVideoAds } from '@/hooks/use-video-ads';
import { toast } from 'sonner';

interface ClassicVideoPlayerProps {
  src: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  headers?: Record<string, string> | null;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  initialTime?: number;
  nextEpisodeTitle?: string;
  adTagUrl?: string;
}

export function ClassicVideoPlayer({
  src,
  tracks = [],
  intro,
  outro,
  headers,
  onProgress,
  onEnded,
  initialTime = 0,
  adTagUrl = 'https://youradexchange.com/video/select.php?r=10987246',
}: ClassicVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState(false);

  const { adPlaying, playAds } = useVideoAds({
    videoElement: videoRef.current,
    adTagUrl,
    onAdStart: () => {
      toast.info('Playing advertisement...');
    },
    onAdComplete: () => {
      toast.success('Advertisement complete');
    },
    onAdError: (error) => {
      console.error('Ad error:', error);
    },
  });

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr) => {
            if (headers) {
              Object.entries(headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
              });
            }
          },
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setBuffering(false);
          if (initialTime > 0) {
            video.currentTime = initialTime;
          }
          // Play ads first, then video
          playAds();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data);
            toast.error('Video playback error');
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        playAds();
      }
    } else {
      video.src = src;
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      playAds();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, headers, initialTime, playAds]);

  // Load subtitles
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Remove existing tracks
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    // Add new tracks
    tracks.forEach((track, index) => {
      const trackElement = document.createElement('track');
      trackElement.kind = (track.kind as TextTrackKind) || 'subtitles';
      trackElement.label = track.label;
      trackElement.src = track.file;
      trackElement.default = track.default || index === 0;
      video.appendChild(trackElement);
    });

    if (tracks.length > 0) {
      setSelectedSubtitle(0);
    }
  }, [tracks]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const dur = video.duration;
      setCurrentTime(current);
      setDuration(dur);

      // Check for skip intro/outro
      if (intro && current >= intro.start && current <= intro.end) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }

      if (outro && current >= outro.start && current <= outro.end) {
        setShowSkipOutro(true);
      } else {
        setShowSkipOutro(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleWaiting = () => setBuffering(true);
    const handleCanPlay = () => setBuffering(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    // Progress save interval
    progressIntervalRef.current = setInterval(() => {
      if (video.currentTime > 0 && video.duration > 0) {
        onProgress?.(video.currentTime, video.duration);
      }
    }, 5000);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [intro, outro, onProgress, onEnded]);

  // Control visibility
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skipIntro = useCallback(() => {
    if (intro) {
      handleSeek(intro.end);
      toast.success('Skipped intro');
    }
  }, [intro, handleSeek]);

  const skipOutro = useCallback(() => {
    if (outro) {
      handleSeek(outro.end);
      toast.success('Skipped outro');
    }
  }, [outro, handleSeek]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onClick={togglePlay}
    >
      {/* Ad Container */}
      <div id="ad-container" className="absolute inset-0 z-50" />

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={(e) => e.stopPropagation()}
      />

      {/* Buffering Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white" />
        </div>
      )}

      {/* Skip Intro Button */}
      {showSkipIntro && !adPlaying && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            skipIntro();
          }}
          className="absolute bottom-24 right-4 z-30 bg-white/90 text-black hover:bg-white"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Intro
        </Button>
      )}

      {/* Skip Outro Button */}
      {showSkipOutro && !adPlaying && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            skipOutro();
          }}
          className="absolute bottom-24 right-4 z-30 bg-white/90 text-black hover:bg-white"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Outro
        </Button>
      )}

      {/* Controls */}
      {showControls && !adPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-30">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {tracks.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings(!showSettings);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-4 bg-black/90 rounded-lg p-4 z-40 min-w-[200px]">
          <h3 className="text-white font-semibold mb-2">Subtitles</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedSubtitle(-1);
                if (videoRef.current) {
                  Array.from(videoRef.current.textTracks).forEach((track) => {
                    track.mode = 'disabled';
                  });
                }
              }}
              className={`w-full text-left px-2 py-1 rounded ${
                selectedSubtitle === -1 ? 'bg-white/20 text-white' : 'text-gray-400'
              }`}
            >
              Off
            </button>
            {tracks.map((track, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedSubtitle(index);
                  if (videoRef.current) {
                    Array.from(videoRef.current.textTracks).forEach((t, i) => {
                      t.mode = i === index ? 'showing' : 'disabled';
                    });
                  }
                }}
                className={`w-full text-left px-2 py-1 rounded ${
                  selectedSubtitle === index ? 'bg-white/20 text-white' : 'text-gray-400'
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
