import { motion, AnimatePresence } from "framer-motion";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
  maxDuration?: number; // in milliseconds
  onComplete?: () => void;
}

export function FullscreenLoader({
  label = "Loading...",
  subLabel = "",
  maxDuration = 3000,
  onComplete,
}: FullscreenLoaderProps) {
  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0B0F19] via-[#0d1425] to-[#050a14]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {/* Animated logo/spinner */}
          <motion.div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-500/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {label && (
            <motion.h2
              className="text-2xl font-bold text-white tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {label}
            </motion.h2>
          )}
          
          {subLabel && (
            <motion.p
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {subLabel}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}