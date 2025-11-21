import { motion } from "framer-motion";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
}

export function FullscreenLoader({
  label = "Loading anime...",
  subLabel = "Summoning episodes from another world",
}: FullscreenLoaderProps) {
  return (
    <div className="fullscreen-loader">
      <div className="loader-backdrop" />
      <motion.div 
        className="loader-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="loader-orb">
          <div className="loader-orb-inner">
            <span className="play-icon" />
          </div>
        </div>
        <h2 className="loader-title">{label}</h2>
        <p className="loader-subtitle">{subLabel}</p>
        <div className="progress-bar">
          <div className="progress-bar-fill" />
        </div>
        <div className="loader-dots">
          <span />
          <span />
          <span />
        </div>
      </motion.div>
    </div>
  );
}
