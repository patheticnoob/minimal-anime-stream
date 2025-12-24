import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
  maxDuration?: number; // in milliseconds
}

export function FullscreenLoader({
  label = "Loading...",
  subLabel = "",
  maxDuration = 3000,
}: FullscreenLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, maxDuration);

    return () => clearTimeout(timer);
  }, [maxDuration]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0F19]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Simple animated logo */}
        <motion.div
          className="relative w-20 h-20"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500" />
        </motion.div>

        {label && (
          <motion.h2
            className="text-xl font-bold text-white tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
  );
}