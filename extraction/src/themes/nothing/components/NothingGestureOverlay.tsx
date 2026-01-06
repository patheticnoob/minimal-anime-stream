import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Sun, Volume2, RotateCcw, RotateCw } from "lucide-react";

interface NothingGestureOverlayProps {
  doubleTapAction: { side: 'left' | 'right'; seconds: number } | null;
  swipeAction: { type: 'volume' | 'brightness'; value: number } | null;
  centerAction: { type: 'play' | 'pause' } | null;
}

export function NothingGestureOverlay({ doubleTapAction, swipeAction, centerAction }: NothingGestureOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden rounded-[32px]">
      <AnimatePresence>
        {/* Double Tap Feedback - Left */}
        {doubleTapAction?.side === 'left' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            className="absolute left-0 top-0 bottom-0 w-1/3 flex flex-col items-center justify-center bg-white/5 backdrop-blur-[2px] rounded-r-[100px]"
          >
            <div className="flex flex-col items-center text-white drop-shadow-lg">
              <RotateCcw size={48} className="mb-2" />
              <span className="text-xl font-bold tracking-widest">{doubleTapAction.seconds}s</span>
            </div>
          </motion.div>
        )}

        {/* Double Tap Feedback - Right */}
        {doubleTapAction?.side === 'right' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="absolute right-0 top-0 bottom-0 w-1/3 flex flex-col items-center justify-center bg-white/5 backdrop-blur-[2px] rounded-l-[100px]"
          >
            <div className="flex flex-col items-center text-white drop-shadow-lg">
              <RotateCw size={48} className="mb-2" />
              <span className="text-xl font-bold tracking-widest">{doubleTapAction.seconds}s</span>
            </div>
          </motion.div>
        )}

        {/* Center Play/Pause Animation */}
        {centerAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-black/40 backdrop-blur-md p-8 rounded-full border border-white/10 shadow-2xl">
              {centerAction.type === 'play' ? (
                <Play size={64} className="text-white fill-white ml-2" />
              ) : (
                <Pause size={64} className="text-white fill-white" />
              )}
            </div>
          </motion.div>
        )}

        {/* Swipe Feedback (Volume/Brightness) */}
        {swipeAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-black/60 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 min-w-[140px] shadow-2xl">
              {swipeAction.type === 'volume' ? (
                <Volume2 size={40} className="text-white" />
              ) : (
                <Sun size={40} className="text-white" />
              )}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ff4d4f]" 
                  style={{ width: `${Math.min(100, Math.max(0, swipeAction.value * 100))}%` }}
                />
              </div>
              <span className="text-white font-mono text-lg font-bold">
                {Math.round(swipeAction.value * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}