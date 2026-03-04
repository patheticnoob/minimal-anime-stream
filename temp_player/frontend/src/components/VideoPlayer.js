import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
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
  Loader2,
  Subtitles,
} from 'lucide-react';
import './VideoPlayer.css';

const VideoPlayer = ({ src, poster, autoPlay = false, className = '' }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [buffered, setBuffered] = useState(0);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        if (autoPlay) {
          video.play();
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS Error:', data);
          setIsLoading(false);
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS support
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play();
        }
      });
    }
  }, [src, autoPlay]);

  // Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);

      // Update buffered
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', updateProgress);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (isPlaying) {
        setShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
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

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
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

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
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
      container.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const skip = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const changeSubtitle = (trackIndex) => {
    const video = videoRef.current;
    if (!video) return;

    // Disable all tracks
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = 'hidden';
    }

    // Enable selected track
    if (trackIndex >= 0 && trackIndex < video.textTracks.length) {
      video.textTracks[trackIndex].mode = 'showing';
      setCurrentSubtitle(trackIndex);
    } else {
      setCurrentSubtitle(-1); // Off
    }
    setShowSubtitles(false);
  };

  // Load subtitle tracks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSubtitles = () => {
      const tracks = [];
      for (let i = 0; i < video.textTracks.length; i++) {
        tracks.push({
          index: i,
          label: video.textTracks[i].label || video.textTracks[i].language || `Track ${i + 1}`,
          language: video.textTracks[i].language,
        });
      }
      setSubtitles(tracks);
    };

    video.addEventListener('loadedmetadata', updateSubtitles);
    return () => {
      video.removeEventListener('loadedmetadata', updateSubtitles);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          videoRef.current.volume = Math.min(1, volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          videoRef.current.volume = Math.max(0, volume - 0.1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [togglePlay, toggleFullscreen, skip, volume]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`video-player-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      data-testid="video-player-container"
    >
      <video
        ref={videoRef}
        className="video-element"
        poster={poster}
        onClick={togglePlay}
        data-testid="video-element"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="video-loading" data-testid="video-loading">
          <Loader2 className="spinner" size={48} />
        </div>
      )}

      {/* Center Play/Pause Button */}
      <div
        className={`video-center-button ${showControls ? 'visible' : ''}`}
        onClick={togglePlay}
        data-testid="video-center-button"
      >
        {!isPlaying && (
          <div className="center-play-btn">
            <Play size={60} fill="white" />
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className={`video-controls ${showControls ? 'visible' : ''}`} data-testid="video-controls">
        {/* Top Gradient */}
        <div className="video-gradient-top" />

        {/* Bottom Controls */}
        <div className="video-gradient-bottom" />
        <div className="video-controls-bottom">
          {/* Progress Bar */}
          <div className="video-progress-container" onClick={handleSeek} data-testid="video-progress-bar">
            <div className="video-progress-buffered" style={{ width: `${buffered}%` }} />
            <div className="video-progress-bar" style={{ width: `${(currentTime / duration) * 100}%` }} />
            <div
              className="video-progress-thumb"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="video-controls-row">
            <div className="video-controls-left">
              <button onClick={togglePlay} className="control-btn" data-testid="play-pause-button">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <button onClick={() => skip(-10)} className="control-btn" data-testid="skip-back-button">
                <SkipBack size={22} />
              </button>

              <button onClick={() => skip(10)} className="control-btn" data-testid="skip-forward-button">
                <SkipForward size={22} />
              </button>

              <div className="volume-control">
                <button onClick={toggleMute} className="control-btn" data-testid="mute-button">
                  {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  data-testid="volume-slider"
                />
              </div>

              <div className="time-display" data-testid="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="video-controls-right">
              <div className="settings-container">
                <button
                  onClick={() => {
                    setShowSubtitles(!showSubtitles);
                    setShowSettings(false);
                  }}
                  className={`control-btn ${currentSubtitle >= 0 ? 'subtitle-active' : ''}`}
                  data-testid="subtitles-button"
                >
                  <Subtitles size={22} />
                </button>

                {showSubtitles && (
                  <div className="settings-menu" data-testid="subtitles-menu">
                    <div className="settings-section">
                      <div className="settings-label">Subtitles</div>
                      <button
                        onClick={() => changeSubtitle(-1)}
                        className={`settings-option ${currentSubtitle === -1 ? 'active' : ''}`}
                        data-testid="subtitle-off"
                      >
                        Off {currentSubtitle === -1 && '✓'}
                      </button>
                      {subtitles.map((subtitle) => (
                        <button
                          key={subtitle.index}
                          onClick={() => changeSubtitle(subtitle.index)}
                          className={`settings-option ${currentSubtitle === subtitle.index ? 'active' : ''}`}
                          data-testid={`subtitle-${subtitle.language}`}
                        >
                          {subtitle.label} {currentSubtitle === subtitle.index && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="settings-container">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowSubtitles(false);
                  }}
                  className="control-btn"
                  data-testid="settings-button"
                >
                  <Settings size={22} />
                </button>

                {showSettings && (
                  <div className="settings-menu" data-testid="settings-menu">
                    <div className="settings-section">
                      <div className="settings-label">Playback Speed</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`settings-option ${playbackRate === rate ? 'active' : ''}`}
                          data-testid={`playback-rate-${rate}`}
                        >
                          {rate}x {playbackRate === rate && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="control-btn" data-testid="fullscreen-button">
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
