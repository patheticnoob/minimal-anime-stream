import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
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
        className="absolute top-4 left-4 z-[90]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
      >
        <h2 className="text-white text-xs font-bold tracking-[0.2em] uppercase bg-black/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-2xl border border-white/20">
          {title}
        </h2>
      </motion.div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20" data-testid="video-loading">
          <Loader2 className="h-16 w-16 animate-spin text-white" />
        </div>
      )}

      <AnimatePresence>
        {showSkipIntro && (
          <motion.div
            className="absolute bottom-24 right-8 z-20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Button
              onClick={onSkipIntro}
              className="bg-white hover:bg-white/90 text-black font-bold px-8 py-3 rounded-full shadow-2xl border-2 border-black/10 tracking-wider text-sm uppercase"
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
              onClick={onSkipOutro}
              className="bg-white hover:bg-white/90 text-black font-bold px-8 py-3 rounded-full shadow-2xl border-2 border-black/10 tracking-wider text-sm uppercase"
            >
              Skip Outro
            </Button>
            {onNext && nextTitle && (
              <Button
                onClick={onNext}
                className="bg-[#ff4d4f] hover:bg-[#ff4d4f]/90 text-white font-bold px-8 py-3 rounded-full shadow-2xl tracking-wider text-sm uppercase"
              >
                Next Episode
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && !isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center cursor-pointer border-3 border-white/40 hover:bg-white/30 hover:scale-110 transition-all pointer-events-auto shadow-2xl"
              onClick={onTogglePlay}
              data-testid="video-center-button"
            >
              <Play className="h-12 w-12 text-white fill-white ml-1.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
