import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRetroVideoPlayer } from "@/hooks/useRetroVideoPlayer";
import { RetroVideoPlayerUI } from "@/components/RetroVideoPlayerUI";
import { RetroVideoSkipButtons } from "@/components/RetroVideoSkipButtons";
import { RetroVideoControls } from "@/components/RetroVideoControls";

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
  const controlsTimeoutRef = useRef<number | null>(null);

  const {
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
  } = useRetroVideoPlayer({
    videoRef,
    containerRef,
    source,
    tracks,
    intro,
    outro,
    resumeFrom,
    onProgressUpdate,
  });

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

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

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
        <RetroVideoPlayerUI
          title={title}
          showControls={showControls}
          onClose={onClose}
        />

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

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="h-16 w-16 animate-spin text-[#FF69B4]" style={{
              filter: 'drop-shadow(0 0 10px #FF69B4)'
            }} />
          </div>
        )}

        <RetroVideoSkipButtons
          showSkipIntro={showSkipIntro}
          showSkipOutro={showSkipOutro}
          onSkipIntro={skipIntro}
          onSkipOutro={skipOutro}
          onNext={onNext}
          nextTitle={nextTitle}
        />

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

        <RetroVideoControls
          showControls={showControls}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          tracks={tracks}
          selectedSubtitle={selectedSubtitle}
          onSeek={handleSeek}
          onTogglePlay={togglePlay}
          onSkip={skip}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          onSubtitleChange={handleSubtitleChange}
          onToggleFullscreen={toggleFullscreen}
          formatTime={formatTime}
          getTrackLabel={getTrackLabel}
        />
      </motion.div>
    </AnimatePresence>
  );
}