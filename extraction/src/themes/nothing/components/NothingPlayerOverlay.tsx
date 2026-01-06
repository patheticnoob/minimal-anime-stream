import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NothingPlayerOverlayProps {
  title: string;
  showControls: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  showSkipIntro: boolean;
  showSkipOutro: boolean;
  onSkipIntro: () => void;
  onSkipOutro: () => void;
  onNext?: () => void;
  nextTitle?: string;
  onTogglePlay: () => void;
}

export function NothingPlayerOverlay({
  title,
  showControls,
  isPlaying,
  isLoading,
  showSkipIntro,
  showSkipOutro,
  onSkipIntro,
  onSkipOutro,
  onNext,
  nextTitle,
  onTogglePlay,
}: NothingPlayerOverlayProps) {
  return (
    <>
      <motion.div
        className="absolute top-6 left-6 md:top-8 md:left-8 z-[90] max-w-[80%]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
      >
        <h2 className="text-white !text-white text-xs md:text-sm font-bold tracking-[0.15em] uppercase bg-black/80 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/10 inline-block">
          {title}
        </h2>
      </motion.div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-[2px]" data-testid="video-loading">
          <div className="relative">
            <div className="absolute inset-0 bg-[#ff4d4f] blur-xl opacity-20 rounded-full"></div>
            <Loader2 className="h-16 w-16 animate-spin text-[#ff4d4f] relative z-10" />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showSkipIntro && (
          <motion.div
            className="absolute bottom-32 left-8 z-20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Button
              onClick={onSkipIntro}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 font-bold px-6 py-6 rounded-full shadow-2xl tracking-wider text-xs uppercase flex items-center gap-2 group"
            >
              <SkipForward className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              Skip Intro
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSkipOutro && (
          <motion.div
            className="absolute bottom-32 right-8 z-20 flex gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Button
              onClick={onSkipOutro}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 font-bold px-6 py-6 rounded-full shadow-2xl tracking-wider text-xs uppercase flex items-center gap-2 group"
            >
              <SkipForward className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              Skip Outro
            </Button>
            {onNext && (
              <Button
                onClick={onNext}
                className="bg-[#ff4d4f] hover:bg-[#ff4d4f]/90 text-white font-bold px-8 py-6 rounded-full shadow-lg shadow-[#ff4d4f]/20 tracking-wider text-xs uppercase flex items-center gap-2"
              >
                Next Episode
                <SkipForward className="w-4 h-4 fill-white" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && !isPlaying && !isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div
              className="w-24 h-24 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer border border-white/10 hover:bg-black/50 hover:scale-105 transition-all pointer-events-auto shadow-2xl group"
              onClick={onTogglePlay}
              data-testid="video-center-button"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#ff4d4f] transition-colors duration-300">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}