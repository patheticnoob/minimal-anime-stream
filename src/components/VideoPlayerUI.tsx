import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerUIProps {
  title: string;
  showControls: boolean;
  isPlaying: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  children: React.ReactNode;
}

export function VideoPlayerUI({
  title,
  showControls,
  isPlaying,
  onClose,
  onTogglePlay,
  children,
}: VideoPlayerUIProps) {
  return (
    <>
      {/* Close Button */}
      <motion.div
        className="absolute top-4 right-4 z-[100]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="bg-black/50 hover:bg-black/70 text-white"
          data-testid="close-button"
        >
          <X className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Title */}
      <motion.div
        className="absolute top-4 left-4 z-[90]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
      >
        <h2 className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded">
          {title}
        </h2>
      </motion.div>

      {children}

      {/* Center Play/Pause Button */}
      <AnimatePresence>
        {showControls && !isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="w-20 h-20 bg-white/15 backdrop-blur-lg rounded-full flex items-center justify-center cursor-pointer border-2 border-white/30 hover:bg-white/25 hover:scale-110 transition-all pointer-events-auto"
              onClick={onTogglePlay}
              data-testid="video-center-button"
            >
              <Play className="h-10 w-10 text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
