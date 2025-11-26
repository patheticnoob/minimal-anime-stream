import { motion } from "framer-motion";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
}

export function FullscreenLoader({
  label = "Loading...",
  subLabel = "",
}: FullscreenLoaderProps) {
  return (
    <div className="fullscreen-loader" role="status" aria-live="polite">
      <div className="loader-backdrop" />
      <motion.div
        className="loader-content"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="sharingan-loader"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          aria-hidden="true"
        >
          <div className="sharingan-eye">
            <div className="sharingan-pupil" />
            <div className="sharingan-tomoe tomoe-1" />
            <div className="sharingan-tomoe tomoe-2" />
            <div className="sharingan-tomoe tomoe-3" />
          </div>
        </motion.div>
        {label && <h2 className="loader-title">{label}</h2>}
        {subLabel && <p className="loader-subtitle">{subLabel}</p>}
      </motion.div>
    </div>
  );
}